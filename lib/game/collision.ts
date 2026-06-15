import {
  BODY_COLLISION_DIST,
  HEAD_COLLISION_DIST,
} from "@/lib/game/constants";
import { distance, isOutOfBounds } from "@/lib/game/motion";
import type { EndReason, Position, Snake } from "@/types/game";

export function hitsOtherBody(
  head: Position,
  otherBodies: Position[][],
): boolean {
  for (const body of otherBodies) {
    for (const segment of body.slice(1)) {
      if (distance(head, segment) < BODY_COLLISION_DIST) {
        return true;
      }
    }
  }

  return false;
}

export function detectCollision(
  head: Position,
  otherBodies: Position[][],
  worldSize: number,
): EndReason {
  if (isOutOfBounds(head, worldSize)) {
    return "wall";
  }

  if (hitsOtherBody(head, otherBodies)) {
    return "snake";
  }

  return null;
}

export function resolveHeadToHead(
  snakes: Snake[],
  nextHeads: Map<number, Position>,
): Set<number> {
  const deadIds = new Set<number>();
  const alive = snakes.filter((snake) => snake.alive);

  for (let i = 0; i < alive.length; i += 1) {
    for (let j = i + 1; j < alive.length; j += 1) {
      const snakeA = alive[i];
      const snakeB = alive[j];
      const headA = nextHeads.get(snakeA.id);
      const headB = nextHeads.get(snakeB.id);

      if (!headA || !headB) {
        continue;
      }

      if (distance(headA, headB) >= HEAD_COLLISION_DIST * 2) {
        continue;
      }

      const lengthA = snakeA.body.length;
      const lengthB = snakeB.body.length;

      if (lengthA === lengthB) {
        deadIds.add(snakeA.id);
        deadIds.add(snakeB.id);
      } else if (lengthA > lengthB) {
        deadIds.add(snakeB.id);
      } else {
        deadIds.add(snakeA.id);
      }
    }
  }

  return deadIds;
}

export function findKillerByBodyHit(
  victimHead: Position,
  snakes: Snake[],
  deadIds: Set<number>,
  victimId: number,
): Snake | null {
  for (const snake of snakes) {
    if (
      snake.id === victimId ||
      !snake.alive ||
      deadIds.has(snake.id)
    ) {
      continue;
    }

    for (let i = 1; i < snake.body.length; i += 1) {
      if (distance(victimHead, snake.body[i]) < BODY_COLLISION_DIST) {
        return snake;
      }
    }
  }

  return null;
}

export function findHeadToHeadKiller(
  victim: Snake,
  snakes: Snake[],
  nextHeads: Map<number, Position>,
  deadIds: Set<number>,
): Snake | null {
  const victimHead = nextHeads.get(victim.id);
  if (!victimHead) {
    return null;
  }

  for (const snake of snakes) {
    if (
      snake.id === victim.id ||
      !snake.alive ||
      deadIds.has(snake.id)
    ) {
      continue;
    }

    const otherHead = nextHeads.get(snake.id);
    if (!otherHead) {
      continue;
    }

    if (distance(victimHead, otherHead) >= HEAD_COLLISION_DIST * 2) {
      continue;
    }

    if (snake.body.length > victim.body.length) {
      return snake;
    }

    if (
      snake.body.length === victim.body.length &&
      snake.id !== victim.id
    ) {
      return null;
    }
  }

  return null;
}
