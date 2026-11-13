import { useCallback, useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Menu,
  X,
  Activity,
  Coffee,
  PowerOff,
  Monitor,
  Download,
  Image as ImageIcon,
  Search,
  FileDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AppWindow,
  Globe,
  Trash2,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ManagerSidebar from "../components/ManagerSidebar";
import { apiFetch } from "../api";
import useLiveRefresh from "../useLiveRefresh";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Amber: #F59E0B  Red: #EF4444  Dark navy: #0F172A
*/

const FONT_LINK_ID = "ebay-dash-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap";
  document.head.appendChild(link);
}

const MONO = { fontFamily: "'JetBrains Mono', monospace" };
const SORA = { fontFamily: "Sora, sans-serif" };

// All tracker dates/times are on the team's business clock (see
// backend/utils/trackerTime.js).
const TZ = "Asia/Kolkata";
const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });
const shiftDate = (date, days) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const fmtTime = (value) =>
  new Date(value).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const fmtDay = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function fmtDur(ms) {
  const mins = Math.max(0, Math.round((ms || 0) / 60000));
  const h = Math.floor(mins / 60);
  return h ? `${h}h ${String(mins % 60).padStart(2, "0")}m` : `${mins}m`;
}

// Productive = active time minus time in apps/sites labelled unproductive,
// as a share of all tracked time.
const productivity = (active, idle, unproductive = 0) =>
  active + idle > 0 ? Math.round((Math.max(0, active - unproductive) / (active + idle)) * 100) : null;

// Timeline marks. Idle also gets a stripe texture so it isn't told apart
// from active by colour alone (green/amber are close for some colour-blind
// readers).
const SEGMENT_STYLE = {
  active: { background: "#16A34A" },
  worked: { background: "#3B82F6" },
  idle: {
    background: "#F59E0B",
    backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 3px, transparent 3px 7px)",
  },
};

const STATE_META = {
  active: { label: "Active", icon: Activity, pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  idle: { label: "Idle", icon: Coffee, pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  offline: { label: "Offline", icon: PowerOff, pill: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};

const CATEGORY_META = {
  productive: { label: "Productive", on: "bg-emerald-600 text-white border-emerald-600" },
  neutral: { label: "Neutral", on: "bg-slate-600 text-white border-slate-600" },
  unproductive: { label: "Unproductive", on: "bg-red-600 text-white border-red-600" },
};

const DOWNLOADS = [
  { label: "Windows", url: import.meta.env.VITE_TRACKER_WINDOWS_URL },
  { label: "Mac", url: import.meta.env.VITE_TRACKER_MAC_URL },
].filter((d) => d.url);

const inputCls = "border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-lg text-sm";

function StatePill({ state }) {
  const meta = STATE_META[state] || STATE_META.offline;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.pill}`}>
      <Icon size={12} className="stroke-[2.5]" />
      {meta.label}
    </span>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
      {[
        ["active", "Active"],
        ["worked", "Idle marked as work"],
        ["idle", "Idle"],
      ].map(([key, label]) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-[4px]" style={SEGMENT_STYLE[key]} />
          {label}
        </span>
      ))}
    </div>
  );
}

function Metric({ label, value, tone = "text-slate-800" }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-bold tabular-nums ${tone}`} style={MONO}>{value}</p>
    </div>
  );
}

const nowUsing = (p) => [p.currentApp, p.currentSite].filter(Boolean).join(" · ");

// ---------- Live ----------

function LiveTab({ people, search }) {
  const order = { active: 0, idle: 1, offline: 2 };
  const shown = people
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => order[a.state] - order[b.state] || b.activeMs - a.activeMs || a.name.localeCompare(b.name));

  if (shown.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-10">No employees match.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {shown.map((p) => {
        const pct = productivity(p.activeMs, p.idleMs, p.unproductiveMs);
        const tracked = p.activeMs + p.idleMs;
        return (
          <div key={p.email} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {p.state !== "offline" && p.sessionStartedAt
                    ? `Tracking since ${fmtTime(p.sessionStartedAt)}`
                    : p.lastSeenAt
                      ? `Last seen ${fmtDay(new Date(p.lastSeenAt).toLocaleDateString("en-CA", { timeZone: TZ }))}, ${fmtTime(p.lastSeenAt)}`
                      : p.hasTracker
                        ? "Not tracking"
                        : "Tracker not installed"}
                </p>
              </div>
              <StatePill state={p.state} />
            </div>

            {p.state === "active" && nowUsing(p) && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 truncate" title={p.currentTitle}>
                <AppWindow size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">Using {nowUsing(p)}</span>
              </p>
            )}

            <div className="grid grid-cols-4 gap-2 mt-3">
              <Metric label="Active" value={fmtDur(p.activeMs)} />
              <Metric label="Unprod." value={fmtDur(p.unproductiveMs)} tone={p.unproductiveMs ? "text-red-600" : "text-slate-800"} />
              <Metric label="Idle" value={fmtDur(p.idleMs)} />
              <Metric label="Productive" value={pct === null ? "–" : `${pct}%`} />
            </div>

            {tracked > 0 && (
              <div className="flex h-2 mt-3 rounded-full overflow-hidden gap-[2px] bg-white" aria-hidden="true">
                <div style={{ ...SEGMENT_STYLE.active, width: `${(Math.max(0, p.activeMs - p.unproductiveMs) / tracked) * 100}%` }} />
                {p.unproductiveMs > 0 && <div style={{ background: "#DC2626", width: `${(p.unproductiveMs / tracked) * 100}%` }} />}
                <div style={{ ...SEGMENT_STYLE.idle, flex: 1 }} />
              </div>
            )}

            {p.device?.hostname && (
              <p className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400 truncate">
                <Monitor size={11} className="shrink-0" />
                {p.device.hostname} · {p.device.os?.startsWith("darwin") ? "Mac" : p.device.os?.startsWith("win32") ? "Windows" : p.device.os}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Timeline ----------

function TimelineTab({ day, search, onOpenScreenshots }) {
  const [hover, setHover] = useState(null);

  const rows = useMemo(() => {
    if (!day) return [];
    const byEmail = new Map();
    day.totals.forEach((t) => byEmail.set(t.email, { ...t, segments: [] }));
    day.segments.forEach((s) => byEmail.get(s.email)?.segments.push(s));
    return [...byEmail.values()]
      .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [day, search]);

  // Axis: whole hours around the day's activity, at least 9:00–18:00 IST.
  const axis = useMemo(() => {
    if (!day) return null;
    const midnight = Date.parse(`${day.date}T00:00:00+05:30`);
    const HOUR = 3600000;
    let first = 9;
    let last = 18;
    day.segments.forEach((s) => {
      first = Math.min(first, Math.floor((Date.parse(s.start) - midnight) / HOUR));
      last = Math.max(last, Math.ceil((Date.parse(s.end) - midnight) / HOUR));
    });
    first = Math.max(0, first);
    last = Math.min(24, Math.max(last, first + 1));
    const hours = [];
    const step = last - first > 12 ? 2 : 1;
    for (let h = first; h <= last; h += step) hours.push(h);
    return { start: midnight + first * HOUR, end: midnight + last * HOUR, first, last, hours };
  }, [day]);

  if (!day) return <p className="text-center text-sm text-slate-400 py-10">Loading…</p>;
  if (rows.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-10">No tracked time on {fmtDay(day.date)}.</p>;
  }

  const pct = (t) => ((Date.parse(t) - axis.start) / (axis.end - axis.start)) * 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Legend />
        <span className="text-xs text-slate-400">Times in IST</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="flex">
            <div className="w-56 shrink-0" />
            <div className="relative flex-1 h-5">
              {axis.hours.map((h) => (
                <span
                  key={h}
                  className="absolute -translate-x-1/2 text-[10px] font-semibold text-slate-400 tabular-nums"
                  style={{ left: `${((h - axis.first) / (axis.last - axis.first)) * 100}%` }}
                >
                  {String(h % 24).padStart(2, "0")}:00
                </span>
              ))}
            </div>
          </div>

          {rows.map((r) => {
            const shots = day.screenshotCounts[r.email] || 0;
            return (
              <div key={r.email} className="flex items-center py-2.5 border-t border-slate-100">
                <div className="w-56 shrink-0 pr-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{r.name}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums" style={MONO}>
                    {fmtDur(r.activeMs)} active · {fmtDur(r.idleMs)} idle
                  </p>
                  {r.unproductiveMs > 0 && (
                    <p className="text-[11px] text-red-600 tabular-nums" style={MONO}>{fmtDur(r.unproductiveMs)} unproductive</p>
                  )}
                  {shots > 0 && (
                    <button
                      onClick={() => onOpenScreenshots(r.email)}
                      className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      <ImageIcon size={11} />
                      {shots} screenshot{shots === 1 ? "" : "s"}
                    </button>
                  )}
                </div>

                <div className="relative flex-1 h-7 rounded-md bg-slate-50">
                  {axis.hours.map((h) => (
                    <span
                      key={h}
                      className="absolute top-0 bottom-0 w-px bg-slate-200/70"
                      style={{ left: `${((h - axis.first) / (axis.last - axis.first)) * 100}%` }}
                    />
                  ))}
                  {r.segments.map((s, i) => {
                    const kind = s.markedAsWork ? "worked" : s.state;
                    const left = pct(s.start);
                    const width = pct(s.end) - left;
                    const label = kind === "worked" ? "Idle marked as work" : kind === "active" ? "Active" : "Idle";
                    return (
                      <div
                        key={i}
                        className="absolute top-1 bottom-1 rounded-[4px] cursor-default"
                        style={{
                          ...SEGMENT_STYLE[kind],
                          left: `${left}%`,
                          // 2px surface gap between neighbouring segments.
                          width: `max(2px, calc(${width}% - 2px))`,
                        }}
                        onMouseEnter={(e) =>
                          setHover({
                            x: e.clientX,
                            y: e.currentTarget.getBoundingClientRect().top,
                            text: `${label} · ${fmtTime(s.start)}–${fmtTime(s.end)} · ${fmtDur(Date.parse(s.end) - Date.parse(s.start))}`,
                            name: r.name,
                          })
                        }
                        onMouseLeave={() => setHover(null)}
                        aria-label={`${r.name}: ${label} ${fmtTime(s.start)} to ${fmtTime(s.end)}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hover && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs shadow-lg"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          <p className="font-bold">{hover.name}</p>
          <p className="tabular-nums">{hover.text}</p>
        </div>
      )}
    </div>
  );
}

// ---------- Screenshots ----------

// Cloudinary delivers a resized copy when a transformation is put after
// /upload/ — much lighter for the grid.
const thumb = (url) => url.replace("/upload/", "/upload/w_480,q_auto/");

function ScreenshotsTab({ shots, people, search }) {
  const [openIndex, setOpenIndex] = useState(null);

  const visible = useMemo(
    () => (shots || []).filter((s) => !search || (s.name || "").toLowerCase().includes(search.toLowerCase())),
    [shots, search]
  );

  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((s, index) => {
      if (!map.has(s.email)) map.set(s.email, { email: s.email, name: s.name, items: [] });
      map.get(s.email).items.push({ ...s, index });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [visible]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => Math.min(visible.length - 1, i + 1));
      if (e.key === "ArrowLeft") setOpenIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, visible.length]);

  if (shots === null) return <p className="text-center text-sm text-slate-400 py-10">Loading…</p>;
  if (visible.length === 0) return <p className="text-center text-sm text-slate-400 py-10">No screenshots for this day.</p>;

  const open = openIndex !== null ? visible[openIndex] : null;
  const caption = (s) => [s.app, s.title && s.title !== s.app ? s.title : null].filter(Boolean).join(" — ");

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.email} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800" style={SORA}>{g.name || people.find((p) => p.email === g.email)?.name || g.email}</h3>
            <span className="text-xs text-slate-400">{g.items.length} screenshot{g.items.length === 1 ? "" : "s"} · times in IST</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {g.items.map((s) => (
              <button key={s._id} onClick={() => setOpenIndex(s.index)} className="text-left group min-w-0">
                <img
                  src={thumb(s.url)}
                  alt={`Screenshot at ${fmtTime(s.takenAt)}`}
                  loading="lazy"
                  className="w-full aspect-video object-cover rounded-lg border border-slate-200 group-hover:border-amber-400"
                />
                <p className="mt-1 text-xs font-bold text-slate-700 tabular-nums">
                  {fmtTime(s.takenAt)}
                  {s.screenIndex > 0 && <span className="font-semibold text-slate-400"> · screen {s.screenIndex + 1}</span>}
                </p>
                {caption(s) && <p className="text-[11px] text-slate-500 truncate" title={caption(s)}>{caption(s)}</p>}
              </button>
            ))}
          </div>
        </div>
      ))}

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setOpenIndex(null)}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenIndex(null); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 w-full max-w-7xl justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenIndex((i) => Math.max(0, i - 1))}
              disabled={openIndex === 0}
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <img src={open.url} alt="" className="max-w-[calc(100%-6rem)] max-h-[80vh] rounded-lg" />
            <button
              onClick={() => setOpenIndex((i) => Math.min(visible.length - 1, i + 1))}
              disabled={openIndex === visible.length - 1}
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="mt-3 text-center text-white max-w-3xl px-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold">{open.name} · {fmtTime(open.takenAt)} IST</p>
            {caption(open) && <p className="text-xs text-white/70 mt-0.5">{caption(open)}</p>}
            <p className="text-[11px] text-white/40 mt-1">{openIndex + 1} of {visible.length} · ← → to browse</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Apps & Websites ----------

function CategoryPicker({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
      {Object.entries(CATEGORY_META).map(([key, meta]) => (
        <button
          key={key}
          onClick={() => value !== key && onChange(key)}
          className={`px-2 py-1 text-[11px] font-bold border-l first:border-l-0 transition-colors ${
            value === key ? meta.on : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
          aria-pressed={value === key}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}

function UsageTable({ title, icon: Icon, rows, nameKey, onCategory, expandable }) {
  const [expanded, setExpanded] = useState(null);
  const total = rows.reduce((s, r) => s + r.seconds, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />
        <h3 className="text-sm font-bold text-slate-800" style={SORA}>{title}</h3>
        <span className="ml-auto text-xs text-slate-400 tabular-nums" style={MONO}>{fmtDur(total * 1000)} total</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">Nothing recorded.</p>
      ) : (
        <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
          {rows.map((r) => {
            const name = r[nameKey];
            const share = total ? (r.seconds / total) * 100 : 0;
            const isOpen = expanded === name;
            return (
              <li key={name} className="px-5 py-2.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <button
                    onClick={() => expandable && setExpanded(isOpen ? null : name)}
                    className={`flex items-center gap-1 min-w-0 flex-1 text-left ${expandable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {expandable && (
                      <ChevronDown size={13} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                    )}
                    <span className="text-sm font-semibold text-slate-800 truncate" title={name}>{name}</span>
                  </button>
                  <span className="text-sm font-bold text-slate-800 tabular-nums w-20 text-right" style={MONO}>{fmtDur(r.seconds * 1000)}</span>
                  <CategoryPicker value={r.category} onChange={(c) => onCategory(name, c)} />
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(1, share)}%`,
                      background: r.category === "unproductive" ? "#DC2626" : r.category === "productive" ? "#16A34A" : "#64748B",
                    }}
                  />
                </div>
                {isOpen && r.topTitles?.length > 0 && (
                  <ul className="mt-2 ml-4 flex flex-col gap-1">
                    {r.topTitles.map((t) => (
                      <li key={t.title} className="flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span className="truncate" title={t.title}>{t.title}</span>
                        <span className="tabular-nums shrink-0" style={MONO}>{fmtDur(t.seconds * 1000)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RulesPanel({ rules, suggested, onChange }) {
  const [pattern, setPattern] = useState("");
  const [category, setCategory] = useState("unproductive");

  const save = async (p, c) => {
    const res = await apiFetch("/api/tracker/rules", { method: "POST", body: { pattern: p, category: c } });
    const data = await res.json();
    if (!data.success) toast.error(data.message || "Failed to save rule");
    onChange();
  };

  const addSuggested = async () => {
    const res = await apiFetch("/api/tracker/rules/suggested", { method: "POST", body: {} });
    const data = await res.json();
    if (data.success) toast.success("Added common unproductive apps & sites");
    onChange();
  };

  const remove = async (rule) => {
    await apiFetch(`/api/tracker/rules/${rule._id}`, { method: "DELETE" });
    onChange();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800" style={SORA}>Productivity rules</h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            An app or website whose name contains a rule's text gets that label. Unproductive time is subtracted from
            productive time everywhere. Anything without a rule is neutral.
          </p>
        </div>
        {suggested?.length > 0 && (
          <button onClick={addSuggested} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">
            Add common unproductive ({suggested.slice(0, 3).join(", ")}…)
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!pattern.trim()) return;
          save(pattern.trim(), category);
          setPattern("");
        }}
        className="flex flex-wrap items-center gap-2 mb-4"
      >
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="App or site name, e.g. Netflix"
          className="flex-1 min-w-[180px] border border-slate-200 bg-slate-50 px-3 py-2 rounded-xl text-sm outline-none focus:border-[#F4B400]"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-slate-200 bg-slate-50 px-3 py-2 rounded-xl text-sm">
          <option value="unproductive">Unproductive</option>
          <option value="productive">Productive</option>
        </select>
        <button type="submit" className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A]" style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}>
          <Plus size={14} />
          Add rule
        </button>
      </form>

      {rules.length === 0 ? (
        <p className="text-sm text-slate-400">No rules yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {rules.map((r) => (
            <span
              key={r._id}
              className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg text-xs font-bold border ${
                r.category === "unproductive" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {r.pattern}
              <span className="font-semibold opacity-70">· {CATEGORY_META[r.category].label}</span>
              <button onClick={() => remove(r)} className="p-0.5 rounded hover:bg-black/5" title="Remove rule">
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function UsageTab({ usage, rules, onReload }) {
  const setCategory = async (name, category) => {
    const res = await apiFetch("/api/tracker/rules", { method: "POST", body: { pattern: name, category } });
    const data = await res.json();
    if (!data.success) toast.error(data.message || "Failed to save");
    onReload();
  };

  if (!usage || !rules) return <p className="text-center text-sm text-slate-400 py-10">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UsageTable title="Apps" icon={AppWindow} rows={usage.apps} nameKey="app" onCategory={setCategory} expandable />
        <UsageTable title="Websites (from browser tab titles)" icon={Globe} rows={usage.sites} nameKey="site" onCategory={setCategory} />
      </div>
      <RulesPanel rules={rules.rules} suggested={rules.suggested} onChange={onReload} />
    </div>
  );
}

// ---------- Reports ----------

function ReportTab({ report, search }) {
  const summary = useMemo(() => {
    if (!report) return [];
    const byEmail = new Map();
    report.rows.forEach((r) => {
      const s = byEmail.get(r.email) || { email: r.email, name: r.name, activeMs: 0, idleMs: 0, workedIdleMs: 0, unproductiveMs: 0, days: 0 };
      s.activeMs += r.activeMs;
      s.idleMs += r.idleMs;
      s.workedIdleMs += r.workedIdleMs;
      s.unproductiveMs += r.unproductiveMs || 0;
      s.days += 1;
      byEmail.set(r.email, s);
    });
    return [...byEmail.values()]
      .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.activeMs - a.activeMs);
  }, [report, search]);

  const exportCsv = () => {
    const lines = [["Date", "Employee", "Email", "Active (h)", "Unproductive (h)", "Productive (h)", "Idle (h)", "Idle marked as work (h)", "First activity (IST)", "Last activity (IST)"]];
    report.rows.forEach((r) =>
      lines.push([
        r.date,
        r.name,
        r.email,
        (r.activeMs / 3600000).toFixed(2),
        ((r.unproductiveMs || 0) / 3600000).toFixed(2),
        (Math.max(0, r.activeMs - (r.unproductiveMs || 0)) / 3600000).toFixed(2),
        (r.idleMs / 3600000).toFixed(2),
        (r.workedIdleMs / 3600000).toFixed(2),
        fmtTime(r.firstStart),
        fmtTime(r.lastEnd),
      ])
    );
    const csv = lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `time-report-${report.from}-to-${report.to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!report) return <p className="text-center text-sm text-slate-400 py-10">Loading…</p>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {fmtDay(report.from)} – {fmtDay(report.to)}
        </p>
        <button
          onClick={exportCsv}
          disabled={report.rows.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
        >
          <FileDown size={14} />
          Export CSV (per day)
        </button>
      </div>
      {summary.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-10">No tracked time in this range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="text-left px-5 py-2.5">Employee</th>
                <th className="text-right px-4 py-2.5">Days</th>
                <th className="text-right px-4 py-2.5">Active</th>
                <th className="text-right px-4 py-2.5">Unproductive</th>
                <th className="text-right px-4 py-2.5">Idle</th>
                <th className="text-right px-4 py-2.5">Avg active / day</th>
                <th className="text-right px-5 py-2.5">Productive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.map((s) => {
                const pct = productivity(s.activeMs, s.idleMs, s.unproductiveMs);
                return (
                  <tr key={s.email}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{s.name}</p>
                      {s.workedIdleMs > 0 && (
                        <p className="text-[11px] text-slate-400">incl. {fmtDur(s.workedIdleMs)} idle marked as work</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600" style={MONO}>{s.days}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800" style={MONO}>{fmtDur(s.activeMs)}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${s.unproductiveMs ? "text-red-600 font-semibold" : "text-slate-600"}`} style={MONO}>{fmtDur(s.unproductiveMs)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600" style={MONO}>{fmtDur(s.idleMs)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600" style={MONO}>{fmtDur(s.activeMs / s.days)}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-800" style={MONO}>{pct === null ? "–" : `${pct}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- Page ----------

const TABS = [
  ["live", "Live"],
  ["timeline", "Timeline"],
  ["screenshots", "Screenshots"],
  ["usage", "Apps & Websites"],
  ["reports", "Reports"],
];

export default function TimeTracker() {
  const role = localStorage.getItem("role");
  const allowed = role === "admin" || role === "manager";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("live");
  const [search, setSearch] = useState("");
  // Screenshots and Apps tabs: one employee, or "" for everyone.
  const [person, setPerson] = useState("");

  const [live, setLive] = useState(null);
  const [date, setDate] = useState(todayIST);
  const [day, setDay] = useState(null);
  const [shots, setShots] = useState(null);
  const [from, setFrom] = useState(() => shiftDate(todayIST(), -6));
  const [to, setTo] = useState(todayIST);
  const [report, setReport] = useState(null);
  const [usage, setUsage] = useState(null);
  const [rules, setRules] = useState(null);

  const getJson = async (url) => {
    const res = await apiFetch(url);
    return res.json();
  };

  const loadLive = useCallback(async () => {
    try {
      const data = await getJson("/api/tracker/live");
      if (data.success) setLive(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadDay = async () => {
    try {
      const data = await getJson(`/api/tracker/day?date=${date}`);
      if (data.success) setDay(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadShots = async () => {
    try {
      const data = await getJson(`/api/tracker/screenshots?date=${date}${person ? `&email=${encodeURIComponent(person)}` : ""}`);
      setShots(data.success ? data.screenshots : []);
    } catch (error) {
      console.log(error);
      setShots([]);
    }
  };

  const loadReport = async () => {
    try {
      const data = await getJson(`/api/tracker/report?from=${from}&to=${to}`);
      if (data.success) setReport(data);
      else toast.error(data.message || "Failed to load report");
    } catch (error) {
      console.log(error);
    }
  };

  const loadUsage = async () => {
    try {
      const [u, r] = await Promise.all([
        getJson(`/api/tracker/usage?from=${from}&to=${to}${person ? `&email=${encodeURIComponent(person)}` : ""}`),
        getJson("/api/tracker/rules"),
      ]);
      if (u.success) setUsage(u);
      else toast.error(u.message || "Failed to load app usage");
      if (r.success) setRules(r);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    if (!allowed) return;
    loadLive();
    // Online → Offline depends on time passing, not just new data.
    const timer = setInterval(loadLive, 30000);
    return () => clearInterval(timer);
  }, [allowed, loadLive]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "timeline") {
      setDay(null);
      loadDay();
    }
    if (tab === "screenshots") {
      setShots(null);
      loadShots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, date, person]);

  useEffect(() => {
    if (!allowed || from > to) return;
    if (tab === "reports") {
      setReport(null);
      loadReport();
    }
    if (tab === "usage") {
      setUsage(null);
      loadUsage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, from, to, person]);

  const isToday = date === todayIST();
  useLiveRefresh(["trackerstatuses", "trackersegments"], loadLive, allowed);
  useLiveRefresh(["trackersegments", "trackerscreenshots"], loadDay, allowed && tab === "timeline" && isToday);
  useLiveRefresh(["trackerscreenshots"], loadShots, allowed && tab === "screenshots" && isToday);
  useLiveRefresh(["trackerusages", "trackerrules"], loadUsage, allowed && tab === "usage");

  const counts = useMemo(() => {
    const c = { active: 0, idle: 0, offline: 0 };
    (live?.people || []).forEach((p) => (c[p.state] += 1));
    return c;
  }, [live]);

  const trackedPeople = useMemo(
    () => (live?.people || []).filter((p) => p.hasTracker).sort((a, b) => a.name.localeCompare(b.name)),
    [live]
  );

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-600 mb-1">Access Denied</h2>
          <p className="text-slate-500 text-sm">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const usesDay = tab === "timeline" || tab === "screenshots";
  const usesRange = tab === "reports" || tab === "usage";
  const usesPerson = tab === "screenshots" || tab === "usage";

  return (
    <div className="min-h-screen w-full relative" style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <Toaster position="top-right" reverseOrder={false} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
            {role === "manager" ? <ManagerSidebar /> : <Sidebar />}
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={SORA}>Team Activity</span>
        </div>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-lg"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl" style={{ background: "rgba(244,180,0,0.18)" }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#F4B400" }}>
                {role === "manager" ? "Manager" : "Admin"}
              </p>
              <h1 className="text-3xl font-bold tracking-tight" style={SORA}>Time Tracker</h1>
              <p className="mt-1.5 text-slate-400 text-sm max-w-md">
                Active and idle time, apps, websites and screenshots from the desktop tracker. Idle after{" "}
                {Math.round((live?.config?.idleThresholdSeconds || 300) / 60)} minutes without keyboard or mouse.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DOWNLOADS.length > 0 ? (
                DOWNLOADS.map((d) => (
                  <a
                    key={d.label}
                    href={d.url}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-[#0F172A]"
                    style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
                  >
                    <Download size={15} />
                    Tracker for {d.label}
                  </a>
                ))
              ) : (
                <span className="text-xs text-slate-400 max-w-[220px]">
                  Tracker download links appear here once the installer links are configured.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status counts */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {["active", "idle", "offline"].map((s) => {
            const meta = STATE_META[s];
            const Icon = meta.icon;
            return (
              <div key={s} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                  <Icon size={13} className="hidden sm:block shrink-0" />
                  <span>
                    {meta.label}
                    <span className="hidden sm:inline"> now</span>
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums" style={MONO}>{counts[s]}</p>
              </div>
            );
          })}
        </div>

        {/* Controls: one row */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all"
                style={tab === key ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" } : { color: "#64748B" }}
              >
                {label}
              </button>
            ))}
          </div>

          {usesDay && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setDate(shiftDate(date, -1))} className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200" aria-label="Previous day">‹</button>
              <input type="date" value={date} max={todayIST()} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputCls} />
              <button
                onClick={() => setDate(shiftDate(date, 1))}
                disabled={date >= todayIST()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 disabled:opacity-40"
                aria-label="Next day"
              >
                ›
              </button>
            </div>
          )}

          {usesRange && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className={inputCls} />
              <span>to</span>
              <input type="date" value={to} min={from} max={todayIST()} onChange={(e) => e.target.value && setTo(e.target.value)} className={inputCls} />
            </div>
          )}

          {usesPerson && (
            <select value={person} onChange={(e) => setPerson(e.target.value)} className={`${inputCls} max-w-[220px]`}>
              <option value="">All employees</option>
              {trackedPeople.map((p) => (
                <option key={p.email} value={p.email}>{p.name}</option>
              ))}
            </select>
          )}

          {tab !== "usage" && (
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-sm pl-9 pr-3 py-2 rounded-xl outline-none focus:border-[#F4B400]"
              />
            </div>
          )}
        </div>

        {tab === "live" &&
          (live ? <LiveTab people={live.people} search={search} /> : <p className="text-center text-sm text-slate-400 py-10">Loading…</p>)}
        {tab === "timeline" && (
          <TimelineTab
            day={day}
            search={search}
            onOpenScreenshots={(email) => {
              setPerson(email);
              setTab("screenshots");
            }}
          />
        )}
        {tab === "screenshots" && <ScreenshotsTab shots={shots} people={live?.people || []} search={search} />}
        {tab === "usage" && <UsageTab usage={usage} rules={rules} onReload={loadUsage} />}
        {tab === "reports" && <ReportTab report={report} search={search} />}
      </div>
    </div>
  );
}
