import { Engine } from "./Engine";
import * as THREE from "three";
import { Lights } from "./Lights";
import { World } from "./World";

export class Game extends Engine {
  private lights: Lights;
  private world: World;

  constructor(domElement: HTMLElement) {
    super({ domElement });
    this.lights = new Lights();
    this.world = new World({ size: 10 });

    this.view.position.set(0, 10, 10);

    this.createLights();
    this.world.generate();
    this.scene.add(this.world);
  }

  private createLights() {
    const directionalLight = this.lights.createDirectionalLight({
      color: "white",
      intensity: 2,
      position: new THREE.Vector3(1, 1, 1),
    });
    this.scene.add(directionalLight);

    const ambientLight = this.lights.createAmbientLight({
      color: "white",
      intensity: 0.5,
    });
    this.scene.add(ambientLight);
  }

  public dispose() {
    this.scene.dispose();
  }
}
