import * as THREE from "three";

export type LightsConfig = {
  ambientLight: {
    intensity: number;
    color: string;
  };
  directionalLight: {
    intensity: number;
    color: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
  };
};

export class Lights extends THREE.Group {
  public directionalLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;

  private frameRate = 2;
  private deltaTime = 0;
  private config: LightsConfig;

  constructor(config: LightsConfig) {
    super();
    this.config = config;
    this.directionalLight = new THREE.DirectionalLight(
      this.config.directionalLight.color,
      this.config.directionalLight.intensity
    );
    this.directionalLight.position.copy(this.config.directionalLight.position);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(4096, 4096);
    this.directionalLight.shadow.camera.near = 10;
    this.directionalLight.shadow.camera.far = 150;
    this.directionalLight.shadow.camera.left = -90;
    this.directionalLight.shadow.camera.right = 90;
    this.directionalLight.shadow.camera.top = 90;
    this.directionalLight.shadow.camera.bottom = -90;
    this.directionalLight.shadow.radius = 4;
    this.add(this.directionalLight);
    this.add(this.directionalLight.target);

    this.ambientLight = new THREE.AmbientLight(
      this.config.ambientLight.color,
      this.config.ambientLight.intensity
    );
    this.add(this.ambientLight);
  }

  public update(delta: number, playerPosition: THREE.Vector3) {
    this.deltaTime += delta;
    if (this.deltaTime < this.frameRate) return;
    this.directionalLight.position.copy(playerPosition);
    this.directionalLight.position.add(this.config.directionalLight.position);
    this.directionalLight.target.position.copy(playerPosition);
    this.deltaTime -= this.frameRate;
  }
}
