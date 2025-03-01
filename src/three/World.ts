import * as THREE from "three";

type WorldParams = {
  size: number;
  boxSize?: THREE.Vector3;
};

export class World extends THREE.Group {
  private size: number;
  private boxSize: THREE.Vector3;
  private blockGeometry: THREE.BoxGeometry;
  private blockMaterial: THREE.MeshLambertMaterial;

  constructor({ size, boxSize = new THREE.Vector3(1, 1, 1) }: WorldParams) {
    super();
    this.size = size;
    this.boxSize = boxSize;
    this.blockGeometry = new THREE.BoxGeometry(
      this.boxSize.x,
      this.boxSize.y,
      this.boxSize.z
    );
    this.blockMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  }

  public generate() {
    const offset = this.size / 2;
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const block = new THREE.Mesh(this.blockGeometry, this.blockMaterial);
        block.position.set(x - offset, 0, z - offset);
        this.add(block);
      }
    }
  }

  public dispose() {
    this.blockGeometry.dispose();
    this.blockMaterial.dispose();
    this.clear();
  }
}
