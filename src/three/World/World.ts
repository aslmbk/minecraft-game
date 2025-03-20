import * as THREE from "three";
import { blocks } from "./Blocks";
import { Terrain, TerrainParams } from "./Terrain";
import { Loader } from "../Engine/Loader";

export type WorldParams = TerrainParams;

export class World extends THREE.Group {
  private blockGeometry: THREE.BoxGeometry;
  private blockMaterial: THREE.MeshLambertMaterial;
  private blockMaterialUniforms: Record<string, THREE.IUniform> | null = null;
  private params: WorldParams;
  public terrain: Terrain;
  private loader: Loader;

  constructor(params: WorldParams) {
    super();
    this.params = params;
    this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.blockMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
    });

    this.loader = new Loader();
    this.blockMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTextureAtlas = new THREE.Uniform(null);
      this.blockMaterialUniforms = shader.uniforms;

      shader.defines ??= {};
      shader.defines.USE_UV = true;

      shader.vertexShader = shader.vertexShader.replace(
        /* glsl */ `#define LAMBERT`,
        /* glsl */ `#define LAMBERT
        attribute float blockType;
        varying float vBlockType;
        varying vec3 vObjectNormal;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        /* glsl */ `vViewPosition = - mvPosition.xyz;`,
        /* glsl */ `vViewPosition = - mvPosition.xyz;
        vBlockType = blockType;
        vObjectNormal = normal;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        /* glsl */ `#define LAMBERT`,
        /* glsl */ `#define LAMBERT
        uniform sampler2DArray uTextureAtlas;
        varying float vBlockType;
        varying vec3 vObjectNormal;
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        /* glsl */ `#include <map_fragment>`,
        /* glsl */ `#include <map_fragment>
        int blockType = int(round(vBlockType));
        if (blockType == ${blocks.grass.id}) {
          if (dot(vObjectNormal, vec3(0.0, 1.0, 0.0)) > 0.0) {
            diffuseColor *= texture(uTextureAtlas, vec3(vUv, 1));
          } else if (dot(vObjectNormal, vec3(0.0, -1.0, 0.0)) > 0.0) {
            diffuseColor *= texture(uTextureAtlas, vec3(vUv, 3));
          } else {
            diffuseColor *= texture(uTextureAtlas, vec3(vUv, 2));
          }
        } else if (blockType == ${blocks.dirt.id}) {
          diffuseColor *= texture(uTextureAtlas, vec3(vUv, 3));
        } else if (blockType == ${blocks.stone.id}) {
          diffuseColor *= texture(uTextureAtlas, vec3(vUv, 0));
        } else if (blockType == ${blocks.coal.id}) {
          diffuseColor *= texture(uTextureAtlas, vec3(vUv, 4));
        } else if (blockType == ${blocks.iron.id}) {
          diffuseColor *= texture(uTextureAtlas, vec3(vUv, 5));
        }
        `
      );
      this.loadTextures();
    };
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
    instances.castShadow = true;
    instances.receiveShadow = true;

    const blockTypeAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxCount),
      1
    );
    this.blockGeometry.setAttribute("blockType", blockTypeAttribute);

    const blocksArray = Object.values(blocks);
    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.params.world.width; x++) {
      for (let y = 0; y < this.params.world.height; y++) {
        for (let z = 0; z < this.params.world.width; z++) {
          const blockId = this.terrain.getBlock(x, y, z)?.id;
          if (
            blockId === blocks.empty.id ||
            this.terrain.isBlockObscured(x, y, z)
          ) {
            continue;
          }
          const block = blocksArray.find((block) => block.id === blockId)!;
          const instanceId = instances.count++;
          matrix.setPosition(x, y, z);
          instances.setMatrixAt(instanceId, matrix);
          blockTypeAttribute.setX(instanceId, block.id);
          this.terrain.setBlockInstanceId(x, y, z, instanceId);
        }
      }
    }

    this.add(instances);
  }

  private loadTextures() {
    const textureAtlas = this.loader.loadTextureAtlas({
      name: "blocks",
      urls: [
        "textures/stone.png",
        "textures/grass.png",
        "textures/grass_side.png",
        "textures/dirt.png",
        "textures/coal_ore.png",
        "textures/iron_ore.png",
      ],
    });

    textureAtlas.onLoad = () => {
      const texture = textureAtlas.Info["blocks"].atlas;
      if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        this.blockMaterialUniforms!.uTextureAtlas.value = texture;
      }
    };
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
