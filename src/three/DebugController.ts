import { Game } from "./Game";

export class DebugController {
  constructor(game: Game) {
    this.createRendererFolder(game);
    this.createPlayerFolder(game);
    this.createParamsFolder(game);
  }

  private createRendererFolder(game: Game) {
    const rendererFolder = game.debug.addFolder({
      title: "renderer",
      expanded: false,
    });

    rendererFolder
      .addBinding(game.config, "clearColor")
      .on("change", ({ value }) => {
        game.renderer.setClearColor(value);
      });
  }

  private createPlayerFolder(game: Game) {
    const playerFolder = game.debug
      .addFolder({
        title: "player",
        expanded: false,
      })
      .on("change", () => {
        game.player.setParams(game.config.playerConfig);
      });

    playerFolder.addBinding(game.config.playerConfig, "moveSpeed", {
      label: "move speed",
    });
    playerFolder.addBinding(game.config.playerConfig, "jumpSpeed", {
      label: "jump speed",
    });
    playerFolder.addBinding(game.config.playerConfig, "radius", {
      label: "radius",
    });
    playerFolder.addBinding(game.config.playerConfig, "height", {
      label: "height",
    });
    playerFolder.addBinding(game.config.playerConfig, "gravity", {
      label: "gravity",
    });
  }

  private createParamsFolder(game: Game) {
    const paramsFolder = game.debug
      .addFolder({
        title: "params",
        expanded: false,
      })
      .on("change", () => {
        game.world.setParams(game.config.worldParams);
        game.world.generate();
      });

    paramsFolder.addBinding(game.config.worldParams, "chunkDistance", {
      label: "chunk distance",
    });
    paramsFolder.addBinding(game.config.worldParams, "seed", {
      label: "rng seed",
    });
    paramsFolder.addBinding(game.config.worldParams.world, "width", {
      label: "world width",
    });
    paramsFolder.addBinding(game.config.worldParams.world, "height", {
      label: "world height",
    });
    paramsFolder.addBinding(game.config.worldParams.terrain, "scale", {
      label: "terrain scale",
    });
    paramsFolder.addBinding(game.config.worldParams.terrain, "magnitude", {
      label: "terrain magnitude",
    });
    paramsFolder.addBinding(game.config.worldParams.terrain, "offset", {
      label: "terrain offset",
    });
    paramsFolder.addBinding(game.config.worldParams.blocks.stone, "scale", {
      label: "stone scale",
    });
    paramsFolder.addBinding(game.config.worldParams.blocks.stone, "threshold", {
      label: "stone threshold",
    });
    paramsFolder.addBinding(game.config.worldParams.blocks.coal, "scale", {
      label: "coal scale",
    });
    paramsFolder.addBinding(game.config.worldParams.blocks.coal, "threshold", {
      label: "coal threshold",
    });
    paramsFolder.addBinding(game.config.worldParams.blocks.iron, "scale", {
      label: "iron scale",
    });
    paramsFolder.addBinding(game.config.worldParams.blocks.iron, "threshold", {
      label: "iron threshold",
    });
  }
}
