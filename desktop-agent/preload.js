const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tracker", {
  getState: () => ipcRenderer.invoke("get-state"),
  signIn: (creds) => ipcRenderer.invoke("sign-in", creds),
  signOut: () => ipcRenderer.invoke("sign-out"),
  start: () => ipcRenderer.invoke("start"),
  stop: () => ipcRenderer.invoke("stop"),
  idleAnswer: (answer) => ipcRenderer.invoke("idle-answer", answer),
  openScreenSettings: () => ipcRenderer.invoke("open-screen-settings"),
  openAccessibilitySettings: () => ipcRenderer.invoke("open-accessibility-settings"),
  applyUpdate: () => ipcRenderer.invoke("apply-update"),
  checkUpdates: () => ipcRenderer.invoke("check-updates"),
  onState: (callback) => ipcRenderer.on("state", (_event, state) => callback(state)),
});
