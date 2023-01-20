import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import discordRPC from "discord-rpc";
import fs from "fs";

app.on("ready", () => {
  const window = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true, //Menu bar
  });
  app.setAppUserModelId("Discord Status"); //App name

  window.loadFile("./index.html");
  // window.webContents.toggleDevTools(); //Open developement tool

  let rpc = new discordRPC.Client({ transport: "ipc" });

  let isDiscordCreated = false;

  const appdataPath =
    process.env.APPDATA ||
    (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");

  const dataDir = path.join(appdataPath, "discord-status");
  fs.mkdirSync(dataDir, { recursive: true });

  ipcMain.on("clearActivity", (event, appID: string, activity: IActivity) => {
    rpc.clearActivity();
  });
  ipcMain.on("setActivity", (event, appID: string, activity: IActivity) => {
    rpc.clearActivity();
    rpc = new discordRPC.Client({ transport: "ipc" });
    rpc.login({ clientId: appID }).then(() => {
      discordRPC.register(appID);
      activity.presence.startTimestamp = new Date();
      rpc.setActivity(activity.presence);
    });
  });
  ipcMain.on("loadSettings", (event) => {
    try {
      const fileData: string = fs.readFileSync(path.join(dataDir, "settings.json")).toString();
      const settings = JSON.parse(fileData);
      const settingsMap = new Map(Object.entries(settings));
      event.returnValue = settingsMap;
    } catch {
      event.returnValue = new Map();
    }
  });
  ipcMain.on("saveSettings", (event, settings: Map<string, IActivity>) => {
    fs.writeFileSync(path.join(dataDir, "settings.json"), JSON.stringify(Object.fromEntries(settings)));
  });

  window.on("close", () => {
    rpc.clearActivity();
  });
});
