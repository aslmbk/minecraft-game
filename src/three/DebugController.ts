import { Game } from "./Game";

export class DebugController {
  constructor(game: Game) {
    this.createRendererFolder(game);
    this.createWorldFolder(game);
    this.createTerrainFolder(game);
  }

  private createRendererFolder(game: Game) {
    const rendererFolder = game.debug.addFolder({
      title: "renderer",
      expanded: true,
    });

    rendererFolder
      .addBinding(game.config, "clearColor")
      .on("change", ({ value }) => {
        game.renderer.setClearColor(value);
      });
  }

  private createWorldFolder(game: Game) {
    const worldFolder = game.debug.addFolder({
      title: "world",
      expanded: true,
    });

    worldFolder
      .addBinding(game.config, "worldWidth", {
        min: 1,
        max: 100,
        step: 1,
      })
      .on("change", ({ value }) => {
        game.world.setWorldSize(value, game.config.worldHeight);
        game.world.generate();
      });

    worldFolder
      .addBinding(game.config, "worldHeight", {
        min: 1,
        max: 100,
        step: 1,
      })
      .on("change", ({ value }) => {
        game.world.setWorldSize(game.config.worldWidth, value);
        game.world.generate();
      });
  }

  private createTerrainFolder(game: Game) {
    const terrainFolder = game.debug.addFolder({
      title: "terrain",
      expanded: true,
    });

    terrainFolder
      .addBinding(game.config, "seed", {
        min: 0,
        max: 1000000,
        step: 1,
      })
      .on("change", ({ value }) => {
        game.world.setParams({
          seed: value,
          terrain: game.config.terrain,
        });
        game.world.generate();
      });

    terrainFolder
      .addBinding(game.config.terrain, "scale", {
        min: 0,
        max: 100,
        step: 1,
      })
      .on("change", ({ value }) => {
        game.world.setParams({
          seed: game.config.seed,
          terrain: { ...game.config.terrain, scale: value },
        });
        game.world.generate();
      });

    terrainFolder
      .addBinding(game.config.terrain, "magnitude", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", ({ value }) => {
        game.world.setParams({
          seed: game.config.seed,
          terrain: { ...game.config.terrain, magnitude: value },
        });
        game.world.generate();
      });

    terrainFolder
      .addBinding(game.config.terrain, "offset", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", ({ value }) => {
        game.world.setParams({
          seed: game.config.seed,
          terrain: { ...game.config.terrain, offset: value },
        });
        game.world.generate();
      });
  }
}
