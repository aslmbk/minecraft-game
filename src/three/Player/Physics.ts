import { Player } from "./Player";
import { World } from "../World";
import * as THREE from "three";
import { blocks } from "../World/Blocks";

type BlockType = {
  x: number;
  y: number;
  z: number;
};

export class Physics {
  private world: World;
  private player: Player;

  constructor(world: World, player: Player) {
    this.world = world;
    this.player = player;
  }

  public getMaxVelocity(velocity: THREE.Vector3) {
    const candidates = this.broadPhase();
    const newVelocity = velocity.clone();

    const p = this.player.position.clone().add(velocity);

    for (const candidate of candidates) {
      const closestPoint = {
        x: Math.max(candidate.x - 0.5, Math.min(p.x, candidate.x + 0.5)),
        y: Math.max(
          candidate.y - 0.5,
          Math.min(p.y - this.player.params.height / 2, candidate.y + 0.5)
        ),
        z: Math.max(candidate.z - 0.5, Math.min(p.z, candidate.z + 0.5)),
      };

      if (this.pointInPlayerBoundingCylinder(closestPoint)) {
        const dx = closestPoint.x - p.x;
        const dy = closestPoint.y - (p.y - this.player.params.height / 2);
        const dz = closestPoint.z - p.z;
        newVelocity.x = Math.max(
          0,
          Math.min(newVelocity.x, velocity.x - Math.abs(dx))
        );
        newVelocity.z = Math.max(
          0,
          Math.min(newVelocity.z, velocity.z - Math.abs(dz))
        );
        newVelocity.y = Math.max(
          0,
          Math.min(newVelocity.y, velocity.y + Math.abs(dy))
        );
      }
    }

    return newVelocity;
  }

  private broadPhase() {
    const candidates: BlockType[] = [];
    const playerAABB = this.getAABB();

    for (let x = playerAABB.x.min; x <= playerAABB.x.max; x++) {
      for (let y = playerAABB.y.min; y <= playerAABB.y.max; y++) {
        for (let z = playerAABB.z.min; z <= playerAABB.z.max; z++) {
          const block = this.world.terrain.getBlock(x, y, z);
          if (block && block.id !== blocks.empty.id) {
            const blockPosition = { x, y, z };
            candidates.push(blockPosition);
          }
        }
      }
    }

    return candidates;
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
