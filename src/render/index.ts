import { LitElement, css, html } from "lit";
import discordRPC from "discord-rpc";

(async () => {
  const settings: Map<string, IActivity> = window.api.loadSettings();

  const inputs = {
    name: document.getElementById("name") as HTMLInputElement,
    id: document.getElementById("id") as HTMLInputElement,
    details: document.getElementById("details") as HTMLInputElement,
    state: document.getElementById("state") as HTMLInputElement,
    largeImageKey: document.getElementById("largeImageKey") as HTMLInputElement,
    largeImageText: document.getElementById("largeImageText") as HTMLInputElement,
    smallImageKey: document.getElementById("smallImageKey") as HTMLInputElement,
    smallImageText: document.getElementById("smallImageText") as HTMLInputElement,
  };

  const activitiesDiv = document.getElementById("activities") as HTMLDivElement;
  const newButton = document.getElementById("new") as HTMLInputElement;
  const deleteButton = document.getElementById("delete") as HTMLInputElement;
  const checkButton = document.getElementById("check") as HTMLInputElement;

  const appendActivity = (name: string, id: string) => {
    const box = document.createElement("activity-box");
    box.textContent = name;
    box.setAttribute("id", id);
    activitiesDiv.appendChild(box);
  };

  settings.forEach((value: IActivity, id: string) => {
    appendActivity(value.name, id);
  });

  newButton.onclick = () => {};

  let previousID = "";
  let previousCallback = () => {};
  let currentActivity: ActivityBox | null = null;

  const setInputActivity = (id: string, activity: IActivity) => {
    inputs.name.value = activity.name;
    inputs.id.value = id;
    if (activity.presence.details) inputs.details.value = activity.presence.details;
    if (activity.presence.state) inputs.state.value = activity.presence.state;
    if (activity.presence.largeImageKey) inputs.largeImageKey.value = activity.presence.largeImageKey;
    if (activity.presence.largeImageText) inputs.largeImageText.value = activity.presence.largeImageText;
    if (activity.presence.smallImageKey) inputs.smallImageKey.value = activity.presence.smallImageKey;
    if (activity.presence.smallImageText) inputs.smallImageText.value = activity.presence.smallImageText;
  };
  const clearInputActivity = () => {
    inputs.name.value = "";
    inputs.id.value = "";
    inputs.details.value = "";
    inputs.state.value = "";
    inputs.largeImageKey.value = "";
    inputs.largeImageText.value = "";
    inputs.smallImageKey.value = "";
    inputs.smallImageText.value = "";
  };
  const getInputActivity = (): IActivity => {
    let presence: discordRPC.Presence = {
      details: inputs.details.value,
      state: inputs.state.value,
      largeImageKey: inputs.largeImageKey.value,
      largeImageText: inputs.largeImageText.value,
      smallImageKey: inputs.smallImageKey.value,
      smallImageText: inputs.smallImageText.value,
    };
    let activity: IActivity = { name: inputs.name.value, presence };
    return activity;
  };

  class ActivityBox extends LitElement {
    id: string;

    static styles = [
      css`
        :host {
          width: 100%;
          height: 40px;
          padding-left: 5px;
          padding-top: 5px;
          display: block;
          box-sizing: border-box;
          border: 1px solid var(--thirdColor);
          border-radius: 10px;
          font-size: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `,
    ];
    static get properties() {
      return {
        id: { type: String },
      };
    }
    constructor() {
      super();
      this.id = "";
      this.onclick = () => {
        if (previousID == this.id) {
          //Disable
          clearInputActivity();
          window.api.clearActivity();
          this.style.backgroundColor = "transparent";
          previousCallback = () => {};
          previousID = "";
          currentActivity = null;
        } else {
          currentActivity = this;
          const activity = settings.get(this.id);

          if (activity) {
            setInputActivity(this.id, activity);
            window.api.setActivity(this.id, activity);
          }

          previousCallback();
          this.style.backgroundColor = "var(--thirdColor)";

          previousCallback = () => {
            this.style.backgroundColor = "transparent";
          };
          previousID = this.id;
        }
      };
    }
    changeName(name: string | null) {
      this.textContent = name;
      this.requestUpdate();
    }
    render() {
      return html` ${this.textContent} `;
    }
  }

  checkButton.onclick = () => {
    if (currentActivity) {
      currentActivity.changeName(inputs.name.value);

      const inputActivity = getInputActivity();
      settings.set(inputs.id.value, inputActivity);
      window.api.setActivity(inputs.id.value, inputActivity);
      window.api.saveSettings(settings);
    }
  };
  newButton.onclick = () => {
    const id = inputs.id.value;

    if (id && !currentActivity) {
      const activity: IActivity = getInputActivity();
      settings.set(id, activity);
      appendActivity(inputs.name.value, id);
      window.api.saveSettings(settings);
    }
  };
  deleteButton.onclick = () => {
    if (currentActivity) {
      const id = currentActivity.id;
      activitiesDiv.removeChild(currentActivity);
      settings.delete(id);
      window.api.saveSettings(settings);
    }
  };

  customElements.define("activity-box", ActivityBox);
})();
