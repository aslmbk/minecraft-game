import * as THREE from "three";

type DirectionalLight = {
  color: THREE.ColorRepresentation;
  intensity: number;
  position: THREE.Vector3;
};

type AmbientLight = {
  color: THREE.ColorRepresentation;
  intensity: number;
};

export class Lights {
  public createDirectionalLight({
    color = 0xffffff,
    intensity = 1,
    position = new THREE.Vector3(1, 1, 1),
  }: DirectionalLight) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);
    return light;
  }

  public createAmbientLight({ color = 0xffffff, intensity = 1 }: AmbientLight) {
    const light = new THREE.AmbientLight(color, intensity);
    return light;
  }
}
