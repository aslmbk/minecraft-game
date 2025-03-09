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
    this.renderer.shadowMap.enabled = true;
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
      position: new THREE.Vector3(40, 40, -40),
    });
    directionalLight.castShadow = true;
    directionalLight.shadow.intensity = 0.9;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.radius = 8;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 110;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
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
