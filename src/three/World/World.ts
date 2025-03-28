import * as THREE from "three";
import { blockMaterialUniforms, blockTextures } from "./Blocks";
import { Terrain, TerrainParams } from "./Terrain";
import { Loader } from "../Engine/Loader";

export type WorldParams = TerrainParams & {
  chunkDistance: number;
};

type ChunkCoords = { x: number; z: number };

export class World extends THREE.Group {
  private params: WorldParams;
  public chunks: Terrain[] = [];
  private loader: Loader;
  private idleAdding: ChunkCoords[] = [];

  private lastPlayerPosition = new THREE.Vector3();

  constructor(params: WorldParams, loader: Loader) {
    super();
    this.params = params;
    this.loader = loader;
    this.loadTextures();
  }

  public generate({
    playerPosition,
    force,
  }: {
    playerPosition?: THREE.Vector3;
    force?: boolean;
  } = {}) {
    const playerPos = playerPosition ?? this.lastPlayerPosition;
    const { chunkCoords } = this.worldCoordsToChunkCoords(
      playerPos.x,
      playerPos.y,
      playerPos.z
    );
    const visibleChunksCoords: ChunkCoords[] = [];
    for (
      let x = chunkCoords.x - this.params.chunkDistance;
      x <= chunkCoords.x + this.params.chunkDistance;
      x++
    ) {
      for (
        let z = chunkCoords.z - this.params.chunkDistance;
        z <= chunkCoords.z + this.params.chunkDistance;
        z++
      ) {
        visibleChunksCoords.push({ x, z });
      }
    }
    [...this.chunks].forEach((chunk) => {
      if (
        !visibleChunksCoords.some(
          (coord) =>
            coord.x === chunk.instance.userData.x &&
            coord.z === chunk.instance.userData.z
        ) ||
        force
      ) {
        this.deleteChunk(chunk);
      }
    });
    visibleChunksCoords.forEach((coords) => {
      if (
        this.getChunk(coords.x, coords.z) ||
        this.idleAdding.some((c) => c.x === coords.x && c.z === coords.z)
      ) {
        return;
      }
      this.idleAdding.push(coords);
      Promise.resolve().then(() => {
        this.addChunk(coords);
        this.idleAdding = this.idleAdding.filter(
          (c) => c.x !== coords.x && c.z !== coords.z
        );
      });
    });
  }

  private addChunk({ x, z }: ChunkCoords) {
    const position = {
      x: x * this.params.world.width,
      y: 0,
      z: z * this.params.world.width,
    };
    const chunk = new Terrain(this.params, position);
    chunk.instance.position.copy(position);
    chunk.instance.userData = { x, z };
    this.add(chunk.instance);
    this.chunks.push(chunk);
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
    this.chunks.forEach((chunk) => chunk.setParams(params));
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
      return chunk.instance.userData.x === x && chunk.instance.userData.z === z;
    });
  }

  public getBlock(x: number, y: number, z: number) {
    const { chunkCoords, blockCoords } = this.worldCoordsToChunkCoords(x, y, z);
    const chunk = this.getChunk(chunkCoords.x, chunkCoords.z);
    if (!chunk) {
      return null;
    }
    return chunk.getBlock(blockCoords.x, blockCoords.y, blockCoords.z);
  }

  private deleteChunk(chunk: Terrain) {
    this.remove(chunk.instance);
    chunk.instance.geometry.dispose();
    this.chunks.splice(this.chunks.indexOf(chunk), 1);
  }
}
