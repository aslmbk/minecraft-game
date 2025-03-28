import { Events } from "./utils/Events";

type Keys = Record<string, boolean>;

export class Inputs {
  public readonly keys: Keys = {};
  public readonly events = new Events<
    | { trigger: "keydown"; args: { event: KeyboardEvent; keys: Keys }[] }
    | { trigger: "keyup"; args: { event: KeyboardEvent; keys: Keys }[] }
  >();

  constructor() {
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  private onKeyDown = (event: KeyboardEvent) => {
    this.keys[event.key] = true;
    this.keys[event.code] = true;
    this.events.trigger("keydown", { event, keys: this.keys });
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keys[event.key] = false;
    this.keys[event.code] = false;
    this.events.trigger("keyup", { event, keys: this.keys });
  };
}
