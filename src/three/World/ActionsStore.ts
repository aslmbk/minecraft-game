type CoordsType = { x: number; y: number; z: number };

export class ActionsStore {
  private static instance: ActionsStore;
  private data: Record<string, Record<string, number>> = {};

  constructor() {
    if (ActionsStore.instance) {
      return ActionsStore.instance;
    }
    ActionsStore.instance = this;
  }

  public commit(
    chunkCoords: CoordsType,
    blockCoords: CoordsType,
    value: number
  ) {
    const key = this.getKeyFromCoords(chunkCoords);
    this.data[key] ??= {};
    this.data[key][this.getKeyFromCoords(blockCoords)] = value;
  }

  public clear() {
    this.data = {};
  }

  public forEachBlock(
    chunkCoords: CoordsType,
    callback: (blockCoords: CoordsType, value: number) => void
  ) {
    const chunk = this.data[this.getKeyFromCoords(chunkCoords)];
    if (!chunk) return;
    for (const blockKey in chunk) {
      const blockCoords = this.getCoordsFromKey(blockKey);
      callback(blockCoords, chunk[blockKey]);
    }
  }

  private getKeyFromCoords(coords: CoordsType) {
    return `${coords.x}-${coords.y}-${coords.z}`;
  }

  private getCoordsFromKey(key: string): CoordsType {
    const coords = key.split("-").map(Number);
    return {
      x: coords[0],
      y: coords[1],
      z: coords[2],
    };
  }
}
