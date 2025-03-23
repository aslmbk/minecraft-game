import { PlayerConfig } from "./Player/Player";
import { WorldParams } from "./World";
import { LightsConfig } from "./Lights";

export class Config {
  clearColor = "#86d1e5";

  lights: LightsConfig = {
    ambientLight: {
      intensity: 1,
      color: "#ffffff",
    },
    directionalLight: {
      intensity: 2,
      color: "#ffffff",
      position: {
        x: 50,
        y: 50,
        z: -50,
      },
    },
  };

  playerConfig: PlayerConfig = {
    moveSpeed: 10,
    radius: 0.5,
    height: 2,
    gravity: 32,
    jumpSpeed: 10,
  };

  worldParams: WorldParams = {
    seed: 100,
    chunkDistance: 1,
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
