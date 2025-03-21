type Block<T extends string> = {
  id: number;
  name: T;
  color: string | number;
  textureIndex: number;
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
  },
  grass: {
    id: 1,
    name: "grass",
    color: 0x559020,
    textureIndex: 0,
  },
  dirt: {
    id: 3,
    name: "dirt",
    color: 0x807020,
    textureIndex: 2,
  },
  stone: {
    id: 4,
    name: "stone",
    color: 0x808080,
    textureIndex: 3,
  },
  coal: {
    id: 5,
    name: "coal",
    color: 0x202020,
    textureIndex: 4,
  },
  iron: {
    id: 6,
    name: "iron",
    color: 0x806060,
    textureIndex: 5,
  },
};
