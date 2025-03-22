import { Engine } from "./Engine";
import * as THREE from "three";
import { Lights } from "./Lights";
import { World } from "./World";
import { Config } from "./Config";
import { DebugController } from "./DebugController";
import { Player } from "./Player";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export class Game extends Engine {
  public config: Config;
  public lights: Lights;
  public world: World;
  public debugController: DebugController;
  public player: Player;

  private pointerLockCamera: THREE.PerspectiveCamera;
  private pointerLockControls: PointerLockControls;

  constructor(domElement: HTMLElement) {
    super({ domElement, autoRender: false });
    this.pointerLockCamera = new THREE.PerspectiveCamera(
      75,
      this.viewport.ratio,
      0.1,
      1000
    );
    this.pointerLockControls = new PointerLockControls(
      this.pointerLockCamera,
      this.renderer.domElement
    );
    this.scene.add(this.pointerLockCamera);
    this.config = new Config();
    this.debugController = new DebugController(this);

    this.renderer.setClearColor(this.config.clearColor);
    this.renderer.shadowMap.enabled = true;
    this.view.position.set(32, 16, 32);
    this.pointerLockCamera.position.set(32, 16, 32);
    this.stats.activate("2");

    this.lights = new Lights();
    this.world = new World(this.config.worldParams, this.loader);
    this.player = new Player(
      {
        controls: this.pointerLockControls,
        playerConfig: this.config.playerConfig,
      },
      this.world
    );

    this.scene.add(this.world);
    this.scene.add(this.lights);
    // this.scene.add(this.player.createBoundsHelper());

    this.time.events.on("tick", ({ delta }) => {
      this.update(delta);
    });
    this.viewport.events.on("change", () => {
      this.resize();
    });
  }

  public update(delta: number) {
    this.player.update(delta);
    this.world.generate({ playerPosition: this.player.position });
    this.controls.target.copy(this.player.position);
    this.lights.update(this.player.position);
    this.pointerLockControls.update(delta);
    const camera = this.player.isActive ? this.pointerLockCamera : this.view;
    this.renderer.render(this.scene, camera);
  }

  public resize() {
    this.pointerLockCamera.aspect = this.viewport.ratio;
    this.pointerLockCamera.updateProjectionMatrix();
  }
}
