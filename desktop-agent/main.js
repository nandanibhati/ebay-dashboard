// Driftline Tracker — desktop agent.
//
// Measures active vs idle time from system-wide keyboard/mouse inactivity
// (powerMonitor.getSystemIdleTime), takes periodic screenshots while the
// employee is active, and reports both to the dashboard backend
// (backend/routes/trackerRoutes.js). Lives in the system tray.

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  powerMonitor,
  desktopCapturer,
  nativeImage,
  safeStorage,
  systemPreferences,
  dialog,
  shell,
} = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { ActivityTracker } = require("./lib/tracker");
const { UsageRecorder } = require("./lib/usage");
const { createActiveWindowWatcher } = require("./lib/activeWindow");
const { dotPng, COLORS } = require("./lib/icons");

const DEFAULT_API_URL = process.env.TRACKER_API_URL || "https://ebay-dashboard-z7h2.onrender.com";
const SAMPLE_MS = 5000;
const MAX_PENDING_SHOTS = 200;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow = null;
let idleWindow = null;
let tray = null;

let config = {
  idleThresholdSeconds: 300,
  heartbeatSeconds: 60,
  screenshotsEnabled: true,
  screenshotIntervalMinutes: 10,
};

// Persisted state (userData/state.json).
let store = { apiUrl: DEFAULT_API_URL, auth: null, wasTracking: false, pending: [] };
let online = true;
let uploading = false;
let sendStoppedPing = false;
let resumeAfterSleep = false;
let today = { date: "", activeMs: 0, idleMs: 0, fetchedAt: 0 };
let screenPermissionMissing = false;
let sessionStartedAt = null;

let sampleTimer = null;
let heartbeatTimer = null;
let screenshotTimer = null;
let quitting = false;

// Auto-update (from GitHub Releases).
// { version, ready } — ready = downloaded and installable (Windows), or
// { version, manual: true } on Mac, where unsigned apps can't self-update.
let update = null;
const RELEASES_URL = "https://github.com/nandanibhati/ebay-dashboard/releases/latest";
const UPDATE_CHECK_MS = 4 * 60 * 60 * 1000;

const usage = new UsageRecorder();
const windowWatcher = createActiveWindowWatcher();

const tracker = new ActivityTracker({
  idleThresholdSeconds: config.idleThresholdSeconds,
  onStateChange: (state) => {
    updateTray();
    pushState();
    // Report state changes promptly so the live board is current.
    if (state !== "stopped") setTimeout(flush, 500);
  },
  onIdleEnded: (period) => showIdlePrompt(period),
});

// ---------- persistence ----------

const statePath = () => path.join(app.getPath("userData"), "state.json");
const shotsDir = () => path.join(app.getPath("userData"), "pending-screenshots");

function loadStore() {
  try {
    store = { ...store, ...JSON.parse(fs.readFileSync(statePath(), "utf8")) };
  } catch {
    // first run
  }
  tracker.restore(store.pending);
  usage.restore(store.usage);
  store.pending = [];
  store.usage = null;
}

function saveStore() {
  try {
    const data = { ...store, pending: tracker.snapshot(Date.now()), usage: usage.snapshot() };
    fs.writeFileSync(statePath(), JSON.stringify(data));
  } catch (error) {
    console.log("Could not save state:", error.message);
  }
}

// The token is encrypted with the OS keychain when available.
function setToken(token) {
  store.auth.token = safeStorage.isEncryptionAvailable()
    ? { enc: safeStorage.encryptString(token).toString("base64") }
    : { plain: token };
}

function getToken() {
  const t = store.auth?.token;
  if (!t) return null;
  try {
    return t.enc ? safeStorage.decryptString(Buffer.from(t.enc, "base64")) : t.plain;
  } catch {
    return null;
  }
}

// ---------- API ----------

async function api(pathname, { method = "GET", body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(store.apiUrl.replace(/\/+$/, "") + pathname, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
    signal: AbortSignal.timeout(30000),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON error page
  }
  return { status: res.status, ok: res.ok, data };
}

function applyConfig(next) {
  if (!next) return;
  const screenshotsChanged =
    next.screenshotsEnabled !== config.screenshotsEnabled ||
    next.screenshotIntervalMinutes !== config.screenshotIntervalMinutes;

  config = { ...config, ...next };
  tracker.setIdleThreshold(config.idleThresholdSeconds);
  restartHeartbeat();
  if (screenshotsChanged && tracker.tracking) scheduleScreenshot();
}

const device = () => ({
  os: `${process.platform} ${os.release()}`,
  hostname: os.hostname(),
  appVersion: app.getVersion(),
});

// Upload everything pending. Never runs two uploads at once — the server
// must receive segments in order. A flush requested mid-upload runs again
// right after, and the returned promise covers that rerun too.
let inflight = null;
let flushAgain = false;

function flush() {
  if (inflight) {
    flushAgain = true;
    return inflight;
  }
  inflight = (async () => {
    do {
      flushAgain = false;
      await uploadOnce();
    } while (flushAgain && store.auth);
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function uploadOnce() {
  if (!store.auth) return;
  if (!tracker.tracking && tracker.queue.length === 0 && !sendStoppedPing) return;

  uploading = true;
  try {
    for (let first = true; ; first = false) {
      const batch = tracker.drain(Date.now());
      const usageItems = first ? usage.drain() : [];
      const res = await api("/api/tracker/agent/heartbeat", {
        method: "POST",
        body: {
          state: tracker.state,
          segments: batch.segments,
          usage: usageItems.map(({ bucket, app, title, seconds }) => ({ bucket, app, title, seconds })),
          current: tracker.state === "active" ? windowWatcher.get() : null,
          device: device(),
        },
      });

      if (res.status === 401 || res.status === 403) {
        signOut("Your session has expired. Please sign in again.");
        return;
      }
      if (!res.ok) throw new Error(res.data.message || `HTTP ${res.status}`);

      tracker.commit(batch);
      usage.commit(usageItems, Date.now());
      applyConfig(res.data.config);
      if (!batch.more) break;
    }

    sendStoppedPing = false;
    online = true;
    saveStore();
    refreshToday();
    uploadPendingScreenshots();
  } catch (error) {
    online = false;
    saveStore();
    console.log("Heartbeat failed:", error.message);
  } finally {
    uploading = false;
    pushState();
  }
}

async function refreshToday() {
  try {
    const res = await api("/api/tracker/agent/today");
    if (res.ok) {
      today = { date: res.data.date, activeMs: res.data.activeMs, idleMs: res.data.idleMs, fetchedAt: Date.now() };
      pushState();
    }
  } catch {
    // offline; keep last values
  }
}

// ---------- tracking ----------

function startTracking() {
  if (!store.auth || tracker.tracking) return;
  tracker.start(Date.now());
  sessionStartedAt = Date.now();
  store.wasTracking = true;
  saveStore();

  windowWatcher.start();
  clearInterval(sampleTimer);
  let ticks = 0;
  let lastTickAt = Date.now();
  sampleTimer = setInterval(() => {
    const now = Date.now();
    const before = tracker.state;
    tracker.sample(now, powerMonitor.getSystemIdleTime());

    if (before === "active" && tracker.state === "idle") {
      // Idle is backdated to the last input; app time after that wasn't use.
      usage.dropAfter(tracker.current.start);
      usage.settle(now, 0);
    } else if (before === "active" && tracker.state === "active") {
      usage.tick(lastTickAt, now, windowWatcher.get());
    }
    lastTickAt = now;
    // Hold recent app time until idle can no longer be backdated over it.
    usage.settle(now, config.idleThresholdSeconds * 1000 + 2 * SAMPLE_MS);

    // Save unsent time to disk every ~15s, so a crash or power cut loses
    // at most that much (uploads only happen once a minute).
    if (++ticks % 3 === 0) saveStore();
  }, SAMPLE_MS);
  scheduleScreenshot();
  flush();
}

function stopTracking({ remember = true } = {}) {
  if (!tracker.tracking) return;
  tracker.stop(Date.now());
  // Stopping can't be followed by a backdated idle, so all held app time
  // is final.
  usage.settle(Date.now(), 0);
  windowWatcher.stop();
  sessionStartedAt = null;
  clearInterval(sampleTimer);
  clearTimeout(screenshotTimer);
  closeIdlePrompt();
  if (remember) store.wasTracking = false;
  sendStoppedPing = true;
  saveStore();
  flush();
}

function restartHeartbeat() {
  clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(flush, Math.max(15, config.heartbeatSeconds) * 1000);
}

// ---------- screenshots ----------

// One screenshot at a random moment within every interval, only while the
// employee is active.
function scheduleScreenshot() {
  clearTimeout(screenshotTimer);
  if (!config.screenshotsEnabled || !tracker.tracking) return;

  const intervalMs = config.screenshotIntervalMinutes * 60 * 1000;
  const delay = Math.random() * intervalMs;

  screenshotTimer = setTimeout(async () => {
    await takeScreenshot();
    screenshotTimer = setTimeout(scheduleScreenshot, intervalMs - delay);
  }, delay);
}

async function takeScreenshot() {
  if (tracker.state !== "active") return;

  if (process.platform === "darwin") {
    screenPermissionMissing = systemPreferences.getMediaAccessStatus("screen") !== "granted";
    pushState();
  }

  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1600, height: 1000 },
    });
    const takenAt = new Date().toISOString();
    // What was in front when the screenshot was taken, shown as its caption.
    const win = windowWatcher.get() || { app: "", title: "" };

    for (const [screenIndex, source] of sources.entries()) {
      if (source.thumbnail.isEmpty()) continue;
      const jpeg = source.thumbnail.toJPEG(60);
      const meta = { takenAt, screenIndex, app: win.app, title: win.title };
      const ok = await uploadScreenshot(jpeg, meta);
      if (!ok) savePendingScreenshot(jpeg, meta);
    }
  } catch (error) {
    console.log("Screenshot failed:", error.message);
  }
}

async function uploadScreenshot(jpeg, { takenAt, screenIndex, app: appName = "", title = "" }) {
  try {
    const form = new FormData();
    form.append("takenAt", takenAt);
    form.append("screenIndex", String(screenIndex));
    form.append("app", appName);
    form.append("title", title);
    form.append("screenshot", new Blob([jpeg], { type: "image/jpeg" }), "screenshot.jpg");
    const res = await api("/api/tracker/agent/screenshot", { method: "POST", formData: form });
    return res.ok;
  } catch {
    return false;
  }
}

// Offline: keep the image plus a .json of its details, upload later.
function savePendingScreenshot(jpeg, meta) {
  try {
    fs.mkdirSync(shotsDir(), { recursive: true });
    const files = fs.readdirSync(shotsDir()).filter((f) => f.endsWith(".jpg")).sort();
    while (files.length >= MAX_PENDING_SHOTS) {
      const oldest = files.shift();
      fs.rmSync(path.join(shotsDir(), oldest), { force: true });
      fs.rmSync(path.join(shotsDir(), oldest.replace(".jpg", ".json")), { force: true });
    }
    const base = `${Date.parse(meta.takenAt)}-${meta.screenIndex}`;
    fs.writeFileSync(path.join(shotsDir(), `${base}.jpg`), jpeg);
    fs.writeFileSync(path.join(shotsDir(), `${base}.json`), JSON.stringify(meta));
  } catch (error) {
    console.log("Could not save screenshot for later:", error.message);
  }
}

async function uploadPendingScreenshots() {
  let files;
  try {
    files = fs.readdirSync(shotsDir()).filter((f) => f.endsWith(".jpg")).sort().slice(0, 5);
  } catch {
    return;
  }

  for (const file of files) {
    const full = path.join(shotsDir(), file);
    const metaPath = full.replace(".jpg", ".json");
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      const [ms, screenIndex] = file.replace(".jpg", "").split("-");
      meta = { takenAt: new Date(Number(ms)).toISOString(), screenIndex: Number(screenIndex) };
    }
    const ok = await uploadScreenshot(fs.readFileSync(full), meta);
    if (!ok) return;
    fs.rmSync(full, { force: true });
    fs.rmSync(metaPath, { force: true });
  }
}

// ---------- idle prompt ----------

function showIdlePrompt({ start, end }) {
  closeIdlePrompt();
  idleWindow = new BrowserWindow({
    width: 380,
    height: 250,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    title: "You were idle",
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  idleWindow.loadFile(path.join(__dirname, "renderer/idle.html"), {
    query: { start: String(start), end: String(end) },
  });
  idleWindow.on("closed", () => {
    idleWindow = null;
  });
}

function closeIdlePrompt() {
  if (idleWindow && !idleWindow.isDestroyed()) idleWindow.close();
  idleWindow = null;
}

// ---------- auth ----------

async function signIn({ email, password, apiUrl }) {
  if (apiUrl) store.apiUrl = apiUrl.trim();

  try {
    const res = await api("/api/tracker/agent/login", { method: "POST", body: { email, password } });
    if (!res.ok) return { success: false, message: res.data.message || "Sign in failed" };

    store.auth = { name: res.data.name, email: res.data.email };
    setToken(res.data.token);
    applyConfig(res.data.config);
    saveStore();

    // Start with the computer, like other trackers.
    if (app.isPackaged) {
      app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true, args: ["--hidden"] });
    }

    refreshToday();
    startTracking();
    return { success: true };
  } catch (error) {
    return { success: false, message: `Can't reach the server (${error.message})` };
  }
}

function signOut(message) {
  stopTracking();
  store.auth = null;
  store.wasTracking = false;
  today = { date: "", activeMs: 0, idleMs: 0, fetchedAt: 0 };
  saveStore();
  pushState(message);
  showMainWindow();
}

// ---------- UI ----------

function stateForUi(message) {
  return {
    signedIn: Boolean(store.auth),
    name: store.auth?.name || "",
    email: store.auth?.email || "",
    apiUrl: store.apiUrl,
    state: tracker.state,
    sessionStartedAt,
    online,
    today,
    // Unsent time in the open segment, so the counter ticks between uploads.
    openSince: tracker.current ? tracker.current.sentFrom : null,
    screenshotsEnabled: config.screenshotsEnabled,
    screenshotIntervalMinutes: config.screenshotIntervalMinutes,
    idleThresholdMinutes: Math.round(config.idleThresholdSeconds / 60),
    screenPermissionMissing,
    version: app.getVersion(),
    update,
    message: message || "",
  };
}

function pushState(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("state", stateForUi(message));
  }
}

function formatHm(ms) {
  const mins = Math.floor(ms / 60000);
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

function updateTray() {
  if (!tray) return;
  const state = tracker.state;
  tray.setImage(nativeImage.createFromBuffer(dotPng(COLORS[state])).resize({ width: 16, height: 16 }));

  const label = { active: "Active", idle: "Idle", stopped: "Not tracking" }[state];
  tray.setToolTip(`Driftline Tracker — ${label}`);

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: store.auth ? `${store.auth.name} — ${label}` : "Not signed in", enabled: false },
      { label: `Active today: ${formatHm(today.activeMs)}`, enabled: false, visible: Boolean(store.auth) },
      { type: "separator" },
      {
        label: tracker.tracking ? "Stop tracking" : "Start tracking",
        enabled: Boolean(store.auth),
        click: () => (tracker.tracking ? stopTracking() : startTracking()),
      },
      {
        label: update?.manual ? `Download update (v${update.version})` : `Restart to update (v${update?.version})`,
        visible: Boolean(update && (update.ready || update.manual)),
        click: applyUpdate,
      },
      { label: "Open Driftline Tracker", click: showMainWindow },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ])
  );
}

function showMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 380,
    height: 560,
    resizable: false,
    maximizable: false,
    title: "Driftline Tracker",
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
  mainWindow.webContents.on("did-finish-load", () => pushState());

  // Closing the window keeps tracking in the tray.
  mainWindow.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

ipcMain.handle("get-state", () => stateForUi());
ipcMain.handle("sign-in", (_e, creds) => signIn(creds));
ipcMain.handle("sign-out", () => signOut());
ipcMain.handle("start", () => startTracking());
ipcMain.handle("stop", () => stopTracking());
// ---------- auto-update ----------

function setupAutoUpdate() {
  // Only installed builds can update (not `npm start`).
  if (!app.isPackaged) return;

  const { autoUpdater } = require("electron-updater");
  // macOS refuses to auto-install unsigned apps, so there we only announce
  // the new version and link to the download.
  autoUpdater.autoDownload = process.platform !== "darwin";
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    if (process.platform === "darwin") {
      update = { version: info.version, manual: true };
      pushState();
      updateTray();
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    update = { version: info.version, ready: true };
    pushState();
    updateTray();
    installWhenQuiet();
  });

  autoUpdater.on("error", (error) => console.log("Update check failed:", error.message));

  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 30 * 1000);
  setInterval(check, UPDATE_CHECK_MS);
}

// Install a downloaded update without interrupting work: as soon as the
// employee is idle or not tracking. Tracking resumes after the restart.
let installTimer = null;
function installWhenQuiet() {
  clearInterval(installTimer);
  installTimer = setInterval(() => {
    if (update?.ready && tracker.state !== "active") applyUpdate();
  }, 30 * 1000);
}

async function applyUpdate() {
  if (!update) return;
  if (update.manual) {
    shell.openExternal(RELEASES_URL);
    return;
  }
  if (!update.ready || quitting) return;

  clearInterval(installTimer);
  quitting = true;
  // remember: false keeps wasTracking, so tracking resumes after restart.
  stopTracking({ remember: false });
  await Promise.race([flush(), new Promise((r) => setTimeout(r, 4000))]);
  saveStore();

  const { autoUpdater } = require("electron-updater");
  // Silent install, then relaunch the app.
  autoUpdater.quitAndInstall(true, true);
}

ipcMain.handle("apply-update", () => applyUpdate());

ipcMain.handle("open-screen-settings", () =>
  shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
);
ipcMain.handle("idle-answer", (_e, { start, end, worked }) => {
  if (worked) {
    tracker.markAsWork({ start: Number(start), end: Number(end) });
    flush();
  }
  closeIdlePrompt();
});

// ---------- lifecycle ----------

app.on("second-instance", showMainWindow);

app.whenReady().then(() => {
  loadStore();

  tray = new Tray(nativeImage.createFromBuffer(dotPng(COLORS.stopped)).resize({ width: 16, height: 16 }));
  tray.on("click", showMainWindow);
  updateTray();
  restartHeartbeat();

  const startedHidden = process.argv.includes("--hidden") || app.getLoginItemSettings().wasOpenedAsHidden;
  if (!startedHidden || !store.auth) showMainWindow();

  if (store.auth) {
    refreshToday();
    if (store.wasTracking) startTracking();
    else flush();
  }

  // Sleep is a gap, not idle time.
  powerMonitor.on("suspend", () => {
    resumeAfterSleep = tracker.tracking;
    stopTracking({ remember: false });
  });
  powerMonitor.on("resume", () => {
    if (resumeAfterSleep) startTracking();
    resumeAfterSleep = false;
  });

  setupAutoUpdate();

  // Keep the tray menu's "Active today" roughly current.
  setInterval(updateTray, 60 * 1000);
});

// Stay alive in the tray when every window is closed (having a listener
// at all stops Electron's default quit).
app.on("window-all-closed", () => {});

app.on("before-quit", (event) => {
  if (quitting) return;
  // Must be synchronous; the actual exit happens below via app.exit().
  event.preventDefault();

  (async () => {
    if (tracker.tracking) {
      const { response } = await dialog.showMessageBox({
        type: "question",
        buttons: ["Quit and stop tracking", "Cancel"],
        defaultId: 1,
        cancelId: 1,
        message: "Quitting stops time tracking. Quit anyway?",
      });
      if (response !== 0) return;
    }

    quitting = true;
    // remember: false — tracking resumes next time the app starts.
    stopTracking({ remember: false });
    // Give the final upload a few seconds; anything unsent is saved to
    // disk and sent next time.
    await Promise.race([flush(), new Promise((r) => setTimeout(r, 4000))]);
    saveStore();
    app.exit(0);
  })();
});
