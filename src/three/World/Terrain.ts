import { blocks, blockGeometry, blockNames } from "./Blocks";
import { RNG } from "./RNG";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import * as THREE from "three";
import { ActionsStore } from "./ActionsStore";

export type TerrainType = {
  id: number;
  instanceId: number | null;
};

export type TerrainParams = {
  seed: number;
  world: {
    width: number;
    height: number;
  };
  terrain: {
    scale: number;
    magnitude: number;
    offset: number;
  };
  blocks: {
    stone: {
      scale: { x: number; y: number; z: number };
      threshold: number;
    };
    coal: {
      scale: { x: number; y: number; z: number };
      threshold: number;
    };
    iron: {
      scale: { x: number; y: number; z: number };
      threshold: number;
    };
  };
};

export type Coords = {
  x: number;
  y: number;
  z: number;
};

export type ChunkCoords = Omit<Coords, "y">;

export class Terrain {
  private rng: RNG;
  private params: TerrainParams;
  private data: TerrainType[][][] = [];
  private instances: Record<string, THREE.InstancedMesh> = {};
  private chunkCoords: ChunkCoords;
  private worldCoords: Coords;
  public meshes = new THREE.Group();

  constructor(params: TerrainParams, chunkCoords: ChunkCoords) {
    this.params = params;
    this.chunkCoords = chunkCoords;
    this.worldCoords = {
      x: chunkCoords.x * this.params.world.width,
      y: 0,
      z: chunkCoords.z * this.params.world.width,
    };
    this.rng = new RNG(this.params.seed);
    this.meshes.userData = chunkCoords;
    this.meshes.position.copy(this.worldCoords);
    this.initializeMeshes();
  }

  private initializeMeshes() {
    const maxCount =
      this.params.world.width *
      this.params.world.height *
      this.params.world.width;

    for (const blockName of blockNames) {
      const block = blocks[blockName];
      if (!block.material) continue;
      const instance = new THREE.InstancedMesh(
        blockGeometry,
        block.material,
        maxCount
      );
      instance.castShadow = true;
      instance.receiveShadow = true;
      instance.count = 0;
      instance.userData = {
        blockId: block.id,
        x: this.chunkCoords.x,
        z: this.chunkCoords.z,
      };
      this.instances[block.id] = instance;
      this.meshes.add(instance);
    }
  }

  public initializeData() {
    this.data = [];
    for (let x = 0; x < this.params.world.width; x++) {
      const slice: (typeof this.data)[number] = [];
      for (let y = 0; y < this.params.world.height; y++) {
        const row: (typeof this.data)[number][number] = [];
        for (let z = 0; z < this.params.world.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  public generateResources() {
    const resources = [
      {
        resource: blocks.stone,
        scale: this.params.blocks.stone.scale,
        threshold: this.params.blocks.stone.threshold,
      },
      {
        resource: blocks.coal,
        scale: this.params.blocks.coal.scale,
        threshold: this.params.blocks.coal.threshold,
      },
      {
        resource: blocks.iron,
        scale: this.params.blocks.iron.scale,
        threshold: this.params.blocks.iron.threshold,
      },
    ];
    const noiseGenerator = new SimplexNoise(this.rng);
    for (let x = 0; x < this.params.world.width; x++) {
      for (let y = 0; y < this.params.world.height; y++) {
        for (let z = 0; z < this.params.world.width; z++) {
          for (const resource of resources) {
            const value = noiseGenerator.noise3d(
              (x + this.worldCoords.x) / resource.scale.x,
              (y + this.worldCoords.y) / resource.scale.y,
              (z + this.worldCoords.z) / resource.scale.z
            );
            if (value > resource.threshold) {
              this.setBlockId({ x, y, z }, resource.resource.id);
            }
          }
        }
      }
    }
  }

  public generateTerrain() {
    const noiseGenerator = new SimplexNoise(this.rng);
    for (let x = 0; x < this.params.world.width; x++) {
      for (let z = 0; z < this.params.world.width; z++) {
        const value = noiseGenerator.noise(
          (x + this.worldCoords.x) / this.params.terrain.scale,
          (z + this.worldCoords.z) / this.params.terrain.scale
        );
        const scaledNoise =
          this.params.terrain.offset + this.params.terrain.magnitude * value;
        let height = Math.floor(this.params.world.height * scaledNoise);
        height = Math.max(0, Math.min(height, this.params.world.height - 1));
        for (let y = 0; y < this.params.world.height; y++) {
          const pos = { x, y, z };
          const blockId = this.getBlock(pos)?.id;
          if (y === height && blockId === blocks.empty.id) {
            this.setBlockId(pos, blocks.grass.id);
          } else if (y < height && blockId === blocks.empty.id) {
            this.setBlockId(pos, blocks.dirt.id);
          } else if (y > height) {
            this.setBlockId(pos, blocks.empty.id);
          }
        }
      }
    }
  }

  public generateActions() {
    new ActionsStore().forEachBlock(
      { x: this.chunkCoords.x, y: 0, z: this.chunkCoords.z },
      this.setBlockId.bind(this)
    );
  }

  public generateMeshes() {
    const matrix = new THREE.Matrix4();

    for (let x = 0; x < this.params.world.width; x++) {
      for (let y = 0; y < this.params.world.height; y++) {
        for (let z = 0; z < this.params.world.width; z++) {
          const pos = { x, y, z };
          const block = this.getBlock(pos);
          const instance = this.instances[block?.id ?? ""];
          if (!instance || this.isBlockObscured(pos)) continue;
          const instanceId = instance.count++;
          matrix.setPosition(x, y, z);
          instance.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(pos, instanceId);
        }
      }
    }

    for (const instanceId in this.instances) {
      const instance = this.instances[instanceId];
      instance.instanceMatrix.needsUpdate = true;
      instance.computeBoundingSphere();
    }
  }

  public getBlock(pos: Coords) {
    if (!this.inBounds(pos)) return null;
    return this.data[pos.x][pos.y][pos.z];
  }

  private setBlockId(pos: Coords, id: number) {
    if (!this.inBounds(pos)) return;
    this.data[pos.x][pos.y][pos.z].id = id;
  }

  private setBlockInstanceId(
    pos: Coords,
    instanceId: TerrainType["instanceId"]
  ) {
    if (!this.inBounds(pos)) return;
    this.data[pos.x][pos.y][pos.z].instanceId = instanceId;
  }

  private inBounds({ x, y, z }: Coords) {
    return (
      x >= 0 &&
      x < this.params.world.width &&
      y >= 0 &&
      y < this.params.world.height &&
      z >= 0 &&
      z < this.params.world.width
    );
  }

  private isBlockObscured({ x, y, z }: Coords) {
    const up = this.getBlock({ x, y: y + 1, z })?.id ?? blocks.empty.id;
    const down = this.getBlock({ x, y: y - 1, z })?.id ?? blocks.empty.id;
    const left = this.getBlock({ x: x + 1, y, z })?.id ?? blocks.empty.id;
    const right = this.getBlock({ x: x - 1, y, z })?.id ?? blocks.empty.id;
    const forward = this.getBlock({ x, y, z: z + 1 })?.id ?? blocks.empty.id;
    const back = this.getBlock({ x, y, z: z - 1 })?.id ?? blocks.empty.id;
    return (
      up !== blocks.empty.id &&
      down !== blocks.empty.id &&
      left !== blocks.empty.id &&
      right !== blocks.empty.id &&
      forward !== blocks.empty.id &&
      back !== blocks.empty.id
    );
  }

  public removeBlock(pos: Coords) {
    const block = this.getBlock(pos);
    if (!block || block.id === blocks.empty.id || !block.instanceId) return;
    this.removeBlockInstance(pos);
    this.setBlockId(pos, blocks.empty.id);

    this.addBlockInstance({ x: pos.x + 1, y: pos.y, z: pos.z });
    this.addBlockInstance({ x: pos.x - 1, y: pos.y, z: pos.z });
    this.addBlockInstance({ x: pos.x, y: pos.y + 1, z: pos.z });
    this.addBlockInstance({ x: pos.x, y: pos.y - 1, z: pos.z });
    this.addBlockInstance({ x: pos.x, y: pos.y, z: pos.z + 1 });
    this.addBlockInstance({ x: pos.x, y: pos.y, z: pos.z - 1 });
  }

  public addBlock(pos: Coords, id: number) {
    const block = this.getBlock(pos);
    if (!block || block.id !== blocks.empty.id) return;
    this.setBlockId(pos, id);
    this.addBlockInstance(pos);

    const blockCoords = [
      { x: pos.x + 1, y: pos.y, z: pos.z },
      { x: pos.x - 1, y: pos.y, z: pos.z },
      { x: pos.x, y: pos.y + 1, z: pos.z },
      { x: pos.x, y: pos.y - 1, z: pos.z },
      { x: pos.x, y: pos.y, z: pos.z + 1 },
      { x: pos.x, y: pos.y, z: pos.z - 1 },
    ];
    for (const blockCoord of blockCoords) {
      if (this.isBlockObscured(blockCoord)) {
        this.removeBlockInstance(blockCoord);
      }
    }
  }

  private addBlockInstance(pos: Coords) {
    const block = this.getBlock(pos);
    if (!block || block.id === blocks.empty.id || block.instanceId) return;
    const instance = this.instances[block.id];
    const matrix = new THREE.Matrix4();
    matrix.setPosition(pos.x, pos.y, pos.z);
    const instanceId = instance.count++;
    instance.setMatrixAt(instanceId, matrix);
    this.setBlockInstanceId(pos, instanceId);

    instance.instanceMatrix.needsUpdate = true;
    instance.computeBoundingSphere();
  }

  private removeBlockInstance(pos: Coords) {
    const block = this.getBlock(pos);
    if (!block || block.id === blocks.empty.id || !block.instanceId) return;
    const instance = this.instances[block.id];
    const matrix = new THREE.Matrix4();
    instance.getMatrixAt(instance.count - 1, matrix);
    instance.setMatrixAt(block.instanceId, matrix);
    instance.count--;
    this.setBlockInstanceId(
      new THREE.Vector3().applyMatrix4(matrix),
      block.instanceId
    );
    this.setBlockInstanceId(pos, null);

    instance.instanceMatrix.needsUpdate = true;
    instance.computeBoundingSphere();
  }
}
