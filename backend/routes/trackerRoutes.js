const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const TrackerSegment = require("../models/TrackerSegment");
const TrackerStatus = require("../models/TrackerStatus");
const TrackerScreenshot = require("../models/TrackerScreenshot");
const TrackerUsage = require("../models/TrackerUsage");
const TrackerRule = require("../models/TrackerRule");
const { protect, managerOrAdmin } = require("../middleware/auth");
const { businessDate, splitAtBusinessMidnight } = require("../utils/trackerTime");
const { siteFromWindow, classify, CATEGORIES, SUGGESTED_UNPRODUCTIVE } = require("../utils/trackerApps");

const BUCKET_MS = 10 * 60 * 1000;
const clip = (value, max) => String(value || "").slice(0, max);

// Sent to the desktop agent on every heartbeat, so these can change
// without shipping a new agent build.
const TRACKER_CONFIG = {
  idleThresholdSeconds: Number(process.env.TRACKER_IDLE_SECONDS) || 300,
  heartbeatSeconds: 60,
  screenshotsEnabled: process.env.TRACKER_SCREENSHOTS !== "off",
  screenshotIntervalMinutes: Number(process.env.TRACKER_SCREENSHOT_INTERVAL_MINUTES) || 10,
};

// A tracker that hasn't reported for this long shows as Offline.
const OFFLINE_AFTER_MS = 3 * 60 * 1000;
// Same-kind segments closer than this are merged into one.
const MERGE_GAP_MS = 5 * 1000;
const MAX_SEGMENT_MS = 26 * 60 * 60 * 1000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 2 * 60 * 1000;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const screenshotUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "ebay-dashboard/tracker-screenshots",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =========================
// Desktop agent endpoints
// =========================

// LOGIN — issues a long-lived token that only works on /api/tracker/agent/*
// (enforced in middleware/auth.js), so a token saved on an employee's PC
// can't be used to open the rest of the dashboard API.
router.post("/agent/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status === "pending" || user.status === "rejected") {
      return res.status(403).json({ success: false, message: "Your account is not approved yet." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, scope: "tracker" },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    res.json({
      success: true,
      token,
      name: user.name,
      email: user.email,
      config: TRACKER_CONFIG,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.use("/agent", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email status");
    if (!user || user.status === "pending" || user.status === "rejected") {
      return res.status(401).json({ success: false, message: "Account not active" });
    }
    req.trackerUser = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function parseSegments(raw, now) {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(0, 500)
    .map((s) => ({
      start: new Date(s?.start),
      end: new Date(s?.end),
      state: s?.state,
      markedAsWork: s?.markedAsWork === true,
    }))
    .filter(
      (s) =>
        ["active", "idle"].includes(s.state) &&
        !isNaN(s.start) &&
        !isNaN(s.end) &&
        s.end > s.start &&
        s.end - s.start <= MAX_SEGMENT_MS &&
        s.end.getTime() <= now + MAX_CLOCK_SKEW_MS &&
        s.start.getTime() >= now - MAX_AGE_MS
    )
    // Idle reclassified as work is reported as active time.
    // Deliberately NOT sorted: the agent sends segments in the order it
    // learned them, and later ones must win (e.g. "that idle was work").
    .map((s) => (s.markedAsWork ? { ...s, state: "active" } : s));
}

// Write one segment. Newer reports win: anything already stored that
// overlaps it is trimmed away first. That's what lets the agent go back and
// turn the last few minutes of "active" into "idle" once the idle threshold
// is reached (idle is only detectable after the fact), or idle into
// "worked" when the employee says so.
async function applySegment(user, { start, end, date, state, markedAsWork }) {
  const overlapping = await TrackerSegment.find({
    user: user._id,
    start: { $lt: end },
    end: { $gt: start },
  });

  for (const doc of overlapping) {
    if (doc.start >= start && doc.end <= end) {
      await doc.deleteOne();
    } else if (doc.start < start && doc.end > end) {
      await TrackerSegment.create({
        user: doc.user,
        email: doc.email,
        name: doc.name,
        date: doc.date,
        start: end,
        end: doc.end,
        state: doc.state,
        markedAsWork: doc.markedAsWork,
      });
      doc.end = start;
      await doc.save();
    } else if (doc.start < start) {
      doc.end = start;
      await doc.save();
    } else {
      doc.start = end;
      await doc.save();
    }
  }

  const sameKind = { user: user._id, date, state, markedAsWork };

  const before = await TrackerSegment.findOne({
    ...sameKind,
    end: { $gte: new Date(start.getTime() - MERGE_GAP_MS), $lte: start },
  }).sort({ end: -1 });

  const after = await TrackerSegment.findOne({
    ...sameKind,
    start: { $gte: end, $lte: new Date(end.getTime() + MERGE_GAP_MS) },
  }).sort({ start: 1 });

  if (before) {
    before.end = after ? after.end : end;
    await before.save();
    if (after) await after.deleteOne();
  } else if (after) {
    after.start = start;
    await after.save();
  } else {
    await TrackerSegment.create({
      user: user._id,
      email: user.email,
      name: user.name,
      date,
      start,
      end,
      state,
      markedAsWork,
    });
  }
}

// HEARTBEAT — the agent sends everything since its last successful
// heartbeat (it queues offline), plus its current state.
router.post("/agent/heartbeat", async (req, res) => {
  try {
    const user = req.trackerUser;
    const now = Date.now();

    for (const segment of parseSegments(req.body.segments, now)) {
      for (const piece of splitAtBusinessMidnight(segment.start, segment.end)) {
        await applySegment(user, { ...segment, ...piece });
      }
    }

    // App usage: full totals per 10-minute bucket, so a plain overwrite
    // is safe even if this heartbeat is a retry.
    const usageOps = (Array.isArray(req.body.usage) ? req.body.usage : [])
      .slice(0, 500)
      .map((u) => ({ bucket: new Date(Number(u?.bucket)), app: clip(u?.app, 120), title: clip(u?.title, 300), seconds: Number(u?.seconds) }))
      .filter(
        (u) =>
          u.app &&
          !isNaN(u.bucket) &&
          u.bucket.getTime() % BUCKET_MS === 0 &&
          u.bucket.getTime() <= now + MAX_CLOCK_SKEW_MS &&
          u.bucket.getTime() >= now - MAX_AGE_MS &&
          u.seconds >= 0 &&
          u.seconds <= BUCKET_MS / 1000
      )
      .map((u) => ({
        updateOne: {
          filter: { user: user._id, bucket: u.bucket, app: u.app, title: u.title },
          update: {
            $set: {
              email: user.email,
              name: user.name,
              date: businessDate(u.bucket),
              site: siteFromWindow(u.app, u.title),
              seconds: Math.round(u.seconds),
            },
          },
          upsert: true,
        },
      }));
    if (usageOps.length) await TrackerUsage.bulkWrite(usageOps, { ordered: false });

    const state = ["active", "idle", "stopped"].includes(req.body.state) ? req.body.state : "active";
    const device = req.body.device || {};
    const current = state === "active" && req.body.current ? req.body.current : null;
    const existing = await TrackerStatus.findOne({ user: user._id });

    let sessionStartedAt = existing?.sessionStartedAt || null;
    if (state === "stopped") sessionStartedAt = null;
    else if (!sessionStartedAt || existing.state === "stopped") sessionStartedAt = new Date(now);

    await TrackerStatus.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        email: user.email,
        name: user.name,
        state,
        lastSeenAt: new Date(now),
        sessionStartedAt,
        currentApp: clip(current?.app, 120),
        currentTitle: clip(current?.title, 300),
        currentSite: current ? siteFromWindow(current.app, current.title) : null,
        device: {
          os: String(device.os || "").slice(0, 60),
          hostname: String(device.hostname || "").slice(0, 100),
          appVersion: String(device.appVersion || "").slice(0, 20),
        },
      },
      { upsert: true }
    );

    res.json({ success: true, config: TRACKER_CONFIG });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TODAY — the employee's own totals, shown in the agent window.
router.get("/agent/today", async (req, res) => {
  try {
    const date = businessDate(new Date());
    const [totals] = await TrackerSegment.aggregate(
      totalsPipeline({ user: req.trackerUser._id, date })
    );

    res.json({
      success: true,
      date,
      activeMs: totals?.activeMs || 0,
      idleMs: totals?.idleMs || 0,
      config: TRACKER_CONFIG,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SCREENSHOT UPLOAD
router.post(
  "/agent/screenshot",
  (req, res, next) => {
    screenshotUpload.single("screenshot")(req, res, (error) => {
      if (error) return res.status(400).json({ success: false, message: error.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No screenshot uploaded" });
      }

      const now = Date.now();
      let takenAt = new Date(req.body.takenAt);
      if (isNaN(takenAt) || takenAt.getTime() > now + MAX_CLOCK_SKEW_MS || takenAt.getTime() < now - MAX_AGE_MS) {
        takenAt = new Date(now);
      }

      const user = req.trackerUser;
      await TrackerScreenshot.create({
        user: user._id,
        email: user.email,
        name: user.name,
        date: businessDate(takenAt),
        takenAt,
        screenIndex: Number(req.body.screenIndex) || 0,
        app: clip(req.body.app, 120),
        title: clip(req.body.title, 300),
        url: req.file.path,
        publicId: req.file.filename || "",
      });

      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// =========================
// Dashboard endpoints (admin / manager)
// =========================

const dashboard = express.Router();
dashboard.use(protect, managerOrAdmin);

const msOf = { $subtract: ["$end", "$start"] };

function totalsPipeline(match) {
  return [
    { $match: match },
    {
      $group: {
        _id: { email: "$email", date: "$date" },
        name: { $last: "$name" },
        activeMs: { $sum: { $cond: [{ $eq: ["$state", "active"] }, msOf, 0] } },
        idleMs: { $sum: { $cond: [{ $eq: ["$state", "idle"] }, msOf, 0] } },
        workedIdleMs: { $sum: { $cond: ["$markedAsWork", msOf, 0] } },
        firstStart: { $min: "$start" },
        lastEnd: { $max: "$end" },
      },
    },
    {
      $project: {
        _id: 0,
        email: "$_id.email",
        date: "$_id.date",
        name: 1,
        activeMs: 1,
        idleMs: 1,
        workedIdleMs: 1,
        firstStart: 1,
        lastEnd: 1,
      },
    },
    { $sort: { date: -1, name: 1 } },
  ];
}

// Active time per (email, date, app, site), already summed.
function usageByApp(match) {
  return TrackerUsage.aggregate([
    { $match: match },
    {
      $group: {
        _id: { email: "$email", date: "$date", app: "$app", site: "$site" },
        name: { $last: "$name" },
        seconds: { $sum: "$seconds" },
      },
    },
  ]);
}

// Unproductive milliseconds per "email|date", using the current rules.
async function unproductiveByUserDate(match) {
  const [rows, rules] = await Promise.all([usageByApp(match), TrackerRule.find().lean()]);
  const out = new Map();
  for (const r of rows) {
    if (classify(rules, r._id.app, r._id.site) !== "unproductive") continue;
    const key = `${r._id.email}|${r._id.date}`;
    out.set(key, (out.get(key) || 0) + r.seconds * 1000);
  }
  return out;
}

// LIVE BOARD — everyone, with their tracker state and today's totals.
dashboard.get("/live", async (req, res) => {
  try {
    const today = businessDate(new Date());
    const [users, statuses, totals, unproductive] = await Promise.all([
      User.find({ status: { $nin: ["pending", "rejected"] } }).select("name email role"),
      TrackerStatus.find(),
      TrackerSegment.aggregate(totalsPipeline({ date: today })),
      unproductiveByUserDate({ date: today }),
    ]);

    const now = Date.now();
    const statusByEmail = new Map(statuses.map((s) => [s.email, s]));
    const totalsByEmail = new Map(totals.map((t) => [t.email, t]));

    const people = users.map((u) => {
      const s = statusByEmail.get(u.email);
      const t = totalsByEmail.get(u.email);
      const online = s && s.state !== "stopped" && s.lastSeenAt && now - s.lastSeenAt.getTime() < OFFLINE_AFTER_MS;

      return {
        email: u.email,
        name: u.name,
        role: u.role,
        state: online ? s.state : "offline",
        lastSeenAt: s?.lastSeenAt || null,
        sessionStartedAt: online ? s.sessionStartedAt : null,
        currentApp: online && s.state === "active" ? s.currentApp : "",
        currentSite: online && s.state === "active" ? s.currentSite : null,
        currentTitle: online && s.state === "active" ? s.currentTitle : "",
        device: s?.device || null,
        hasTracker: Boolean(s),
        activeMs: t?.activeMs || 0,
        idleMs: t?.idleMs || 0,
        workedIdleMs: t?.workedIdleMs || 0,
        unproductiveMs: unproductive.get(`${u.email}|${today}`) || 0,
      };
    });

    res.json({ success: true, date: today, people, config: TRACKER_CONFIG });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ONE DAY — every segment (for the timeline) plus screenshot counts.
dashboard.get("/day", async (req, res) => {
  try {
    const date = DATE_RE.test(req.query.date || "") ? req.query.date : businessDate(new Date());

    const [segments, totals, shotCounts, unproductive] = await Promise.all([
      TrackerSegment.find({ date })
        .select("email name start end state markedAsWork -_id")
        .sort({ start: 1 }),
      TrackerSegment.aggregate(totalsPipeline({ date })),
      TrackerScreenshot.aggregate([
        { $match: { date } },
        { $group: { _id: "$email", count: { $sum: 1 } } },
      ]),
      unproductiveByUserDate({ date }),
    ]);

    res.json({
      success: true,
      date,
      segments,
      totals: totals.map((t) => ({ ...t, unproductiveMs: unproductive.get(`${t.email}|${t.date}`) || 0 })),
      screenshotCounts: Object.fromEntries(shotCounts.map((c) => [c._id, c.count])),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function parseRange(req, res) {
  const { from, to } = req.query;
  if (!DATE_RE.test(from || "") || !DATE_RE.test(to || "") || from > to) {
    res.status(400).json({ success: false, message: "Give from and to as YYYY-MM-DD" });
    return null;
  }
  if ((new Date(to) - new Date(from)) / 86400000 > 93) {
    res.status(400).json({ success: false, message: "Range can be at most 3 months" });
    return null;
  }
  return { from, to };
}

// REPORT — per employee per day totals over a date range (max ~3 months).
dashboard.get("/report", async (req, res) => {
  try {
    const range = parseRange(req, res);
    if (!range) return;
    const match = { date: { $gte: range.from, $lte: range.to } };

    const [rows, unproductive] = await Promise.all([
      TrackerSegment.aggregate(totalsPipeline(match)),
      unproductiveByUserDate(match),
    ]);

    res.json({
      success: true,
      ...range,
      rows: rows.map((r) => ({ ...r, unproductiveMs: unproductive.get(`${r.email}|${r.date}`) || 0 })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// APPS & WEBSITES — time per app and per website over a range, optionally
// for one employee, each labelled with its productivity category.
dashboard.get("/usage", async (req, res) => {
  try {
    const range = parseRange(req, res);
    if (!range) return;

    const match = { date: { $gte: range.from, $lte: range.to } };
    if (typeof req.query.email === "string" && req.query.email) match.email = req.query.email;

    const [rows, titleRows, rules] = await Promise.all([
      usageByApp(match),
      TrackerUsage.aggregate([
        { $match: match },
        { $group: { _id: { app: "$app", title: "$title" }, seconds: { $sum: "$seconds" } } },
        { $sort: { seconds: -1 } },
        { $limit: 2000 },
      ]),
      TrackerRule.find().lean(),
    ]);

    const apps = new Map();
    const sites = new Map();
    for (const r of rows) {
      const { app, site } = r._id;
      const a = apps.get(app) || { app, seconds: 0 };
      a.seconds += r.seconds;
      apps.set(app, a);
      if (site) {
        const s = sites.get(site) || { site, seconds: 0 };
        s.seconds += r.seconds;
        sites.set(site, s);
      }
    }

    // Top window titles per app, for drill-down.
    const titles = new Map();
    for (const t of titleRows) {
      const list = titles.get(t._id.app) || [];
      if (list.length < 8 && t._id.title) list.push({ title: t._id.title, seconds: t.seconds });
      titles.set(t._id.app, list);
    }

    res.json({
      success: true,
      ...range,
      apps: [...apps.values()]
        .map((a) => ({ ...a, category: classify(rules, a.app, null), topTitles: titles.get(a.app) || [] }))
        .sort((x, y) => y.seconds - x.seconds),
      sites: [...sites.values()]
        .map((s) => ({ ...s, category: classify(rules, null, s.site) }))
        .sort((x, y) => y.seconds - x.seconds),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PRODUCTIVITY RULES
dashboard.get("/rules", async (req, res) => {
  try {
    const rules = await TrackerRule.find().sort({ category: 1, pattern: 1 });
    res.json({ success: true, rules, suggested: SUGGESTED_UNPRODUCTIVE });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set the category for a pattern (create or update). "neutral" removes the
// rule, since unmatched apps are neutral anyway.
dashboard.post("/rules", async (req, res) => {
  try {
    const pattern = clip(req.body.pattern, 120).trim();
    const { category } = req.body;
    if (!pattern || !CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: "Give a pattern and a valid category" });
    }

    const key = pattern.toLowerCase();
    if (category === "neutral") {
      await TrackerRule.deleteOne({ key });
    } else {
      await TrackerRule.findOneAndUpdate(
        { key },
        { pattern, key, category, updatedBy: req.user.email || "" },
        { upsert: true, runValidators: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

dashboard.post("/rules/suggested", async (req, res) => {
  try {
    await TrackerRule.bulkWrite(
      SUGGESTED_UNPRODUCTIVE.map((pattern) => ({
        updateOne: {
          filter: { key: pattern.toLowerCase() },
          update: { $setOnInsert: { pattern, key: pattern.toLowerCase(), category: "unproductive", updatedBy: req.user.email || "" } },
          upsert: true,
        },
      }))
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

dashboard.delete("/rules/:id", async (req, res) => {
  try {
    await TrackerRule.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SCREENSHOTS for one day — one employee, or everyone if no email given.
dashboard.get("/screenshots", async (req, res) => {
  try {
    const { email, date } = req.query;
    if (!DATE_RE.test(date || "")) {
      return res.status(400).json({ success: false, message: "Give a date" });
    }

    const filter = { date };
    if (typeof email === "string" && email) filter.email = email;

    const screenshots = await TrackerScreenshot.find(filter)
      .select("email name takenAt screenIndex app title url")
      .sort({ takenAt: 1 })
      .limit(2000);

    res.json({ success: true, screenshots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.use("/", dashboard);

module.exports = router;
module.exports.TRACKER_CONFIG = TRACKER_CONFIG;
