import * as THREE from "three";

type Block<T extends string> = {
  id: number;
  name: T;
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
  "leaves",
  "tree",
  "sand",
  "cloud",
] as const;

export const blockTextures = [
  "textures/grass.png",
  "textures/grass_side.png",
  "textures/dirt.png",
  "textures/stone.png",
  "textures/coal_ore.png",
  "textures/iron_ore.png",
  "textures/leaves.png",
  "textures/tree_top.png",
  "textures/tree_side.png",
  "textures/sand.png",
  "textures/snow.png",
];

type BlockNameType = (typeof blockNames)[number];

type BlocksInterface = {
  [K in BlockNameType]: Block<K>;
};

export const blocks: BlocksInterface = {
  empty: {
    id: 0,
    name: "empty",
    textureIndex: -1,
    keyCode: "Digit0",
  },
  grass: {
    id: 1,
    name: "grass",
    textureIndex: 0,
    keyCode: "Digit1",
  },
  dirt: {
    id: 3,
    name: "dirt",
    textureIndex: 2,
    keyCode: "Digit2",
  },
  stone: {
    id: 4,
    name: "stone",
    textureIndex: 3,
    keyCode: "Digit3",
  },
  coal: {
    id: 5,
    name: "coal",
    textureIndex: 4,
    keyCode: "Digit4",
  },
  iron: {
    id: 6,
    name: "iron",
    textureIndex: 5,
    keyCode: "Digit5",
  },
  leaves: {
    id: 7,
    name: "leaves",
    textureIndex: 6,
    keyCode: "Digit6",
  },
  tree: {
    id: 8,
    name: "tree",
    textureIndex: 7,
    keyCode: "Digit7",
  },
  sand: {
    id: 9,
    name: "sand",
    textureIndex: 9,
    keyCode: "Digit8",
  },
  cloud: {
    id: 10,
    name: "cloud",
    textureIndex: -1,
    keyCode: "",
  },
};

export const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
export const blockMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});
export const uTextureAtlas = new THREE.Uniform<THREE.Texture | null>(null);

export const selectedBlockMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffaa,
  transparent: true,
  opacity: 0.3,
});

export const waterGeometry = new THREE.PlaneGeometry(1, 1);
export const waterMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTextureAtlas,
    uSize: new THREE.Uniform(1),
    uTime: new THREE.Uniform(0),
    fogColor: new THREE.Uniform(new THREE.Color(0xffffff)),
    fogNear: new THREE.Uniform(1),
    fogFar: new THREE.Uniform(100),
  },
  fog: true,
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    #include <fog_pars_vertex>

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      #include <fog_vertex>
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2DArray uTextureAtlas;
    uniform float uSize;
    uniform float uTime;
    varying vec2 vUv;

    #include <fog_pars_fragment>

    float random(float seed) {
      return fract(sin(dot(vec2(seed, seed), vec2(12.9898, 78.233))) * 43758.5453);
    }

    float createSmoothAlpha(float baseAlpha, float time) {
      float frequency = 0.1 + baseAlpha * 20.0;
      float phase = baseAlpha * 80.0; 
      float wave = sin(phase + time * 0.8 * random(frequency)) - cos(frequency + time * 0.3 * random(phase)) * random(baseAlpha);
      return mix(0.6, 1.0, clamp(wave, 0.0, 1.0));
    }

    void main() {
      vec2 uv = fract(vUv * uSize);
      float baseAlpha = texture(uTextureAtlas, vec3(uv, ${blocks.grass.textureIndex})).g;
      float dynamicAlpha = createSmoothAlpha(baseAlpha, uTime);
      vec3 color = vec3(0.1, 0.5, 0.8);
      color = mix(color, color * 1.3, smoothstep(0.95, 1.0, dynamicAlpha));
      gl_FragColor = vec4(color, dynamicAlpha);

      #include <fog_fragment>
    }
  `,
  side: THREE.DoubleSide,
  transparent: true,
});

blockMaterial.onBeforeCompile = (shader) => {
  shader.uniforms = {
    ...shader.uniforms,
    uTextureAtlas,
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
    bool isTop = dot(nNormal, vec3(0.0, 1.0, 0.0)) > 0.5;
    bool isBottom = dot(nNormal, vec3(0.0, -1.0, 0.0)) > 0.5;
    if (textureID == ${blocks.grass.textureIndex}) {
      if (isBottom) {
        blockColor = texture(uTextureAtlas, vec3(vUv, ${blocks.dirt.textureIndex}));
      } else if (!isTop) {
        blockColor = texture(uTextureAtlas, vec3(vUv, textureID + 1));
      }
    } else if (textureID == ${blocks.leaves.textureIndex} && blockColor.a < 0.5) {
      discard;
    } else if (textureID == ${blocks.tree.textureIndex} && !isTop && !isBottom) {
      blockColor = texture(uTextureAtlas, vec3(vUv, textureID + 1));
    } else if (textureID == ${blocks.cloud.textureIndex}) {
      blockColor = vec4(1.0);
    }
    diffuseColor *= blockColor;
    `
  );
};
