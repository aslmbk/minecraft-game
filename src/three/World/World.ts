import * as THREE from "three";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import { RNG } from "./RNG";
import { Blocks } from "./Blocks";

type WorldParams = {
  width: number;
  height: number;
  params: {
    seed: number;
    terrain: {
      scale: number;
      magnitude: number;
      offset: number;
    };
  };
  boxSize?: THREE.Vector3;
};
type DataType = {
  id: number;
  instanceId: number | null;
};

export class World extends THREE.Group {
  private width: number;
  private height: number;
  private boxSize: THREE.Vector3;
  private blockGeometry: THREE.BoxGeometry;
  private blockMaterial: THREE.MeshLambertMaterial;

  private data: DataType[][][] = [];
  private params: WorldParams["params"];

  constructor({
    width,
    height,
    params,
    boxSize = new THREE.Vector3(1, 1, 1),
  }: WorldParams) {
    super();
    this.width = width;
    this.height = height;
    this.boxSize = boxSize;
    this.params = params;
    this.blockGeometry = new THREE.BoxGeometry(
      this.boxSize.x,
      this.boxSize.y,
      this.boxSize.z
    );
    this.blockMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  }

  public generate() {
    this.initialize();
    this.generateTerrain();
    this.generateMeshes();
  }

  private initialize() {
    this.data = [];
    for (let x = 0; x < this.width; x++) {
      const slice: (typeof this.data)[number] = [];
      for (let y = 0; y < this.height; y++) {
        const row: (typeof this.data)[number][number] = [];
        for (let z = 0; z < this.width; z++) {
          row.push({
            id: Blocks.EMPTY.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  private generateTerrain() {
    const rng = new RNG(this.params.seed);
    const noiseGenerator = new SimplexNoise(rng);
    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.width; z++) {
        const value = noiseGenerator.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );
        const scaledNoise =
          this.params.terrain.offset + this.params.terrain.magnitude * value;
        let height = Math.floor(this.height * scaledNoise);
        height = Math.max(0, Math.min(height, this.height - 1));
        for (let y = 0; y < this.height; y++) {
          if (y === height) {
            this.setBlockId(x, y, z, Blocks.GRASS.id);
          } else if (y < height) {
            this.setBlockId(x, y, z, Blocks.DIRT.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, Blocks.EMPTY.id);
          }
        }
      }
    }
  }

  private generateMeshes() {
    this.clear();

    const maxCount = this.width * this.height * this.width;
    const instances = new THREE.InstancedMesh(
      this.blockGeometry,
      this.blockMaterial,
      maxCount
    );
    instances.count = 0;

    const blocks = Object.values(Blocks).map((block) => block);
    const matrix = new THREE.Matrix4();
    const offset = this.width / 2;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.width; z++) {
          const blockId = this.getBlock(x, y, z)?.id;
          const block = blocks.find((block) => block.id === blockId);
          const instanceId = instances.count;
          if (blockId !== Blocks.EMPTY.id && !this.isBlockObscured(x, y, z)) {
            matrix.makeTranslation(x - offset, y, z - offset);
            instances.setMatrixAt(instanceId, matrix);
            instances.setColorAt(instanceId, new THREE.Color(block.color));
            this.setBlockInstanceId(x, y, z, instanceId);
            instances.count++;
          }
        }
      }
    }

    this.add(instances);
  }

  private getBlock(x: number, y: number, z: number) {
    if (!this.inBounds(x, y, z)) return null;
    return this.data[x][y][z];
  }

  private setBlockId(x: number, y: number, z: number, id: number) {
    if (!this.inBounds(x, y, z)) return;
    this.data[x][y][z].id = id;
  }

  private setBlockInstanceId(
    x: number,
    y: number,
    z: number,
    instanceId: number
  ) {
    if (!this.inBounds(x, y, z)) return;
    this.data[x][y][z].instanceId = instanceId;
  }

  private inBounds(x: number, y: number, z: number) {
    return (
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height &&
      z >= 0 &&
      z < this.width
    );
  }

  private isBlockObscured(x: number, y: number, z: number) {
    const up = this.getBlock(x, y + 1, z)?.id ?? Blocks.EMPTY.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? Blocks.EMPTY.id;
    const left = this.getBlock(x + 1, y, z)?.id ?? Blocks.EMPTY.id;
    const right = this.getBlock(x - 1, y, z)?.id ?? Blocks.EMPTY.id;
    const forward = this.getBlock(x, y, z + 1)?.id ?? Blocks.EMPTY.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? Blocks.EMPTY.id;
    return (
      up !== Blocks.EMPTY.id &&
      down !== Blocks.EMPTY.id &&
      left !== Blocks.EMPTY.id &&
      right !== Blocks.EMPTY.id &&
      forward !== Blocks.EMPTY.id &&
      back !== Blocks.EMPTY.id
    );
  }

  public setWorldSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public setParams(params: WorldParams["params"]) {
    this.params = params;
  }

  public dispose() {
    this.blockGeometry.dispose();
    this.blockMaterial.dispose();
    this.clear();
  }
}
