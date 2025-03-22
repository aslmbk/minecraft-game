import * as THREE from "three";
import { blockMaterialUniforms, blockTextures } from "./Blocks";
import { Terrain, TerrainParams } from "./Terrain";
import { Loader } from "../Engine/Loader";

export type WorldParams = TerrainParams & {
  chunkDistance: number;
};

export class World extends THREE.Group {
  private params: WorldParams;
  public chunks: [Terrain, THREE.Object3D][] = [];
  private loader: Loader;

  constructor(params: WorldParams, loader: Loader) {
    super();
    this.params = params;
    this.loader = loader;
    this.loadTextures();
  }

  public generate() {
    this.clearWorld();
    for (
      let x = -this.params.chunkDistance;
      x <= this.params.chunkDistance;
      x++
    ) {
      for (
        let z = -this.params.chunkDistance;
        z <= this.params.chunkDistance;
        z++
      ) {
        const chunk = new Terrain(this.params);
        const position = {
          x: x * this.params.world.width,
          y: 0,
          z: z * this.params.world.width,
        };
        const instance = chunk.generate(position);
        instance.position.copy(position);
        instance.userData = { x, z };
        this.add(instance);
        this.chunks.push([chunk, instance]);
      }
    }
  }

  private loadTextures() {
    this.loader.loadTextureAtlas(blockTextures).then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      blockMaterialUniforms.uTextureAtlas.value = texture;
    });
  }

  public setParams(params: WorldParams) {
    this.params = params;
    this.chunks.forEach((chunk) => chunk[0].setParams(params));
  }

  public clearWorld() {
    this.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
    this.clear();
    this.chunks = [];
  }

  private worldCoordsToChunkCoords(x: number, y: number, z: number) {
    const chunkCoords = {
      x: Math.floor(x / this.params.world.width),
      z: Math.floor(z / this.params.world.width),
    };
    const blockCoords = {
      x: x - this.params.world.width * chunkCoords.x,
      y,
      z: z - this.params.world.width * chunkCoords.z,
    };
    return { chunkCoords, blockCoords };
  }

  private getChunk(x: number, z: number) {
    return this.chunks.find((chunk) => {
      return chunk[1].userData.x === x && chunk[1].userData.z === z;
    });
  }

  public getBlock(x: number, y: number, z: number) {
    const { chunkCoords, blockCoords } = this.worldCoordsToChunkCoords(x, y, z);
    const chunk = this.getChunk(chunkCoords.x, chunkCoords.z);
    if (!chunk) {
      return null;
    }
    return chunk[0].getBlock(blockCoords.x, blockCoords.y, blockCoords.z);
  }
}
