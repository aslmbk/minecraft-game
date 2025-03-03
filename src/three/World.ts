import * as THREE from "three";

type WorldParams = {
  width: number;
  height: number;
  boxSize?: THREE.Vector3;
};

export class World extends THREE.Group {
  private width: number;
  private height: number;
  private boxSize: THREE.Vector3;
  private blockGeometry: THREE.BoxGeometry;
  private blockMaterial: THREE.MeshLambertMaterial;

  constructor({
    width,
    height,
    boxSize = new THREE.Vector3(1, 1, 1),
  }: WorldParams) {
    super();
    this.width = width;
    this.height = height;
    this.boxSize = boxSize;
    this.blockGeometry = new THREE.BoxGeometry(
      this.boxSize.x,
      this.boxSize.y,
      this.boxSize.z
    );
    this.blockMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  }

  public generate() {
    const offset = this.width / 2;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.width; z++) {
          const block = new THREE.Mesh(this.blockGeometry, this.blockMaterial);
          block.position.set(x - offset, y, z - offset);
          this.add(block);
        }
      }
    }
  }

  public dispose() {
    this.blockGeometry.dispose();
    this.blockMaterial.dispose();
    this.clear();
  }
}
