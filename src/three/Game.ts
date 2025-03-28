import { Engine } from "./Engine";
import * as THREE from "three";
import { Lights } from "./Lights";
import { World } from "./World";
import { Config } from "./Config";
import { DebugController } from "./DebugController";
import { Player } from "./Player";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const cameraPosition = new THREE.Vector3(32, 16, 32);
const screenCenter = new THREE.Vector2(0, 0);

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
    this.rays.updateCamera(this.pointerLockCamera);
    this.config = new Config();

    this.renderer.setClearColor(this.config.clearColor);
    this.renderer.shadowMap.enabled = true;
    this.camera.position.copy(cameraPosition);
    this.pointerLockCamera.position.copy(cameraPosition);
    this.scene.fog = new THREE.Fog(
      this.config.clearColor,
      this.config.worldParams.world.width,
      this.config.worldParams.world.width * 1.3
    );
    this.stats.activate("2");

    this.lights = new Lights(this.config.lights);
    this.world = new World(this.config.worldParams, this.loader);
    this.player = new Player(
      this.config.playerConfig,
      this.pointerLockControls,
      this.world
    );

    this.scene.add(this.world);
    this.scene.add(this.world.selectedBlock);
    this.scene.add(this.lights);
    // this.scene.add(this.player.createBoundsHelper());

    this.time.events.on("tick", this.update.bind(this));
    this.viewport.events.on("change", this.resize.bind(this));
    this.inputs.events.on("keydown", (params) => {
      this.player.keyDownHandler(params);
      this.world.setActiveBlock(params.event.code);
    });
    this.inputs.events.on("keyup", (params) => {
      this.player.keyUpHandler(params);
      this.controls.target.copy(this.player.position);
      this.controls.object.position.copy(this.player.position);
      this.controls.object.position.add(cameraPosition);
    });
    this.cursor.events.on("click", () => {
      if (this.player.isActive) this.world.submitBlock();
    });

    this.debugController = new DebugController(this);
  }

  public update({ delta }: { delta: number }) {
    let camera = this.camera;
    if (this.player.isActive) {
      camera = this.pointerLockCamera;
      this.player.update(delta);
      this.world.generate({ playerPosition: this.player.position });
      this.lights.update(delta, this.player.position);
      this.pointerLockControls.update(delta);
      const intersects = this.rays.castToOne(
        screenCenter,
        this.world
      ) as THREE.Intersection<THREE.InstancedMesh>[];
      if (intersects.length > 0) {
        this.world.intersectionHandler(intersects[0]);
      } else {
        this.world.nonIntersectionHandler();
      }
    }
    this.renderer.render(this.scene, camera);
  }

  public resize({ ratio }: { ratio: number }) {
    this.pointerLockCamera.aspect = ratio;
    this.pointerLockCamera.updateProjectionMatrix();
  }
}
