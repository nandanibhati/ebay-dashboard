// Reports which app is in front and its window title, using only what the
// OS ships with (no native add-ons to compile per Electron version):
//   Windows: one long-lived PowerShell process calling user32 via C#.
//   macOS:   osascript (JXA) on each poll. Needs Accessibility permission
//            for window titles; without it only the app name is known.

const { spawn, execFile } = require("child_process");

const WINDOWS_SCRIPT = `
$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class DriftlineWin {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
}
"@
$names = @{}
while ($true) {
  # Exit with the tracker app, even if it crashed without killing us.
  if (-not (Get-Process -Id $env:DRIFTLINE_PARENT_PID)) { exit }
  $h = [DriftlineWin]::GetForegroundWindow()
  $sb = New-Object System.Text.StringBuilder 512
  [void][DriftlineWin]::GetWindowText($h, $sb, 512)
  $procId = 0
  [void][DriftlineWin]::GetWindowThreadProcessId($h, [ref]$procId)
  $app = ''
  if ($procId -ne 0) {
    if ($names.ContainsKey($procId)) { $app = $names[$procId] } else {
      $p = Get-Process -Id $procId
      if ($p) {
        $app = $p.MainModule.FileVersionInfo.FileDescription
        if (-not $app) { $app = $p.ProcessName }
        $names[$procId] = $app
      }
    }
  }
  [Console]::Out.WriteLine((@{ app = [string]$app; title = $sb.ToString() } | ConvertTo-Json -Compress))
  Start-Sleep -Seconds 2
}
`;

const MAC_SCRIPT = `
const se = Application("System Events");
const p = se.processes.whose({ frontmost: true })[0];
let title = "";
try { title = p.windows[0].name() || ""; } catch (e) {}
JSON.stringify({ app: p.name(), title: title });
`;

function createActiveWindowWatcher() {
  let latest = null;
  let child = null;
  let timer = null;
  let stopped = false;

  function startWindows() {
    child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", WINDOWS_SCRIPT],
      { windowsHide: true, env: { ...process.env, DRIFTLINE_PARENT_PID: String(process.pid) } }
    );
    let buffer = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        try {
          latest = JSON.parse(line);
        } catch {
          // ignore partial / noise lines
        }
      }
    });
    child.on("exit", () => {
      child = null;
      // Restart if it dies unexpectedly.
      if (!stopped) setTimeout(startWindows, 10000);
    });
  }

  function pollMac() {
    execFile("osascript", ["-l", "JavaScript", "-e", MAC_SCRIPT], { timeout: 4000 }, (error, stdout) => {
      if (!error) {
        try {
          latest = JSON.parse(stdout.trim());
        } catch {
          // ignore
        }
      }
    });
  }

  return {
    start() {
      stopped = false;
      if (process.platform === "win32" && !child) startWindows();
      if (process.platform === "darwin" && !timer) {
        pollMac();
        timer = setInterval(pollMac, 3000);
      }
    },
    stop() {
      stopped = true;
      if (child) child.kill();
      child = null;
      clearInterval(timer);
      timer = null;
      latest = null;
    },
    // { app, title } of the foreground window, or null if unknown.
    get() {
      if (!latest || !latest.app) return null;
      return {
        app: String(latest.app).slice(0, 120),
        title: String(latest.title || "").slice(0, 300),
      };
    },
  };
}

module.exports = { createActiveWindowWatcher };
