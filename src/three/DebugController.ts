import { Game } from "./Game";
import {
  colorSpaceOptions,
  shadowMapTypeOptions,
  toneMappingOptions,
} from "./Engine/utils/constants";
export class DebugController {
  constructor(game: Game) {
    this.createRendererFolder(game);
    this.createPlayerFolder(game);
    this.createParamsFolder(game);
    this.createLightsFolder(game);
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
        if (game.scene.fog) game.scene.fog.color.set(value);
      });

    rendererFolder.addBinding(game.renderer, "toneMapping", {
      label: "tone mapping",
      options: toneMappingOptions,
    });

    rendererFolder.addBinding(game.renderer, "toneMappingExposure", {
      label: "tone mapping exposure",
      min: 0,
      max: 10,
      step: 0.1,
    });

    rendererFolder.addBinding(game.renderer, "outputColorSpace", {
      label: "color space",
      options: colorSpaceOptions,
    });

    rendererFolder.addBinding(game.renderer.shadowMap, "type", {
      label: "shadow map type",
      options: shadowMapTypeOptions,
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
        game.world.generate({ force: true });
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

  private createLightsFolder(game: Game) {
    const lightsFolder = game.debug.addFolder({
      title: "lights",
      expanded: false,
    });

    const ambientLightFolder = lightsFolder
      .addFolder({
        title: "ambient light",
        expanded: false,
      })
      .on("change", () => {
        console.log(game.config.lights.ambientLight);
        game.lights.ambientLight.intensity =
          game.config.lights.ambientLight.intensity;
        game.lights.ambientLight.color.set(
          game.config.lights.ambientLight.color
        );
      });

    ambientLightFolder.addBinding(
      game.config.lights.ambientLight,
      "intensity",
      {
        label: "intensity",
        min: 0,
        max: 5,
      }
    );

    ambientLightFolder.addBinding(game.config.lights.ambientLight, "color", {
      label: "color",
    });

    const dirLightFolder = lightsFolder
      .addFolder({
        title: "directional light",
        expanded: false,
      })
      .on("change", () => {
        game.lights.directionalLight.intensity =
          game.config.lights.directionalLight.intensity;
        game.lights.directionalLight.color.set(
          game.config.lights.directionalLight.color
        );
      });

    dirLightFolder.addBinding(
      game.config.lights.directionalLight,
      "intensity",
      {
        label: "intensity",
        min: 0,
        max: 5,
      }
    );

    dirLightFolder.addBinding(game.config.lights.directionalLight, "color", {
      label: "color",
    });

    dirLightFolder.addBinding(game.config.lights.directionalLight, "position", {
      label: "position",
    });

    dirLightFolder.addBinding(
      game.lights.directionalLight.shadow,
      "intensity",
      {
        label: "shadow intensity",
        min: 0,
        max: 1,
      }
    );

    dirLightFolder.addBinding(game.lights.directionalLight.shadow, "radius", {
      label: "shadow radius",
      min: 0,
      max: 10,
    });

    dirLightFolder
      .addBinding(game.lights.directionalLight.shadow.mapSize, "width", {
        label: "shadow map size",
        min: 512,
        max: 4096,
        step: 512,
      })
      .on("change", () => {
        game.lights.directionalLight.shadow.mapSize.height =
          game.lights.directionalLight.shadow.mapSize.width;
        game.lights.directionalLight.shadow.map?.dispose();
      });

    const shadowCamFolder = dirLightFolder
      .addFolder({
        title: "shadow camera",
        expanded: false,
      })
      .on("change", () => {
        game.lights.directionalLight.shadow.camera.updateProjectionMatrix();
      });

    shadowCamFolder.addBinding(
      game.lights.directionalLight.shadow.camera,
      "near",
      {
        label: "near",
        min: 1,
        max: 50,
      }
    );

    shadowCamFolder.addBinding(
      game.lights.directionalLight.shadow.camera,
      "far",
      {
        label: "far",
        min: 50,
        max: 300,
      }
    );

    shadowCamFolder.addBinding(
      game.lights.directionalLight.shadow.camera,
      "left",
      {
        label: "left",
        min: -200,
        max: 0,
      }
    );

    shadowCamFolder.addBinding(
      game.lights.directionalLight.shadow.camera,
      "right",
      {
        label: "right",
        min: 0,
        max: 200,
      }
    );

    shadowCamFolder.addBinding(
      game.lights.directionalLight.shadow.camera,
      "top",
      {
        label: "top",
        min: 0,
        max: 200,
      }
    );

    shadowCamFolder.addBinding(
      game.lights.directionalLight.shadow.camera,
      "bottom",
      {
        label: "bottom",
        min: -200,
        max: 0,
      }
    );
  }
}
