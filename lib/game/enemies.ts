import {
  BULLET_SPEED,
  ENEMY_FIRE_INTERVAL,
  ENEMY_POSITIONS,
} from "@/lib/game/constants";
import { getNextHead, isOutOfBounds, positionsEqual } from "@/lib/game/direction";
import type {
  Bullet,
  Direction,
  Enemy,
  GameMode,
  PlayerId,
  PlayerState,
  Position,
} from "@/types/game";

function getAimDirection(from: Position, to: Position): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "RIGHT" : "LEFT";
  }

  return dy >= 0 ? "DOWN" : "UP";
}

function getNearestTarget(
  enemy: Enemy,
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
): Position | null {
  const activeIds: PlayerId[] = mode === "solo" ? [1] : [1, 2];
  let nearest: Position | null = null;
  let nearestDistance = Infinity;

  for (const id of activeIds) {
    const player = players[id];
    if (!player.alive || player.snake.length === 0) {
      continue;
    }

    const head = player.snake[0];
    const distance = Math.abs(head.x - enemy.position.x) + Math.abs(head.y - enemy.position.y);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = head;
    }
  }

  return nearest;
}

export function createInitialEnemies(): Enemy[] {
  return ENEMY_POSITIONS.map((position, index) => ({
    id: index,
    position,
  }));
}

export function isEnemyAt(enemies: Enemy[], position: Position): boolean {
  return enemies.some((enemy) => positionsEqual(enemy.position, position));
}

export function fireEnemyBullets(
  enemies: Enemy[],
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
  tick: number,
  nextBulletId: number,
): { bullets: Bullet[]; nextBulletId: number } {
  const newBullets: Bullet[] = [];
  let bulletId = nextBulletId;

  for (const enemy of enemies) {
    const fireTick = (tick + enemy.id * 2) % ENEMY_FIRE_INTERVAL;
    if (fireTick !== 0) {
      continue;
    }

    const target = getNearestTarget(enemy, players, mode);
    if (!target) {
      continue;
    }

    const direction = getAimDirection(enemy.position, target);
    const start = getNextHead(enemy.position, direction);

    newBullets.push({
      id: bulletId,
      position: start,
      direction,
    });
    bulletId += 1;
  }

  return { bullets: newBullets, nextBulletId: bulletId };
}

export function advanceBullets(
  bullets: Bullet[],
  gridSize: number,
  steps: number = BULLET_SPEED,
): Bullet[] {
  const nextBullets: Bullet[] = [];

  for (const bullet of bullets) {
    let position = bullet.position;
    let alive = true;

    for (let step = 0; step < steps; step += 1) {
      position = getNextHead(position, bullet.direction);
      if (isOutOfBounds(position, gridSize)) {
        alive = false;
        break;
      }
    }

    if (alive) {
      nextBullets.push({ ...bullet, position });
    }
  }

  return nextBullets;
}

export function getBulletHits(
  bullets: Bullet[],
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
): { playerId: PlayerId; bulletId: number }[] {
  const hits: { playerId: PlayerId; bulletId: number }[] = [];
  const activeIds: PlayerId[] = mode === "solo" ? [1] : [1, 2];

  for (const bullet of bullets) {
    for (const id of activeIds) {
      const player = players[id];
      if (!player.alive) {
        continue;
      }

      const struck = player.snake.some((segment) => positionsEqual(segment, bullet.position));
      if (struck) {
        hits.push({ playerId: id, bulletId: bullet.id });
        break;
      }
    }
  }

  return hits;
}

export function removeHitBullets(bullets: Bullet[], hitBulletIds: Set<number>): Bullet[] {
  return bullets.filter((bullet) => !hitBulletIds.has(bullet.id));
}

export function getEnemyCollisionPlayer(
  head: Position,
  enemies: Enemy[],
): boolean {
  return isEnemyAt(enemies, head);
}

export function getOccupiedCells(
  players: Record<PlayerId, PlayerState>,
  enemies: Enemy[],
): Set<string> {
  const occupied = new Set<string>();

  for (const player of Object.values(players)) {
    for (const segment of player.snake) {
      occupied.add(`${segment.x},${segment.y}`);
    }
  }

  for (const enemy of enemies) {
    occupied.add(`${enemy.position.x},${enemy.position.y}`);
  }

  return occupied;
}
