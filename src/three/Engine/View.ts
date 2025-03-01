import { Engine } from "./Engine";
import * as THREE from "three";

export class View extends THREE.PerspectiveCamera {
  private engine: Engine;
  constructor() {
    const engine = Engine.getInstance();
    super(75, engine.viewport.ratio, 0.1, 1000);
    this.engine = engine;

    this.position.set(0, 0, 6);
    this.engine.scene.add(this);

    this.engine.viewport.events.on("change", () => {
      this.onResize();
    });
  }

  private onResize() {
    this.aspect = this.engine.viewport.ratio;
    this.updateProjectionMatrix();
  }
}
