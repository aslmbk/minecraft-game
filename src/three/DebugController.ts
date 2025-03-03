import { Game } from "./Game";

export class DebugController {
  constructor(game: Game) {
    game.renderer.setClearColor(game.config.clearColor);

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
}
