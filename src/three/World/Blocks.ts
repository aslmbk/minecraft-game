type Block<T extends string> = {
  id: number;
  name: T;
  color: string | number;
};

export const blockNames = [
  "empty",
  "grass",
  "dirt",
  "stone",
  "coal",
  "iron",
] as const;

export type BlockNameType = (typeof blockNames)[number];

export type BlocksInterface = {
  [K in BlockNameType]: Block<K>;
};

export const blocks: BlocksInterface = {
  empty: {
    id: 0,
    name: "empty",
    color: "transparent",
  },
  grass: {
    id: 1,
    name: "grass",
    color: 0x559020,
  },
  dirt: {
    id: 2,
    name: "dirt",
    color: 0x807020,
  },
  stone: {
    id: 3,
    name: "stone",
    color: 0x808080,
  },
  coal: {
    id: 4,
    name: "coal",
    color: 0x202020,
  },
  iron: {
    id: 5,
    name: "iron",
    color: 0x806060,
  },
};
