import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import * as THREE from "three";
import { World } from "../World";
import { Physics } from "./Physics";

export type PlayerConfig = {
  moveSpeed: number;
  radius: number;
  height: number;
  gravity: number;
  jumpSpeed: number;
};

type PlayerParams = {
  controls: PointerLockControls;
  playerConfig: PlayerConfig;
};

export class Player {
  private onKeyDown = this.keyDownHandler.bind(this);
  private onKeyUp = this.keyUpHandler.bind(this);
  private controls: PointerLockControls;

  private _params: PlayerConfig;
  private physics: Physics;
  private input = new THREE.Vector3();
  private velocity = new THREE.Vector3();

  private keys: { [key: string]: boolean } = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
  };

  private boundsHelper: THREE.Mesh | null = null;

  private _worldVelocity = new THREE.Vector3();
  private onGround = false;

  constructor(params: PlayerParams, world: World) {
    this.controls = params.controls;
    this.controls.lock();
    this._params = params.playerConfig;
    this.physics = new Physics(world, this);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private keyDownHandler(event: KeyboardEvent) {
    if (event.code in this.keys) this.keys[event.code] = true;
    this.updateMovementVector();
  }

  private keyUpHandler(event: KeyboardEvent) {
    if (event.code in this.keys) this.keys[event.code] = false;
    if (event.code === "Escape" && !event.repeat) {
      if (this.controls.isLocked) this.controls.unlock();
      else this.controls.lock();
    }
    this.updateMovementVector();
  }

  private updateMovementVector() {
    this.input.set(0, 0, 0);
    if (this.keys.KeyW) this.input.z += this._params.moveSpeed;
    if (this.keys.KeyS) this.input.z -= this._params.moveSpeed;
    if (this.keys.KeyA) this.input.x -= this._params.moveSpeed;
    if (this.keys.KeyD) this.input.x += this._params.moveSpeed;
    if (this.keys.Space && this.onGround) {
      this.velocity.y += this._params.jumpSpeed;
    }

    if (this.input.length() > 0) {
      this.input.normalize().multiplyScalar(this._params.moveSpeed);
    }
  }

  public get isActive() {
    return this.controls.isLocked;
  }

  public get position() {
    return this.controls.object.position;
  }

  public get params() {
    return this._params;
  }

  public get worldVelocity() {
    this._worldVelocity.copy(this.velocity);
    this._worldVelocity.applyEuler(
      new THREE.Euler(0, this.controls.object.rotation.y, 0)
    );
    return this._worldVelocity;
  }

  public applyWorldDeltaVelocity(deltaVelocity: THREE.Vector3) {
    deltaVelocity.applyEuler(
      new THREE.Euler(0, -this.controls.object.rotation.y, 0)
    );
    this.velocity.add(deltaVelocity);
  }

  public setOnGround(onGround: boolean) {
    this.onGround = onGround;
  }

  public update(delta: number) {
    if (!this.isActive) return;
    this.velocity.x = this.input.x;
    this.velocity.z = this.input.z;
    this.velocity.y -= this._params.gravity * delta;
    this.controls.moveRight(this.velocity.x * delta);
    this.controls.moveForward(this.velocity.z * delta);
    this.position.y += this.velocity.y * delta;
    this.physics.detectCollisions();
    if (this.boundsHelper) {
      this.boundsHelper.position.copy(this.position);
      this.boundsHelper.position.y -= this._params.height / 2;
    }
  }

  public setParams(playerConfig: PlayerConfig) {
    this._params = playerConfig;
  }

  public createBoundsHelper() {
    const geometry = new THREE.CylinderGeometry(
      this._params.radius,
      this._params.radius,
      this._params.height,
      32
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    this.boundsHelper = new THREE.Mesh(geometry, material);
    return this.boundsHelper;
  }

  public dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
