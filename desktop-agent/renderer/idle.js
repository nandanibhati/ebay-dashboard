const params = new URLSearchParams(location.search);
const start = Number(params.get("start"));
const end = Number(params.get("end"));

const minutes = Math.max(1, Math.round((end - start) / 60000));
const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

document.getElementById("title").textContent = `You were idle for ${minutes} min`;
document.getElementById("detail").textContent =
  `No keyboard or mouse activity from ${time(start)} to ${time(end)}. ` +
  "If you were working away from the keyboard, it can count as active time.";

const answer = (worked) => window.tracker.idleAnswer({ start, end, worked });
document.getElementById("worked").addEventListener("click", () => answer(true));
document.getElementById("idle").addEventListener("click", () => answer(false));
