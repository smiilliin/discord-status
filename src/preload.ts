import { contextBridge, ipcRenderer } from "electron";

const api: Api = {
  clearActivity() {
    ipcRenderer.send("clearActivity");
  },
  setActivity(appID: string, activity: IActivity) {
    ipcRenderer.send("setActivity", appID, activity);
  },
  loadSettings(): Map<string, IActivity> {
    return ipcRenderer.sendSync("loadSettings");
  },
  saveSettings(settings: Map<string, IActivity>) {
    ipcRenderer.send("saveSettings", settings);
  },
};

contextBridge.exposeInMainWorld("api", api);
