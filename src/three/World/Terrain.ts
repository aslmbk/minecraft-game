import { Blocks } from "./Blocks";
import { RNG } from "./RNG";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";

type TerrainType = {
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

export class Terrain {
  private rng: RNG;
  public data: TerrainType[][][] = [];
  private params: TerrainParams;

  constructor(params: TerrainParams) {
    this.params = params;
    this.rng = new RNG(this.params.seed);
    this.data = [];
  }

  public generate() {
    this.rng = new RNG(this.params.seed);
    this.initialize();
    this.generateResources();
    this.generateTerrain();
  }

  private initialize() {
    this.data = [];
    for (let x = 0; x < this.params.world.width; x++) {
      const slice: (typeof this.data)[number] = [];
      for (let y = 0; y < this.params.world.height; y++) {
        const row: (typeof this.data)[number][number] = [];
        for (let z = 0; z < this.params.world.width; z++) {
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

  private generateResources() {
    const resources = [
      {
        resource: Blocks.STONE,
        scale: this.params.blocks.stone.scale,
        threshold: this.params.blocks.stone.threshold,
      },
      {
        resource: Blocks.COAL,
        scale: this.params.blocks.coal.scale,
        threshold: this.params.blocks.coal.threshold,
      },
      {
        resource: Blocks.IRON,
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
              x / resource.scale.x,
              y / resource.scale.y,
              z / resource.scale.z
            );
            if (value > resource.threshold) {
              this.setBlockId(x, y, z, resource.resource.id);
            }
          }
        }
      }
    }
  }

  private generateTerrain() {
    const noiseGenerator = new SimplexNoise(this.rng);
    for (let x = 0; x < this.params.world.width; x++) {
      for (let z = 0; z < this.params.world.width; z++) {
        const value = noiseGenerator.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );
        const scaledNoise =
          this.params.terrain.offset + this.params.terrain.magnitude * value;
        let height = Math.floor(this.params.world.height * scaledNoise);
        height = Math.max(0, Math.min(height, this.params.world.height - 1));
        for (let y = 0; y < this.params.world.height; y++) {
          if (y === height) {
            this.setBlockId(x, y, z, Blocks.GRASS.id);
          } else if (
            y < height &&
            this.getBlock(x, y, z)?.id === Blocks.EMPTY.id
          ) {
            this.setBlockId(x, y, z, Blocks.DIRT.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, Blocks.EMPTY.id);
          }
        }
      }
    }
  }

  public getBlock(x: number, y: number, z: number) {
    if (!this.inBounds(x, y, z)) return null;
    return this.data[x][y][z];
  }

  public setBlockId(x: number, y: number, z: number, id: number) {
    if (!this.inBounds(x, y, z)) return;
    this.data[x][y][z].id = id;
  }

  public setBlockInstanceId(
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
      x < this.params.world.width &&
      y >= 0 &&
      y < this.params.world.height &&
      z >= 0 &&
      z < this.params.world.width
    );
  }

  public isBlockObscured(x: number, y: number, z: number) {
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

  public setParams(params: TerrainParams) {
    this.params = params;
  }
}
