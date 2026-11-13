const $ = (id) => document.getElementById(id);
let current = null;

function formatHm(ms) {
  const mins = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

function render() {
  const s = current;
  if (!s) return;

  $("login").classList.toggle("hidden", s.signedIn);
  $("home").classList.toggle("hidden", !s.signedIn);
  $("api-url").value = $("api-url").value || s.apiUrl;
  if (s.message) $("login-error").textContent = s.message;
  if (!s.signedIn) return;

  const labels = { active: "Active", idle: "Idle", stopped: "Not tracking" };
  $("dot").className = `dot ${s.state}`;
  $("state-label").textContent = labels[s.state];

  if (s.state === "stopped") {
    $("state-sub").textContent = "Click Start when you begin work";
  } else if (s.state === "idle") {
    $("state-sub").textContent = `No keyboard or mouse for ${s.idleThresholdMinutes}+ min`;
  } else {
    $("state-sub").textContent = s.sessionStartedAt
      ? `This session: ${formatHm(Date.now() - s.sessionStartedAt)}`
      : "";
  }

  // Server totals + the not-yet-uploaded part of the current segment.
  const unsent = s.openSince && s.state !== "stopped" ? Date.now() - s.openSince : 0;
  $("active-today").textContent = formatHm(s.today.activeMs + (s.state === "active" ? unsent : 0));
  $("idle-today").textContent = formatHm(s.today.idleMs + (s.state === "idle" ? unsent : 0));

  const toggle = $("toggle-btn");
  toggle.textContent = s.state === "stopped" ? "Start tracking" : "Stop tracking";
  toggle.className = s.state === "stopped" ? "btn-primary" : "btn-stop";

  $("offline").classList.toggle("hidden", s.online);
  $("perm-warning").classList.toggle("hidden", !s.screenPermissionMissing);

  $("info").textContent =
    `You become idle after ${s.idleThresholdMinutes} minutes without keyboard or mouse input. ` +
    "The app in front and its window title are recorded while you're active. " +
    (s.screenshotsEnabled
      ? `A screenshot is taken about every ${s.screenshotIntervalMinutes} minutes while you're active. `
      : "") +
    "Closing this window keeps tracking in the system tray.";

  $("who").textContent = `${s.name} · v${s.version}`;
}

window.tracker.onState((state) => {
  current = state;
  render();
});

window.tracker.getState().then((state) => {
  current = state;
  render();
});

// Tick the counters every second.
setInterval(render, 1000);

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("login-btn").disabled = true;
  $("login-error").textContent = "";

  const result = await window.tracker.signIn({
    email: $("email").value.trim(),
    password: $("password").value,
    apiUrl: $("server-row").classList.contains("hidden") ? undefined : $("api-url").value,
  });

  $("login-btn").disabled = false;
  if (!result.success) {
    $("login-error").textContent = result.message;
  } else {
    $("password").value = "";
  }
});

$("show-server").addEventListener("click", () => $("server-row").classList.toggle("hidden"));

$("toggle-btn").addEventListener("click", () => {
  if (current?.state === "stopped") window.tracker.start();
  else window.tracker.stop();
});

$("sign-out").addEventListener("click", () => {
  if (confirm("Sign out? Tracking will stop.")) window.tracker.signOut();
});

$("open-perm").addEventListener("click", () => window.tracker.openScreenSettings());
