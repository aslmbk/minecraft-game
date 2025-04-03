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
    height: 1.8,
    gravity: 32,
    jumpSpeed: 12,
  };

  worldParams: WorldParams = {
    seed: 17,
    chunkDistance: 5,
    world: {
      width: 21,
      height: 32,
    },
    terrain: {
      scale: 120,
      magnitude: 0.4,
      offset: 0.3,
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
    trees: {
      frequency: 0.05,
      trunk: {
        minHeight: 4,
        maxHeight: 7,
      },
      canopy: {
        minRadius: 3,
        maxRadius: 4,
        density: 1.4,
      },
    },
    clouds: {
      scale: 30,
      density: 0.25,
    },
    water: {
      height: 3,
    },
  };
}
