import discordRPC from "discord-rpc";

declare global {
  interface IActivity {
    name: string;
    presence: discordRPC.Presence;
  }

  interface Api {
    clearActivity: () => void;
    setActivity: (appID: string, presence: IActivity) => void;
    loadSettings: () => Map<string, IActivity>;
    saveSettings: (settings: Map<string, IActivity>) => void;
  }
  interface Window {
    api: Api;
  }
}

export default global;
