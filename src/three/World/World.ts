import * as THREE from "three";
import { blockGeometry, blocks, selectedBlockMaterial } from "./Blocks";
import { Terrain, TerrainParams, Coords, ChunkCoords } from "./Terrain";
import { ActionsStore } from "./ActionsStore";

const matrix = new THREE.Matrix4();
const normal = new THREE.Vector3();

export type WorldParams = TerrainParams & {
  chunkDistance: number;
};

export class World extends THREE.Group {
  private params: WorldParams;
  public chunks: Terrain[] = [];
  private idleAdding: ChunkCoords[] = [];
  public selectedBlock: THREE.Mesh;
  private lastPlayerPosition = new THREE.Vector3();
  private activeBlock = blocks.grass.id;
  private timeoutId: number | null = null;

  constructor(params: WorldParams) {
    super();
    this.params = params;
    this.selectedBlock = new THREE.Mesh(blockGeometry, selectedBlockMaterial);
    this.selectedBlock.scale.multiplyScalar(1.01);
    this.selectedBlock.visible = false;
  }

  public generate({
    playerPosition,
    force,
  }: {
    playerPosition?: THREE.Vector3;
    force?: boolean;
  } = {}) {
    if (!this.idleAdding.length) return;
    if (force) new ActionsStore().clear();
    const playerPos = playerPosition ?? this.lastPlayerPosition;
    this.lastPlayerPosition.copy(playerPos);
    const { chunkCoords } = this.worldCoordsToChunkCoords(playerPos);
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
        this.getChunk(coords) ||
        this.idleAdding.some((c) => c.x === coords.x && c.z === coords.z)
      ) {
        return;
      }
      this.idleAdding.push(coords);
    });
    if (this.idleAdding.length) {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.idleAdding = [];
      }, 1000);
      this.addChunks();
    }
  }

  private async addChunks() {
    const lastChunks = await Promise.all(
      this.idleAdding.map((coords) => {
        const chunk = new Terrain(this.params, coords);
        this.add(chunk.instance);
        this.chunks.push(chunk);
        return chunk;
      })
    );
    await Promise.all(lastChunks.map((chunk) => chunk.generateMeshes()));
  }

  public setParams(params: WorldParams) {
    this.params = params;
  }

  private worldCoordsToChunkCoords(pos: Coords) {
    const chunkCoords = {
      x: Math.floor(pos.x / this.params.world.width),
      z: Math.floor(pos.z / this.params.world.width),
    };
    const blockCoords = {
      x: pos.x - this.params.world.width * chunkCoords.x,
      y: pos.y,
      z: pos.z - this.params.world.width * chunkCoords.z,
    };
    return { chunkCoords, blockCoords };
  }

  private getChunk(coords: ChunkCoords) {
    return this.chunks.find((chunk) => {
      return (
        chunk.instance.userData.x === coords.x &&
        chunk.instance.userData.z === coords.z
      );
    });
  }

  public getBlock(pos: Coords) {
    const { chunkCoords, blockCoords } = this.worldCoordsToChunkCoords(pos);
    const chunk = this.getChunk(chunkCoords);
    if (!chunk) {
      return null;
    }
    return chunk.getBlock(blockCoords);
  }

  private deleteChunk(chunk: Terrain) {
    this.remove(chunk.instance);
    chunk.instance.geometry.dispose();
    this.chunks.splice(this.chunks.indexOf(chunk), 1);
  }

  public intersectionHandler(
    intersection: THREE.Intersection<THREE.InstancedMesh>
  ) {
    const chunk = this.getChunk(intersection.object.userData as ChunkCoords);
    if (!chunk) return;
    intersection.object.getMatrixAt(intersection.instanceId!, matrix);
    this.selectedBlock.position.copy(
      chunk.instance.position.clone().applyMatrix4(matrix)
    );
    if (this.activeBlock !== blocks.empty.id) {
      this.selectedBlock.position.add(intersection.normal ?? normal);
    }
    this.selectedBlock.visible = true;
  }

  public nonIntersectionHandler() {
    this.selectedBlock.visible = false;
  }

  public submitBlock() {
    if (!this.selectedBlock.visible) return;
    const coords = this.worldCoordsToChunkCoords(this.selectedBlock.position);
    const chunk = this.getChunk(coords.chunkCoords);
    if (!chunk) return;
    if (this.activeBlock === blocks.empty.id) {
      chunk.removeBlock(coords.blockCoords);
    } else {
      chunk.addBlock(coords.blockCoords, this.activeBlock);
    }
    new ActionsStore().commit(
      { x: coords.chunkCoords.x, y: 0, z: coords.chunkCoords.z },
      coords.blockCoords,
      this.activeBlock
    );
  }

  public setActiveBlock(keyCode: string) {
    const block = Object.values(blocks).find(
      (block) => block.keyCode === keyCode
    );
    if (block) this.activeBlock = block.id;
  }
}
