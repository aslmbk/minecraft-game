import * as THREE from "three";
import { blockMaterialUniforms, blockTextures } from "./Blocks";
import { Terrain, TerrainParams } from "./Terrain";
import { Loader } from "../Engine/Loader";

export type WorldParams = TerrainParams & {
  chunkDistance: number;
};

type ChunkType = [Terrain, THREE.InstancedMesh];
type ChunkCoords = { x: number; z: number };

export class World extends THREE.Group {
  private params: WorldParams;
  public chunks: ChunkType[] = [];
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
            coord.x === chunk[1].userData.x && coord.z === chunk[1].userData.z
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
      requestIdleCallback(() => {
        this.addChunk(coords);
        this.idleAdding = this.idleAdding.filter(
          (c) => c.x !== coords.x && c.z !== coords.z
        );
      });
    });
  }

  private addChunk({ x, z }: ChunkCoords) {
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

  private deleteChunk(chunk: ChunkType) {
    chunk[1].geometry.dispose();
    this.remove(chunk[1]);
    this.chunks.splice(this.chunks.indexOf(chunk), 1);
  }
}
