import { OrbitControls as OrbitControlsThree } from "three/addons/controls/OrbitControls.js";
import { Engine } from "./Engine";

export class OrbitControls extends OrbitControlsThree {
  constructor() {
    const engine = Engine.getInstance();
    super(engine.view, engine.renderer.domElement);
    this.enableDamping = true;

    engine.time.events.on("tick", () => {
      this.update();
    });
  }
}
