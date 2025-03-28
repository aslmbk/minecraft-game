import { blocks, blockGeometry, blockMaterial } from "./Blocks";
import { RNG } from "./RNG";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import * as THREE from "three";

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

export type TerrainPosition = {
  x: number;
  y: number;
  z: number;
};

export class Terrain {
  private rng: RNG;
  private data: TerrainType[][][] = [];
  private params: TerrainParams;
  public instance!: THREE.InstancedMesh;

  constructor(
    params: TerrainParams,
    position: TerrainPosition = { x: 0, y: 0, z: 0 }
  ) {
    this.params = params;
    this.rng = new RNG(this.params.seed);
    this.initialize();
    this.generateResources(position);
    this.generateTerrain(position);
    this.generateMeshes();
  }

  private initialize() {
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

  private generateResources(position: TerrainPosition) {
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
              (x + position.x) / resource.scale.x,
              (y + position.y) / resource.scale.y,
              (z + position.z) / resource.scale.z
            );
            if (value > resource.threshold) {
              this.setBlockId({ x, y, z }, resource.resource.id);
            }
          }
        }
      }
    }
  }

  private generateTerrain(position: TerrainPosition) {
    const noiseGenerator = new SimplexNoise(this.rng);
    for (let x = 0; x < this.params.world.width; x++) {
      for (let z = 0; z < this.params.world.width; z++) {
        const value = noiseGenerator.noise(
          (x + position.x) / this.params.terrain.scale,
          (z + position.z) / this.params.terrain.scale
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

  private generateMeshes() {
    const geometry = blockGeometry.clone();
    const maxCount =
      this.params.world.width *
      this.params.world.height *
      this.params.world.width;
    this.instance = new THREE.InstancedMesh(geometry, blockMaterial, maxCount);
    this.instance.count = 0;
    this.instance.castShadow = true;
    this.instance.receiveShadow = true;

    const textureIDAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxCount),
      1
    );
    geometry.setAttribute("textureID", textureIDAttribute);

    const blocksArray = Object.values(blocks);
    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.params.world.width; x++) {
      for (let y = 0; y < this.params.world.height; y++) {
        for (let z = 0; z < this.params.world.width; z++) {
          const pos = { x, y, z };
          const blockId = this.getBlock(pos)?.id;
          if (blockId === blocks.empty.id || this.isBlockObscured(pos)) {
            continue;
          }
          const block = blocksArray.find((block) => block.id === blockId)!;
          const instanceId = this.instance.count++;
          matrix.setPosition(x, y, z);
          this.instance.setMatrixAt(instanceId, matrix);
          textureIDAttribute.setX(instanceId, block.textureIndex);
          this.setBlockInstanceId(pos, instanceId);
        }
      }
    }
  }

  public getBlock(pos: TerrainPosition) {
    if (!this.inBounds(pos)) return null;
    return this.data[pos.x][pos.y][pos.z];
  }

  public setBlockId(pos: TerrainPosition, id: number) {
    if (!this.inBounds(pos)) return;
    this.data[pos.x][pos.y][pos.z].id = id;
  }

  public setBlockInstanceId(
    pos: TerrainPosition,
    instanceId: TerrainType["instanceId"]
  ) {
    if (!this.inBounds(pos)) return;
    this.data[pos.x][pos.y][pos.z].instanceId = instanceId;
  }

  private inBounds({ x, y, z }: TerrainPosition) {
    return (
      x >= 0 &&
      x < this.params.world.width &&
      y >= 0 &&
      y < this.params.world.height &&
      z >= 0 &&
      z < this.params.world.width
    );
  }

  public isBlockObscured({ x, y, z }: TerrainPosition) {
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

  public removeBlock(pos: TerrainPosition) {
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

    this.instance.geometry.attributes.textureID.needsUpdate = true;
    this.instance.instanceMatrix.needsUpdate = true;
    this.instance.computeBoundingSphere();
  }

  public addBlock(pos: TerrainPosition, id: number) {
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

    this.instance.geometry.attributes.textureID.needsUpdate = true;
    this.instance.instanceMatrix.needsUpdate = true;
    this.instance.computeBoundingSphere();
  }

  public addBlockInstance(pos: TerrainPosition) {
    const block = this.getBlock(pos);
    if (!block || block.id === blocks.empty.id || block.instanceId) return;
    const blocksArray = Object.values(blocks);
    const matrix = new THREE.Matrix4();
    const instanceId = this.instance.count++;
    this.setBlockInstanceId(pos, instanceId);
    matrix.setPosition(pos.x, pos.y, pos.z);
    this.instance.setMatrixAt(instanceId, matrix);
    const blockData = blocksArray.find(({ id }) => block.id === id)!;
    this.instance.geometry.attributes.textureID.setX(
      instanceId,
      blockData.textureIndex
    );
  }

  private removeBlockInstance(pos: TerrainPosition) {
    const block = this.getBlock(pos);
    if (!block || block.id === blocks.empty.id || !block.instanceId) return;
    const matrix = new THREE.Matrix4();
    this.instance.getMatrixAt(this.instance.count - 1, matrix);
    this.instance.setMatrixAt(block.instanceId, matrix);

    this.instance.geometry.attributes.textureID.setX(
      block.instanceId,
      this.instance.geometry.attributes.textureID.getX(this.instance.count - 1)
    );

    this.instance.count--;
    this.setBlockInstanceId(pos, null);
    this.setBlockInstanceId(
      new THREE.Vector3().applyMatrix4(matrix),
      block.instanceId
    );
  }

  public setParams(params: TerrainParams) {
    this.params = params;
  }
}
