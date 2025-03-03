import StatsJS from "stats.js";
import { Engine } from "./Engine";

export class Stats {
  private stats: StatsJS;
  private active = true;
  private engine: Engine;

  constructor() {
    this.engine = Engine.getInstance();
    this.stats = new StatsJS();

    this.engine.time.events.on("tick", () => {
      if (this.active) {
        this.stats.update();
      }
    });
  }

  public activate() {
    this.active = true;
    document.body.appendChild(this.stats.dom);
  }

  public deactivate() {
    this.active = false;
    document.body.removeChild(this.stats.dom);
  }
}
