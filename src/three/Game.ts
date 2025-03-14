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
    this.stats.activate();

    this.lights = new Lights();
    this.world = new World(this.config.worldParams);
    this.player = new Player(
      {
        controls: this.pointerLockControls,
        playerConfig: this.config.playerConfig,
      },
      this.world
    );

    this.createLights();
    this.world.generate();
    this.scene.add(this.world);
    this.scene.add(this.player.createBoundsHelper());
    const boundsCameraHelper = new THREE.CameraHelper(this.pointerLockCamera);
    boundsCameraHelper.visible = true;
    this.scene.add(boundsCameraHelper);

    this.time.events.on("tick", ({ delta }) => {
      boundsCameraHelper.update();
      this.update(delta);
    });
    this.viewport.events.on("change", () => {
      this.resize();
    });
  }

  public update(delta: number) {
    this.player.update(delta);
    this.pointerLockControls.update(delta);
    const camera = this.player.isActive ? this.pointerLockCamera : this.view;
    this.renderer.render(this.scene, camera);
  }

  public resize() {
    this.pointerLockCamera.aspect = this.viewport.ratio;
    this.pointerLockCamera.updateProjectionMatrix();
  }

  private createLights() {
    const directionalLight = this.lights.createDirectionalLight({
      color: "white",
      intensity: 2,
      position: new THREE.Vector3(40, 40, -40),
    });
    directionalLight.castShadow = true;
    directionalLight.shadow.intensity = 0.9;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.radius = 8;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 110;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    const ambientLight = this.lights.createAmbientLight({
      color: "white",
      intensity: 0.5,
    });
    this.scene.add(ambientLight);
  }

  public dispose() {
    this.stats.deactivate();
    this.player.dispose();
    this.debug.children.forEach((child) => child.dispose());
    this.scene.dispose();
    this.world.dispose();
  }
}
