import * as THREE from "three";

type Block<T extends string> = {
  id: number;
  name: T;
  material: THREE.Material | THREE.MeshLambertMaterial[] | null;
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

export const blockTextures = {
  grass: { url: "textures/grass.png", texture: new THREE.Texture() },
  grassSide: { url: "textures/grass_side.png", texture: new THREE.Texture() },
  dirt: { url: "textures/dirt.png", texture: new THREE.Texture() },
  stone: { url: "textures/stone.png", texture: new THREE.Texture() },
  coalOre: { url: "textures/coal_ore.png", texture: new THREE.Texture() },
  ironOre: { url: "textures/iron_ore.png", texture: new THREE.Texture() },
  leaves: { url: "textures/leaves.png", texture: new THREE.Texture() },
  treeTop: { url: "textures/tree_top.png", texture: new THREE.Texture() },
  treeSide: { url: "textures/tree_side.png", texture: new THREE.Texture() },
  sand: { url: "textures/sand.png", texture: new THREE.Texture() },
  snow: { url: "textures/snow.png", texture: new THREE.Texture() },
};

const blockMaterials = {
  grass: new THREE.MeshLambertMaterial({ map: blockTextures.grass.texture }),
  grassSide: new THREE.MeshLambertMaterial({
    map: blockTextures.grassSide.texture,
  }),
  dirt: new THREE.MeshLambertMaterial({ map: blockTextures.dirt.texture }),
  stone: new THREE.MeshLambertMaterial({ map: blockTextures.stone.texture }),
  coalOre: new THREE.MeshLambertMaterial({
    map: blockTextures.coalOre.texture,
  }),
  ironOre: new THREE.MeshLambertMaterial({
    map: blockTextures.ironOre.texture,
  }),
  leaves: new THREE.MeshLambertMaterial({
    map: blockTextures.leaves.texture,
    alphaMap: blockTextures.leaves.texture,
    transparent: true,
  }),
  treeTop: new THREE.MeshLambertMaterial({
    map: blockTextures.treeTop.texture,
  }),
  treeSide: new THREE.MeshLambertMaterial({
    map: blockTextures.treeSide.texture,
  }),
  sand: new THREE.MeshLambertMaterial({ map: blockTextures.sand.texture }),
  snow: new THREE.MeshLambertMaterial({ map: blockTextures.snow.texture }),
};

type BlocksInterface = {
  [K in (typeof blockNames)[number]]: Block<K>;
};

export const blocks: BlocksInterface = {
  empty: {
    id: 0,
    name: "empty",
    material: null,
    keyCode: "Digit0",
  },
  grass: {
    id: 1,
    name: "grass",
    material: [
      blockMaterials.grassSide,
      blockMaterials.grassSide,
      blockMaterials.grass,
      blockMaterials.dirt,
      blockMaterials.grassSide,
      blockMaterials.grassSide,
    ],
    keyCode: "Digit1",
  },
  dirt: {
    id: 3,
    name: "dirt",
    material: blockMaterials.dirt,
    keyCode: "Digit2",
  },
  stone: {
    id: 4,
    name: "stone",
    material: blockMaterials.stone,
    keyCode: "Digit3",
  },
  coal: {
    id: 5,
    name: "coal",
    material: blockMaterials.coalOre,
    keyCode: "Digit4",
  },
  iron: {
    id: 6,
    name: "iron",
    material: blockMaterials.ironOre,
    keyCode: "Digit5",
  },
  leaves: {
    id: 7,
    name: "leaves",
    material: blockMaterials.leaves,
    keyCode: "Digit6",
  },
  tree: {
    id: 8,
    name: "tree",
    material: [
      blockMaterials.treeSide,
      blockMaterials.treeSide,
      blockMaterials.treeTop,
      blockMaterials.treeTop,
      blockMaterials.treeSide,
      blockMaterials.treeSide,
    ],
    keyCode: "Digit7",
  },
  sand: {
    id: 9,
    name: "sand",
    material: blockMaterials.sand,
    keyCode: "Digit8",
  },
  cloud: {
    id: 10,
    name: "cloud",
    material: blockMaterials.snow,
    keyCode: "",
  },
};

export const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

export const selectedBlockMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffaa,
  transparent: true,
  opacity: 0.3,
});
