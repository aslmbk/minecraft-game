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
}
