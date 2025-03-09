import { Game } from "./Game";

export class DebugController {
  constructor(game: Game) {
    this.createRendererFolder(game);
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

  private createParamsFolder(game: Game) {
    const paramsFolder = game.debug
      .addFolder({
        title: "params",
        expanded: false,
      })
      .on("change", () => {
        game.world.setParams(game.config.params);
        game.world.generate();
      });

    paramsFolder.addBinding(game.config.params, "seed", {
      label: "rng seed",
    });
    paramsFolder.addBinding(game.config.params.world, "width", {
      label: "world width",
    });
    paramsFolder.addBinding(game.config.params.world, "height", {
      label: "world height",
    });
    paramsFolder.addBinding(game.config.params.terrain, "scale", {
      label: "terrain scale",
    });
    paramsFolder.addBinding(game.config.params.terrain, "magnitude", {
      label: "terrain magnitude",
    });
    paramsFolder.addBinding(game.config.params.terrain, "offset", {
      label: "terrain offset",
    });
    paramsFolder.addBinding(game.config.params.blocks.stone, "scale", {
      label: "stone scale",
    });
    paramsFolder.addBinding(game.config.params.blocks.stone, "threshold", {
      label: "stone threshold",
    });
    paramsFolder.addBinding(game.config.params.blocks.coal, "scale", {
      label: "coal scale",
    });
    paramsFolder.addBinding(game.config.params.blocks.coal, "threshold", {
      label: "coal threshold",
    });
    paramsFolder.addBinding(game.config.params.blocks.iron, "scale", {
      label: "iron scale",
    });
    paramsFolder.addBinding(game.config.params.blocks.iron, "threshold", {
      label: "iron threshold",
    });
  }
}
