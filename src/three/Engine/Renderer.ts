import * as THREE from "three";
import { Engine } from "./Engine";

export class Renderer extends THREE.WebGLRenderer {
  private engine: Engine;
  private autoRender: boolean;

  constructor(autoRender: boolean = true) {
    super({ antialias: true });

    this.autoRender = autoRender;

    this.engine = Engine.getInstance();
    this.engine.domElement.appendChild(this.domElement);

    this.onResize();

    this.engine.viewport.events.on("change", () => {
      this.onResize();
    });
    this.engine.time.events.on(
      "tick",
      () => {
        if (this.autoRender) {
          this.render(this.engine.scene, this.engine.view);
        }
      },
      5
    );
  }

  private onResize() {
    this.setSize(this.engine.viewport.width, this.engine.viewport.height);
    this.setPixelRatio(this.engine.viewport.pixelRatio);
  }

  public stop() {
    this.autoRender = false;
  }

  public start() {
    this.autoRender = true;
  }
}
