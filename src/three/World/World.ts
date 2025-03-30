import * as THREE from "three";
import {
  blockGeometry,
  blockMaterialUniforms,
  blocks,
  blockTextures,
  selectedBlockMaterial,
} from "./Blocks";
import { Terrain, TerrainParams, TerrainPosition } from "./Terrain";
import { Loader } from "../Engine/Loader";
import { ActionsStore } from "./ActionsStore";

const matrix = new THREE.Matrix4();
const normal = new THREE.Vector3();

export type WorldParams = TerrainParams & {
  chunkDistance: number;
};

type ChunkCoords = { x: number; z: number };

export class World extends THREE.Group {
  private params: WorldParams;
  public chunks: Terrain[] = [];
  private loader: Loader;
  private idleAdding: ChunkCoords[] = [];
  public selectedBlock: THREE.Mesh;
  private lastPlayerPosition = new THREE.Vector3();
  private activeBlock = blocks.grass.id;

  constructor(params: WorldParams, loader: Loader) {
    super();
    this.params = params;
    this.loader = loader;
    this.loadTextures();
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
    if (force) new ActionsStore().clear();
    const playerPos = playerPosition ?? this.lastPlayerPosition;
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

  private worldCoordsToChunkCoords(pos: TerrainPosition) {
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

  private getChunk(x: number, z: number) {
    return this.chunks.find((chunk) => {
      return chunk.instance.userData.x === x && chunk.instance.userData.z === z;
    });
  }

  public getBlock(pos: TerrainPosition) {
    const { chunkCoords, blockCoords } = this.worldCoordsToChunkCoords(pos);
    const chunk = this.getChunk(chunkCoords.x, chunkCoords.z);
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
    const chunk = this.getChunk(
      intersection.object.userData.x,
      intersection.object.userData.z
    );
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
    const chunk = this.getChunk(coords.chunkCoords.x, coords.chunkCoords.z);
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
