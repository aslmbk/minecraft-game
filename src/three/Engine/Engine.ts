import { Debug } from "./Debug";
import { Time } from "./Time";
import { Viewport } from "./Viewport";
import { Scene } from "./Scene";
import { View } from "./View";
import { Renderer } from "./Renderer";
import { OrbitControls } from "./OrbitControls";

export type EngineOptions = {
  domElement: HTMLElement;
  autoRender?: boolean;
};

export class Engine {
  private static instance: Engine | null = null;
  public domElement!: HTMLElement;
  public debug!: Debug;
  public time!: Time;
  public viewport!: Viewport;
  public scene!: Scene;
  public view!: View;
  public renderer!: Renderer;
  public controls!: OrbitControls;

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
  }

  public static getInstance(): Engine {
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
    Engine.instance = null;
  }
}
