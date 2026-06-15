import type { EndReason, Position, Snake } from "@/types/game";
import {
  isOutOfBounds,
  positionKey,
  positionsEqual,
} from "@/lib/game/direction";

export function hitsOtherBody(
  head: Position,
  otherBodies: Position[][],
): boolean {
  for (const body of otherBodies) {
    for (const segment of body.slice(1)) {
      if (positionsEqual(head, segment)) {
        return true;
      }
    }
  }

  return false;
}

export function detectCollision(
  head: Position,
  otherBodies: Position[][],
  gridSize: number,
): EndReason {
  if (isOutOfBounds(head, gridSize)) {
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
  const groups = new Map<string, Snake[]>();

  for (const snake of snakes) {
    if (!snake.alive) {
      continue;
    }

    const head = nextHeads.get(snake.id);
    if (!head) {
      continue;
    }

    const key = positionKey(head);
    const group = groups.get(key) ?? [];
    group.push(snake);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }

    const lengths = group.map((snake) => snake.body.length);
    const maxLength = Math.max(...lengths);
    const contenders = group.filter((snake) => snake.body.length === maxLength);

    if (contenders.length > 1) {
      for (const snake of group) {
        deadIds.add(snake.id);
      }
    } else {
      for (const snake of group) {
        if (snake.body.length < maxLength) {
          deadIds.add(snake.id);
        }
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
      if (positionsEqual(victimHead, snake.body[i])) {
        return snake;
      }
    }
  }

  return null;
}

export function findHeadToHeadKiller(
  victim: Snake,
  group: Snake[],
  deadIds: Set<number>,
): Snake | null {
  const survivors = group.filter(
    (snake) => snake.alive && !deadIds.has(snake.id),
  );

  if (survivors.length !== 1) {
    return null;
  }

  const winner = survivors[0];
  return winner.id === victim.id ? null : winner;
}

export function getHeadToHeadGroups(
  snakes: Snake[],
  nextHeads: Map<number, Position>,
): Map<string, Snake[]> {
  const groups = new Map<string, Snake[]>();

  for (const snake of snakes) {
    if (!snake.alive) {
      continue;
    }

    const head = nextHeads.get(snake.id);
    if (!head) {
      continue;
    }

    const key = positionKey(head);
    const group = groups.get(key) ?? [];
    group.push(snake);
    groups.set(key, group);
  }

  return groups;
}
