import * as THREE from "three";

export class Lights extends THREE.Group {
  private directionalLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  constructor() {
    super();
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(40, 40, -40);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.intensity = 0.9;
    this.directionalLight.shadow.mapSize.set(2048, 2048);
    this.directionalLight.shadow.radius = 8;
    this.directionalLight.shadow.camera.near = 10;
    this.directionalLight.shadow.camera.far = 110;
    this.directionalLight.shadow.camera.left = -50;
    this.directionalLight.shadow.camera.right = 50;
    this.directionalLight.shadow.camera.top = 50;
    this.directionalLight.shadow.camera.bottom = -50;
    this.add(this.directionalLight);
    this.add(this.directionalLight.target);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(this.ambientLight);
  }

  public update(playerPosition: THREE.Vector3) {
    this.directionalLight.position.copy(playerPosition);
    this.directionalLight.position.add(new THREE.Vector3(40, 40, -40));
    this.directionalLight.target.position.copy(playerPosition);
  }
}
