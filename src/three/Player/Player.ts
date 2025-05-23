import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import * as THREE from "three";
import { World } from "../World";
import { Physics } from "./Physics";
import { KeyEventArgs } from "../Engine";

export type PlayerConfig = {
  moveSpeed: number;
  radius: number;
  height: number;
  gravity: number;
  jumpSpeed: number;
};

export class Player {
  private frameRate = 1 / 100;
  private deltaTime = 0;
  private controls: PointerLockControls;

  private _params: PlayerConfig;
  private physics: Physics;
  private input = new THREE.Vector3();
  private velocity = new THREE.Vector3();
  private toolContainer = new THREE.Group();
  private toolAnimationStart = 0;

  private boundsHelper: THREE.Mesh | null = null;

  private _worldVelocity = new THREE.Vector3();
  private _nextPosition = new THREE.Vector3();
  private onGround = false;

  private currentPositionTestVariable = new THREE.Vector3();

  constructor(
    params: PlayerConfig,
    controls: PointerLockControls,
    world: World
  ) {
    this.controls = controls;
    this.controls.lock();
    this._params = params;
    this.physics = new Physics(world, this);
    this._nextPosition.copy(this.controls.object.position);
    this.controls.object.add(this.toolContainer);
  }

  public keyDownHandler({ keys }: KeyEventArgs) {
    this.updateMovementVector(keys);
  }

  public keyUpHandler({ event, keys }: KeyEventArgs) {
    if (event.code === "Escape" && !event.repeat) {
      if (this.controls.isLocked) this.controls.unlock();
      else this.controls.lock();
    }
    this.updateMovementVector(keys);
  }

  private updateMovementVector(keys: Record<string, boolean>) {
    this.input.set(0, 0, 0);
    if (keys.KeyW) this.input.z += this._params.moveSpeed;
    if (keys.KeyS) this.input.z -= this._params.moveSpeed;
    if (keys.KeyA) this.input.x -= this._params.moveSpeed;
    if (keys.KeyD) this.input.x += this._params.moveSpeed;
    if (keys.Space && this.onGround) {
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
    return this._nextPosition;
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

  public update(dt: number, elapsed: number) {
    this.frameRate = Math.min(1 / 60, dt);
    this.deltaTime += dt;
    if (!this.isActive || this.deltaTime < this.frameRate) return;
    this.controls.object.position.lerp(
      this._nextPosition,
      Math.min(1, this.physics.lerpDt + this.frameRate * 10)
    );
    this.velocity.x = this.input.x;
    this.velocity.z = this.input.z;
    this.velocity.y -= this._params.gravity * this.frameRate;
    this.currentPositionTestVariable.copy(this.controls.object.position);
    this.controls.object.position.copy(this.position);
    this.controls.moveRight(this.velocity.x * this.frameRate);
    this.controls.moveForward(this.velocity.z * this.frameRate);
    this.controls.object.position.y += this.velocity.y * this.frameRate;
    this.position.copy(this.controls.object.position);
    this.controls.object.position.copy(this.currentPositionTestVariable);
    this.physics.detectCollisions(this.frameRate);
    if (this.boundsHelper) {
      this.boundsHelper.position.copy(this.position);
      this.boundsHelper.position.y -= this._params.height / 2;
    }

    const animationTime = elapsed - this.toolAnimationStart;
    this.toolContainer.rotation.x =
      animationTime < 0.42 ? Math.sin(animationTime * 30) * 0.5 : 0;

    this.deltaTime -= this.frameRate;
  }

  public setParams(playerConfig: PlayerConfig) {
    if (
      this._params.height !== playerConfig.height ||
      this._params.radius !== playerConfig.radius
    ) {
      this.position.y += playerConfig.height - this._params.height;
      if (this.boundsHelper) {
        this.boundsHelper.geometry.dispose();
        this.boundsHelper.geometry = new THREE.CylinderGeometry(
          playerConfig.radius,
          playerConfig.radius,
          playerConfig.height
        );
      }
    }
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

  public setTool(tool: THREE.Object3D) {
    this.toolContainer.clear();
    this.toolContainer.add(tool);
    this.toolContainer.position.set(0.6, -0.3, -0.5);
    this.toolContainer.scale.setScalar(0.5);
    this.toolContainer.rotation.z = Math.PI / 2;
    this.toolContainer.rotation.y = Math.PI + 0.2;
    this.toolContainer.receiveShadow = true;
    this.toolContainer.castShadow = true;
  }

  public startToolAnimation(elapsed: number) {
    this.toolAnimationStart = elapsed;
  }
}
