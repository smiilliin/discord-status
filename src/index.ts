import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import discordRPC from "discord-rpc";
import fs from "fs";
import Settings from "./settings";

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

  const settings = new Settings("discord-status");

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
      const settingsMap = new Map(Object.entries(settings.load("settings.json")));
      event.returnValue = settingsMap;
    } catch {
      event.returnValue = new Map();
    }
  });
  ipcMain.on("saveSettings", (event, _settings: Map<string, IActivity>) => {
    settings.set("settings.json", Object.fromEntries(_settings));
  });

  window.on("close", () => {
    rpc.clearActivity();
  });
});
