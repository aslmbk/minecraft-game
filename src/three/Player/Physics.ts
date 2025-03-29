import { Player } from "./Player";
import { World } from "../World";
import * as THREE from "three";
import { blocks } from "../World/Blocks";

type BlockType = {
  x: number;
  y: number;
  z: number;
};

type CollisionType = {
  block: BlockType;
  contactPoint: BlockType;
  normal: THREE.Vector3;
  overlap: number;
};

export class Physics {
  private world: World;
  private player: Player;
  private closestPointTestVariable = new THREE.Vector3();
  private playerBottomTestVariable = new THREE.Vector3();

  public lerpDt = 0;

  constructor(world: World, player: Player) {
    this.world = world;
    this.player = player;
  }

  public detectCollisions(delta: number) {
    this.lerpDt += delta;
    this.player.setOnGround(false);
    const candidates = this.broadPhase();
    const collisions = this.narrowPhase(candidates);

    if (collisions.length > 0) {
      this.lerpDt = 0;
      this.resolveCollisions(collisions);
    }
  }

  private resolveCollisions(collisions: CollisionType[]) {
    collisions.sort((a, b) => a.overlap - b.overlap);

    for (const collision of collisions) {
      if (!this.pointInPlayerBoundingCylinder(collision.contactPoint)) continue;

      const deltaPosition = collision.normal.clone();
      deltaPosition.multiplyScalar(collision.overlap);
      this.player.position.add(deltaPosition);

      const magnitude = this.player.worldVelocity.dot(collision.normal);
      const velocityAdjustment = collision.normal
        .clone()
        .multiplyScalar(magnitude);
      this.player.applyWorldDeltaVelocity(velocityAdjustment.negate());
    }
  }

  private broadPhase() {
    const candidates: BlockType[] = [];
    const playerAABB = this.getAABB();

    for (let x = playerAABB.x.min; x <= playerAABB.x.max; x++) {
      for (let y = playerAABB.y.min; y <= playerAABB.y.max; y++) {
        for (let z = playerAABB.z.min; z <= playerAABB.z.max; z++) {
          const pos = { x, y, z };
          const block = this.world.getBlock(pos);
          if (block && block.id !== blocks.empty.id) {
            candidates.push(pos);
          }
        }
      }
    }

    return candidates;
  }

  private narrowPhase(candidates: BlockType[]) {
    const collisions: CollisionType[] = [];
    for (const candidate of candidates) {
      const closestPoint = {
        x: Math.max(
          candidate.x - 0.5,
          Math.min(this.player.position.x, candidate.x + 0.5)
        ),
        y: Math.max(
          candidate.y - 0.5,
          Math.min(
            this.player.position.y - this.player.params.height / 2,
            candidate.y + 0.5
          )
        ),
        z: Math.max(
          candidate.z - 0.5,
          Math.min(this.player.position.z, candidate.z + 0.5)
        ),
      };

      this.playerBottomTestVariable.copy(this.player.position);
      this.playerBottomTestVariable.y -= this.player.params.height;
      this.closestPointTestVariable.copy(closestPoint);
      if (
        this.playerBottomTestVariable.distanceTo(
          this.closestPointTestVariable
        ) < 0.1
      ) {
        this.player.setOnGround(true);
      }

      if (this.pointInPlayerBoundingCylinder(closestPoint)) {
        // TODO: recalculate overlapY like in the code above
        // TODO refactor this method by dividing the normals and overlap variables to the separate variables
        const dx = closestPoint.x - this.player.position.x;
        const dy =
          closestPoint.y -
          (this.player.position.y - this.player.params.height / 2);
        const dz = closestPoint.z - this.player.position.z;
        const overlapY = this.player.params.height / 2 - Math.abs(dy);
        const overlapXZ =
          this.player.params.radius - Math.sqrt(dx * dx + dz * dz);

        const normal = new THREE.Vector3(0, 0, 0);
        let overlap = overlapY;
        if (overlapY < overlapXZ) {
          normal.set(0, -Math.sign(dy), 0);
        } else {
          normal.set(-dx, 0, -dz).normalize();
          overlap = overlapXZ;
        }

        collisions.push({
          block: candidate,
          contactPoint: closestPoint,
          normal,
          overlap,
        });
      }
    }

    return collisions;
  }

  private getAABB() {
    return {
      x: {
        min: Math.floor(this.player.position.x - this.player.params.radius),
        max: Math.ceil(this.player.position.x + this.player.params.radius),
      },
      y: {
        min: Math.floor(this.player.position.y - this.player.params.height),
        max: Math.ceil(this.player.position.y),
      },
      z: {
        min: Math.floor(this.player.position.z - this.player.params.radius),
        max: Math.ceil(this.player.position.z + this.player.params.radius),
      },
    };
  }

  private pointInPlayerBoundingCylinder(p: BlockType) {
    const dx = p.x - this.player.position.x;
    const dy = p.y - (this.player.position.y - this.player.params.height / 2);
    const dz = p.z - this.player.position.z;
    const r_sq = dx * dx + dz * dz;

    return (
      Math.abs(dy) <= this.player.params.height / 2 &&
      r_sq <= this.player.params.radius * this.player.params.radius
    );
  }
}
