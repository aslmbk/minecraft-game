type Block = {
  id: number;
  name: string;
  color: string | number;
};

export class Blocks {
  static readonly EMPTY: Block = {
    id: 0,
    name: "empty",
    color: "transparent",
  };
  static readonly GRASS: Block = {
    id: 1,
    name: "grass",
    color: 0x559020,
  };
  static readonly DIRT: Block = {
    id: 2,
    name: "dirt",
    color: 0x807020,
  };
  static readonly STONE: Block = {
    id: 3,
    name: "stone",
    color: 0x808080,
  };
  static readonly COAL: Block = {
    id: 4,
    name: "coal",
    color: 0x202020,
  };
  static readonly IRON: Block = {
    id: 5,
    name: "iron",
    color: 0x806060,
  };
}
