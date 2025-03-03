import { Events } from "./Events";
import { Engine } from "./Engine";

export class Viewport {
  private engine: Engine;
  public width = 0;
  public height = 0;
  public ratio = 0;
  public pixelRatio = 0;
  public readonly events = new Events<{ trigger: "change"; args: [] }>();

  constructor() {
    this.engine = Engine.getInstance();

    window.addEventListener("resize", () => {
      this.measure();
      this.events.trigger("change");
    });

    setTimeout(() => {
      this.measure();
      this.events.trigger("change");
    }, 1);
  }

  private measure() {
    this.width = this.engine.domElement.clientWidth;
    this.height = this.engine.domElement.clientHeight;
    this.ratio = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  public dispose() {}
}
