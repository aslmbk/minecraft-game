import { Engine } from "./Engine";
import * as THREE from "three";
import { Lights } from "./Lights";
import { World } from "./World";
import { Config } from "./Config";
import { DebugController } from "./DebugController";

export class Game extends Engine {
  public config: Config;
  public lights: Lights;
  public world: World;
  public debugController: DebugController;

  constructor(domElement: HTMLElement) {
    super({ domElement });
    this.config = new Config();
    this.debugController = new DebugController(this);

    this.renderer.setClearColor(this.config.clearColor);
    this.view.position.set(50, 50, 50);

    this.lights = new Lights();
    this.world = new World(this.config.params);
    this.stats.activate();

    this.createLights();
    this.world.generate();
    this.scene.add(this.world);
  }

  private createLights() {
    const directionalLight = this.lights.createDirectionalLight({
      color: "white",
      intensity: 2,
      position: new THREE.Vector3(16, 16, 0),
    });
    this.scene.add(directionalLight);

    const ambientLight = this.lights.createAmbientLight({
      color: "white",
      intensity: 0.5,
    });
    this.scene.add(ambientLight);
  }

  public dispose() {
    this.stats.deactivate();
    this.debug.children.forEach((child) => child.dispose());
    this.scene.dispose();
  }
}
