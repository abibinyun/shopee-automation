const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getResourcesPath: () => process.resourcesPath,
  startBot: () => ipcRenderer.send("start-bot"),
  stopBot: () => ipcRenderer.send("stop-bot"),
  onBotStatus: (callback) => ipcRenderer.on("bot-status", callback),
  onConfigUpdated: (callback) => ipcRenderer.on("config-updated", callback),
  openConfig: () => ipcRenderer.send("open-config"),
  saveConfig: (configData) => ipcRenderer.send("save-config", configData),
  selectFile: () => ipcRenderer.invoke("selectFile"),
  startTracking: () => ipcRenderer.send("start-tracking"),
  stopTracking: () => ipcRenderer.send("stop-tracking"),
  loadConfig: () => ipcRenderer.invoke("load-config"),
  onConfigUpdated: (callback) => ipcRenderer.on("config-updated", callback),
});
