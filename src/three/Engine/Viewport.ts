import { Events } from "./utils/Events";
import { Engine } from "./Engine";

export class Viewport {
  private engine: Engine;
  public width = 0;
  public height = 0;
  public ratio = 0;
  public pixelRatio = 0;
  public readonly events = new Events<{ trigger: "change"; args: [] }>();
  private timeout: number | null = null;
  private onResizeCb = this.onResize.bind(this);

  constructor() {
    this.engine = Engine.getInstance();

    window.addEventListener("resize", this.onResizeCb);
    this.timeout = setTimeout(this.onResizeCb, 1);
  }

  private measure() {
    this.width = this.engine.domElement.clientWidth;
    this.height = this.engine.domElement.clientHeight;
    this.ratio = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  private onResize() {
    this.measure();
    this.events.trigger("change");
  }

  public dispose() {
    window.removeEventListener("resize", this.onResizeCb);
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
