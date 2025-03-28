import * as THREE from "three";

type Block<T extends string> = {
  id: number;
  name: T;
  color: string | number;
  textureIndex: number;
  keyCode: string;
};

export const blockNames = [
  "empty",
  "grass",
  "dirt",
  "stone",
  "coal",
  "iron",
] as const;

export const blockTextures = [
  "textures/grass.png",
  "textures/grass_side.png",
  "textures/dirt.png",
  "textures/stone.png",
  "textures/coal_ore.png",
  "textures/iron_ore.png",
];

export type BlockNameType = (typeof blockNames)[number];

export type BlocksInterface = {
  [K in BlockNameType]: Block<K>;
};

export const blocks: BlocksInterface = {
  empty: {
    id: 0,
    name: "empty",
    color: "transparent",
    textureIndex: -1,
    keyCode: "Digit0",
  },
  grass: {
    id: 1,
    name: "grass",
    color: 0x559020,
    textureIndex: 0,
    keyCode: "Digit1",
  },
  dirt: {
    id: 3,
    name: "dirt",
    color: 0x807020,
    textureIndex: 2,
    keyCode: "Digit2",
  },
  stone: {
    id: 4,
    name: "stone",
    color: 0x808080,
    textureIndex: 3,
    keyCode: "Digit3",
  },
  coal: {
    id: 5,
    name: "coal",
    color: 0x202020,
    textureIndex: 4,
    keyCode: "Digit4",
  },
  iron: {
    id: 6,
    name: "iron",
    color: 0x806060,
    textureIndex: 5,
    keyCode: "Digit5",
  },
};

export const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
export const blockMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});
export const blockMaterialUniforms = {
  uTextureAtlas: new THREE.Uniform<THREE.Texture>(
    null as unknown as THREE.Texture
  ),
};
export const selectedBlockMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffaa,
  transparent: true,
  opacity: 0.3,
});

blockMaterial.onBeforeCompile = (shader) => {
  shader.uniforms = {
    ...shader.uniforms,
    ...blockMaterialUniforms,
  };

  shader.defines ??= {};
  shader.defines.USE_UV = true;

  shader.vertexShader = shader.vertexShader.replace(
    /* glsl */ `#define LAMBERT`,
    /* glsl */ `#define LAMBERT
    attribute float textureID;
    varying float vTextureID;
    varying vec3 vObjectNormal;
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    /* glsl */ `vViewPosition = - mvPosition.xyz;`,
    /* glsl */ `vViewPosition = - mvPosition.xyz;
    vTextureID = textureID;
    vObjectNormal = normal;
    `
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    /* glsl */ `#define LAMBERT`,
    /* glsl */ `#define LAMBERT
    uniform sampler2DArray uTextureAtlas;
    varying float vTextureID;
    varying vec3 vObjectNormal;
    `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    /* glsl */ `#include <map_fragment>`,
    /* glsl */ `#include <map_fragment>
    int textureID = int(round(vTextureID));
    vec3 nNormal = normalize(vObjectNormal);
    vec4 blockColor = texture(uTextureAtlas, vec3(vUv, textureID));
    if (textureID == ${blocks.grass.textureIndex}) {
      if (dot(nNormal, vec3(0.0, -1.0, 0.0)) > 0.5) {
        blockColor = texture(uTextureAtlas, vec3(vUv, ${blocks.dirt.textureIndex}));
      } else if (dot(nNormal, vec3(0.0, 1.0, 0.0)) < 0.5) {
        blockColor = texture(uTextureAtlas, vec3(vUv, textureID + 1));
      }
    }
    diffuseColor *= blockColor;
    `
  );
};
