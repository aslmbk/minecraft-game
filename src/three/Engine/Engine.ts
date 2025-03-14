import { Debug } from "./Debug";
import { Time } from "./Time";
import { Viewport } from "./Viewport";
import { Scene } from "./Scene";
import { View } from "./View";
import { Renderer } from "./Renderer";
import { OrbitControls } from "./OrbitControls";
import { Loader } from "./Loader";
import { Stats } from "./Stats";

export type EngineOptions = {
  domElement: HTMLElement;
  autoRender?: boolean;
};

export class Engine {
  private static instance: Engine | null = null;
  public readonly domElement!: HTMLElement;
  public readonly debug!: Debug;
  public readonly time!: Time;
  public readonly viewport!: Viewport;
  public readonly scene!: Scene;
  public readonly view!: View;
  public readonly renderer!: Renderer;
  public readonly controls!: OrbitControls;
  public readonly loader!: Loader;
  public readonly stats!: Stats;

  constructor({ domElement, autoRender = true }: EngineOptions) {
    if (Engine.instance) {
      if (Engine.instance.domElement === domElement) return Engine.instance;
      Engine.instance.dispose();
    }

    Engine.instance = this;
    this.domElement = domElement;

    this.debug = new Debug();
    this.time = new Time();
    this.viewport = new Viewport();
    this.scene = new Scene();
    this.view = new View();
    this.renderer = new Renderer(autoRender);
    this.controls = new OrbitControls();
    this.loader = new Loader();
    this.stats = new Stats();
  }

  public static getInstance() {
    if (!Engine.instance) {
      throw new Error("Engine instance not initialized");
    }
    return Engine.instance;
  }

  public dispose() {
    this.debug.dispose();
    this.time.dispose();
    this.viewport.dispose();
    this.scene.dispose();
    this.renderer.dispose();
    this.controls.dispose();
    this.stats.deactivate();
    Engine.instance = null;
  }
}
