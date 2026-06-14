import {
  BEAM_TTL,
  BULLET_SPEED,
  BURST_BULLET_SPEED,
  ENEMY_SPAWNS,
  ENEMY_STATS,
} from "@/lib/game/constants";
import {
  flipDirection,
  getNextHead,
  getPerpendicularDirections,
  isOutOfBounds,
  positionsEqual,
} from "@/lib/game/direction";
import type {
  AttackKind,
  Bullet,
  Direction,
  Enemy,
  EnemyKind,
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
    const distance =
      Math.abs(head.x - enemy.position.x) + Math.abs(head.y - enemy.position.y);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = head;
    }
  }

  return nearest;
}

function isBlocked(
  position: Position,
  gridSize: number,
  enemies: Enemy[],
  players: Record<PlayerId, PlayerState>,
  enemyId: number,
): boolean {
  if (isOutOfBounds(position, gridSize)) {
    return true;
  }

  if (enemies.some((enemy) => enemy.id !== enemyId && positionsEqual(enemy.position, position))) {
    return true;
  }

  for (const player of Object.values(players)) {
    if (player.snake.some((segment) => positionsEqual(segment, position))) {
      return true;
    }
  }

  return false;
}

function tryChaseMove(
  enemy: Enemy,
  target: Position,
  gridSize: number,
  enemies: Enemy[],
  players: Record<PlayerId, PlayerState>,
): Enemy {
  const dx = target.x - enemy.position.x;
  const dy = target.y - enemy.position.y;
  const primary: Position =
    Math.abs(dx) >= Math.abs(dy)
      ? { x: enemy.position.x + Math.sign(dx), y: enemy.position.y }
      : { x: enemy.position.x, y: enemy.position.y + Math.sign(dy) };
  const secondary: Position =
    Math.abs(dx) >= Math.abs(dy)
      ? { x: enemy.position.x, y: enemy.position.y + Math.sign(dy) }
      : { x: enemy.position.x + Math.sign(dx), y: enemy.position.y };

  if (!isBlocked(primary, gridSize, enemies, players, enemy.id)) {
    return { ...enemy, position: primary, direction: getAimDirection(enemy.position, primary) };
  }

  if (!isBlocked(secondary, gridSize, enemies, players, enemy.id)) {
    return { ...enemy, position: secondary, direction: getAimDirection(enemy.position, secondary) };
  }

  return enemy;
}

function moveEnemy(
  enemy: Enemy,
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
  gridSize: number,
  enemies: Enemy[],
): Enemy {
  const stats = ENEMY_STATS[enemy.kind];
  const moveCooldown = enemy.moveCooldown - 1;

  if (moveCooldown > 0) {
    return { ...enemy, moveCooldown };
  }

  let nextEnemy = { ...enemy, moveCooldown: stats.moveInterval };
  const target = getNearestTarget(enemy, players, mode);

  switch (enemy.kind) {
    case "hunter":
    case "striker":
      if (target) {
        nextEnemy = tryChaseMove(nextEnemy, target, gridSize, enemies, players);
      }
      break;

    case "patroller": {
      const candidate = getNextHead(enemy.position, enemy.direction);
      if (!isBlocked(candidate, gridSize, enemies, players, enemy.id)) {
        nextEnemy = { ...nextEnemy, position: candidate };
      } else {
        nextEnemy = { ...nextEnemy, direction: flipDirection(enemy.direction) };
      }
      break;
    }

    case "warden": {
      if (target) {
        nextEnemy = tryChaseMove(nextEnemy, target, gridSize, enemies, players);
      } else {
        const candidate = getNextHead(enemy.position, enemy.direction);
        if (!isBlocked(candidate, gridSize, enemies, players, enemy.id)) {
          nextEnemy = { ...nextEnemy, position: candidate };
        } else {
          const [left, right] = getPerpendicularDirections(enemy.direction);
          const leftPos = getNextHead(enemy.position, left);
          const rightPos = getNextHead(enemy.position, right);

          if (!isBlocked(leftPos, gridSize, enemies, players, enemy.id)) {
            nextEnemy = { ...nextEnemy, position: leftPos, direction: left };
          } else if (!isBlocked(rightPos, gridSize, enemies, players, enemy.id)) {
            nextEnemy = { ...nextEnemy, position: rightPos, direction: right };
          } else {
            nextEnemy = { ...nextEnemy, direction: flipDirection(enemy.direction) };
          }
        }
      }
      break;
    }
  }

  return nextEnemy;
}

export function createInitialEnemies(): Enemy[] {
  return ENEMY_SPAWNS.map((spawn, index) => ({
    id: index,
    kind: spawn.kind,
    position: spawn.position,
    direction: spawn.direction,
    moveCooldown: ENEMY_STATS[spawn.kind].moveInterval,
    attackCooldown: ENEMY_STATS[spawn.kind].attackInterval + index,
  }));
}

export function advanceEnemies(
  enemies: Enemy[],
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
  gridSize: number,
): Enemy[] {
  const nextEnemies = [...enemies];

  for (let index = 0; index < nextEnemies.length; index += 1) {
    nextEnemies[index] = moveEnemy(
      nextEnemies[index],
      players,
      mode,
      gridSize,
      nextEnemies,
    );
  }

  return nextEnemies;
}

export function isEnemyAt(enemies: Enemy[], position: Position): boolean {
  return enemies.some((enemy) => positionsEqual(enemy.position, position));
}

function createBullet(
  id: number,
  position: Position,
  direction: Direction,
  kind: AttackKind,
  speed: number,
  ttl?: number,
): Bullet {
  return { id, position, direction, kind, speed, ttl };
}

function createShotAttack(
  enemy: Enemy,
  target: Position,
  bulletId: number,
): { bullets: Bullet[]; nextBulletId: number } {
  const direction = getAimDirection(enemy.position, target);
  const start = getNextHead(enemy.position, direction);

  return {
    bullets: [createBullet(bulletId, start, direction, "shot", BULLET_SPEED)],
    nextBulletId: bulletId + 1,
  };
}

function createSpreadAttack(
  enemy: Enemy,
  target: Position,
  bulletId: number,
): { bullets: Bullet[]; nextBulletId: number } {
  const direction = getAimDirection(enemy.position, target);
  const [left, right] = getPerpendicularDirections(direction);
  const bullets = [direction, left, right].map((dir, index) =>
    createBullet(bulletId + index, getNextHead(enemy.position, dir), dir, "spread", BULLET_SPEED),
  );

  return { bullets, nextBulletId: bulletId + bullets.length };
}

function createBurstAttack(
  enemy: Enemy,
  target: Position,
  bulletId: number,
): { bullets: Bullet[]; nextBulletId: number } {
  const direction = getAimDirection(enemy.position, target);
  const bullets: Bullet[] = [];

  for (let step = 1; step <= 3; step += 1) {
    let position = enemy.position;
    for (let i = 0; i < step; i += 1) {
      position = getNextHead(position, direction);
    }
    bullets.push(
      createBullet(bulletId + step - 1, position, direction, "burst", BURST_BULLET_SPEED),
    );
  }

  return { bullets, nextBulletId: bulletId + bullets.length };
}

function createBeamAttack(
  enemy: Enemy,
  target: Position,
  bulletId: number,
  gridSize: number,
): { bullets: Bullet[]; nextBulletId: number } {
  const direction = getAimDirection(enemy.position, target);
  const bullets: Bullet[] = [];
  let position = getNextHead(enemy.position, direction);
  let id = bulletId;

  while (!isOutOfBounds(position, gridSize)) {
    bullets.push(createBullet(id, position, direction, "beam", 0, BEAM_TTL));
    position = getNextHead(position, direction);
    id += 1;
  }

  return { bullets, nextBulletId: id };
}

function createAttackForEnemy(
  enemy: Enemy,
  target: Position,
  bulletId: number,
  gridSize: number,
): { bullets: Bullet[]; nextBulletId: number } {
  switch (enemy.kind) {
    case "hunter":
      return createShotAttack(enemy, target, bulletId);
    case "patroller":
      return createSpreadAttack(enemy, target, bulletId);
    case "striker":
      return createBurstAttack(enemy, target, bulletId);
    case "warden":
      return createBeamAttack(enemy, target, bulletId, gridSize);
  }
}

export function fireEnemyAttacks(
  enemies: Enemy[],
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
  gridSize: number,
  nextBulletId: number,
): { enemies: Enemy[]; bullets: Bullet[]; nextBulletId: number } {
  const newBullets: Bullet[] = [];
  let bulletId = nextBulletId;
  const nextEnemies = enemies.map((enemy) => {
    const stats = ENEMY_STATS[enemy.kind];
    const attackCooldown = enemy.attackCooldown - 1;

    if (attackCooldown > 0) {
      return { ...enemy, attackCooldown };
    }

    const target = getNearestTarget(enemy, players, mode);
    if (target) {
      const attack = createAttackForEnemy(enemy, target, bulletId, gridSize);
      newBullets.push(...attack.bullets);
      bulletId = attack.nextBulletId;
    }

    return { ...enemy, attackCooldown: stats.attackInterval };
  });

  return { enemies: nextEnemies, bullets: newBullets, nextBulletId: bulletId };
}

export function advanceBullets(bullets: Bullet[], gridSize: number): Bullet[] {
  const nextBullets: Bullet[] = [];

  for (const bullet of bullets) {
    let ttl = bullet.ttl;

    if (ttl !== undefined) {
      ttl -= 1;
      if (ttl <= 0) {
        continue;
      }
    }

    if (bullet.speed === 0) {
      nextBullets.push({ ...bullet, ttl });
      continue;
    }

    let position = bullet.position;
    let alive = true;

    for (let step = 0; step < bullet.speed; step += 1) {
      position = getNextHead(position, bullet.direction);
      if (isOutOfBounds(position, gridSize)) {
        alive = false;
        break;
      }
    }

    if (alive) {
      nextBullets.push({ ...bullet, position, ttl });
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

export function getEnemyCollisionPlayer(head: Position, enemies: Enemy[]): boolean {
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

export function getEnemyLabel(kind: EnemyKind): string {
  switch (kind) {
    case "hunter":
      return "Hunter";
    case "patroller":
      return "Patroller";
    case "striker":
      return "Striker";
    case "warden":
      return "Warden";
  }
}
