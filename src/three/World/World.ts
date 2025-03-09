import * as THREE from "three";
import { Blocks } from "./Blocks";
import { Terrain, TerrainParams } from "./Terrain";
import vertexShader from "./shaders/blocks/vertex.glsl";
import fragmentShader from "./shaders/blocks/fragment.glsl";

export type WorldParams = TerrainParams;

export class World extends THREE.Group {
  private blockGeometry: THREE.BoxGeometry;
  private blockMaterial: THREE.ShaderMaterial;
  private params: WorldParams;
  private terrain: Terrain;

  constructor(params: WorldParams) {
    super();
    this.params = params;
    this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.blockMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      vertexColors: true,
      lights: true,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        THREE.UniformsLib.fog,
        {
          diffuse: { value: new THREE.Color(0xffffff) },
          emissive: { value: new THREE.Color(0x000000) },
          opacity: { value: 1.0 },
        },
      ]),
    });
    this.terrain = new Terrain(params);
  }

  public generate() {
    this.terrain.generate();
    this.generateMeshes();
  }

  private generateMeshes() {
    this.clear();

    const maxCount =
      this.params.world.width *
      this.params.world.height *
      this.params.world.width;
    const instances = new THREE.InstancedMesh(
      this.blockGeometry,
      this.blockMaterial,
      maxCount
    );
    instances.count = 0;

    const blocks = Object.values(Blocks).map((block) => block);
    const matrix = new THREE.Matrix4();
    const offset = this.params.world.width / 2;
    for (let x = 0; x < this.params.world.width; x++) {
      for (let y = 0; y < this.params.world.height; y++) {
        for (let z = 0; z < this.params.world.width; z++) {
          const blockId = this.terrain.getBlock(x, y, z)?.id;
          const block = blocks.find((block) => block.id === blockId);
          const instanceId = instances.count;
          if (
            blockId !== Blocks.EMPTY.id &&
            !this.terrain.isBlockObscured(x, y, z)
          ) {
            matrix.makeTranslation(x - offset, y, z - offset);
            instances.setMatrixAt(instanceId, matrix);
            instances.setColorAt(instanceId, new THREE.Color(block.color));
            this.terrain.setBlockInstanceId(x, y, z, instanceId);
            instances.count++;
          }
        }
      }
    }

    this.add(instances);
  }

  public setParams(params: WorldParams) {
    this.params = params;
    this.terrain.setParams(params);
  }

  public dispose() {
    this.blockGeometry.dispose();
    this.blockMaterial.dispose();
    this.clear();
  }
}
