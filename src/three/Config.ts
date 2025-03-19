import { PlayerConfig } from "./Player/Player";
import { WorldParams } from "./World";

export class Config {
  clearColor = "#86d1e5";

  playerConfig: PlayerConfig = {
    moveSpeed: 10,
    radius: 0.5,
    height: 1.75,
    gravity: 32,
    jumpSpeed: 10,
  };

  worldParams: WorldParams = {
    seed: 100,
    world: {
      width: 64,
      height: 32,
    },
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    },
    blocks: {
      stone: {
        scale: { x: 30, y: 30, z: 30 },
        threshold: 0.8,
      },
      coal: {
        scale: { x: 20, y: 20, z: 20 },
        threshold: 0.8,
      },
      iron: {
        scale: { x: 40, y: 40, z: 40 },
        threshold: 0.9,
      },
    },
  };
}
