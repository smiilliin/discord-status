import path from "path";
import fs from "fs";

class Settings {
  static appdataDir =
    process.env.APPDATA ||
    (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
  private appDir: string;

  constructor(appName: string) {
    this.appDir = path.join(Settings.appdataDir, appName);
  }
  load(fileName: string): any {
    try {
      const fileData = fs.readFileSync(path.join(this.appDir, fileName)).toString();
      return JSON.parse(fileData);
    } catch {
      return {};
    }
  }
  set(fileName: string, data: any) {
    if (!fs.existsSync(this.appDir)) {
      fs.mkdirSync(this.appDir, { recursive: true });
    }
    fs.writeFileSync(path.join(this.appDir, fileName), JSON.stringify(data));
  }
}

export default Settings;
