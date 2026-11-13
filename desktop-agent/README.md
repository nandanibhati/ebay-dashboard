# Driftline Tracker (desktop agent)

A small Windows/Mac tray app that records employees' active and idle work
time and takes periodic screenshots, for the dashboard's **Time Tracker**
page (`/time-tracker`).

## How it works

- The employee signs in with their dashboard email and password. Tracking
  starts and the app runs from the system tray, starting with the computer.
- Every 5 seconds it reads the system-wide time since the last keyboard or
  mouse input. After the idle limit (default 5 minutes) with no input, the
  employee counts as **Idle**, backdated to their last input.
- When they come back, a popup asks whether the idle time was work (a call
  or meeting). If so, it counts as active and is marked as such.
- While active, it takes one screenshot of each screen at a random moment
  in every interval (default 10 minutes), labelled with the app in front.
- While active, it records which app is in front and its window title
  (Windows: a hidden PowerShell helper; Mac: `osascript`). Website names are
  taken from browser tab titles, e.g. "Song - YouTube - Google Chrome" →
  YouTube. Idle time is never credited to an app.
- In the dashboard, admins/managers label apps and sites Productive or
  Unproductive (Apps & Websites tab). Unproductive time is subtracted from
  productive time in every report.
- Activity is uploaded once a minute and immediately on every state change.
  If offline, it's saved to disk and sent when the connection returns.
- Sleep is a gap, not idle time. Quitting asks for confirmation; tracking
  resumes next time the app starts.

The server side is `backend/routes/trackerRoutes.js`. The tracker gets its
own 90-day token that only works for `/api/tracker/agent/*`.

## Settings (backend environment variables on Render)

| Variable | Default | Meaning |
|---|---|---|
| `TRACKER_IDLE_SECONDS` | `300` | No input for this long = idle |
| `TRACKER_SCREENSHOTS` | on | Set to `off` to disable screenshots |
| `TRACKER_SCREENSHOT_INTERVAL_MINUTES` | `10` | One screenshot per interval |
| `TRACKER_SCREENSHOT_RETENTION_DAYS` | `30` | Older screenshots are deleted nightly |
| `TRACKER_USAGE_RETENTION_DAYS` | `90` | Older app/window-title usage is deleted nightly |

The agent picks these up on its next heartbeat; no reinstall needed.

## Releasing a new version (auto-update)

1. Bump `version` in `desktop-agent/package.json` and commit.
2. Push a matching tag: `git tag -a tracker-v1.2.0 -m "Driftline Tracker 1.2.0" && git push origin tracker-v1.2.0`
3. The **Build desktop tracker** workflow builds both installers and
   publishes a GitHub Release.

Installed Windows apps check GitHub every 4 hours (and 30s after start),
download the update in the background, and install it the next time the
employee is idle or not tracking, then relaunch; tracking resumes on its
own. Mac apps can't self-install while unsigned, so they show an
"update available" link instead.

Permanent download links (always the newest version):

- Windows: https://github.com/nandanibhati/ebay-dashboard/releases/latest/download/Driftline-Tracker-Setup.exe
- Mac: https://github.com/nandanibhati/ebay-dashboard/releases/latest/download/Driftline-Tracker.dmg

The Release must stay public for updates to work (the repo is public).

## Building installers

Run the **Build desktop tracker** workflow from GitHub's Actions tab to
get installers as run artifacts without publishing a release.

Locally (Windows installer only):

```sh
cd desktop-agent
npm install
npm test
npm run dist:win    # → dist/Driftline Tracker Setup 1.0.0.exe
npm start           # run without installing
```

If `npm start` fails with `app` undefined, unset `ELECTRON_RUN_AS_NODE`
(VS Code's terminal sets it).

If `dist:win` fails unpacking `winCodeSign` (needs symlink rights, which
normal Windows accounts lack), either enable Windows Developer Mode or
skip the exe-editing step:
`npx electron-builder --win --publish never -c.win.signAndEditExecutable=false`.
The GitHub workflow doesn't have this problem.

To show download buttons on the Time Tracker page, set these on Vercel to
wherever the installers are hosted:

```
VITE_TRACKER_WINDOWS_URL=https://…/Driftline-Tracker-Setup.exe
VITE_TRACKER_MAC_URL=https://…/Driftline-Tracker.dmg
```

## First launch warnings

The installers aren't code-signed yet, so:

- **Windows:** SmartScreen shows "Windows protected your PC" → **More info** → **Run anyway**.
- **Mac:** open it once via right-click → **Open**, or System Settings →
  Privacy & Security → **Open Anyway**. Then allow **Screen Recording** for
  Driftline Tracker in Privacy & Security, or screenshots will be blank, and
  **Accessibility** (plus "control System Events" when asked), or window
  titles and website names won't be recorded — only app names.

Signing removes these warnings: a Windows code-signing certificate, and an
Apple Developer account for Mac signing and notarization.

## Privacy

Screenshots and activity tracking are employee monitoring. Under UK GDPR,
tell employees clearly what is collected and why, have a written monitoring
policy, and keep data no longer than needed. Window titles can contain
personal details (email subjects, chat names). The sign-in screen and main
window already state that screenshots, apps and window titles are recorded.
