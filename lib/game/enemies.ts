import {
  BEAM_MAX_LENGTH,
  BEAM_TTL,
  BULLET_SPEED,
  BURST_BULLET_SPEED,
  ENEMY_COUNT,
  ENEMY_DIRECTIONS,
  ENEMY_KINDS,
  ENEMY_MIN_SEPARATION,
  ENEMY_MIN_SNAKE_DISTANCE,
  ENEMY_SEPARATION_RADIUS,
  ENEMY_STATS,
} from "@/lib/game/constants";
import {
  getNextHead,
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

const CHASE_CHANCE: Record<EnemyKind, number> = {
  hunter: 0.35,
  patroller: 0,
  striker: 0.4,
  warden: 0.25,
};

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getSnakePositions(
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
): Position[] {
  const activeIds: PlayerId[] = mode === "solo" ? [1] : [1, 2];
  const positions: Position[] = [];

  for (const id of activeIds) {
    positions.push(...players[id].snake);
  }

  return positions;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function isValidEnemySpawn(
  position: Position,
  snakePositions: Position[],
  placedEnemies: Enemy[],
  gridSize: number,
): boolean {
  if (isOutOfBounds(position, gridSize)) {
    return false;
  }

  for (const segment of snakePositions) {
    if (manhattanDistance(position, segment) < ENEMY_MIN_SNAKE_DISTANCE) {
      return false;
    }
  }

  for (const enemy of placedEnemies) {
    if (manhattanDistance(position, enemy.position) < ENEMY_MIN_SEPARATION) {
      return false;
    }
  }

  return true;
}

function pickRandomSpawn(
  snakePositions: Position[],
  placedEnemies: Enemy[],
  gridSize: number,
  enemyIndex: number,
): Position {
  const maxAttempts = 300;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };

    if (isValidEnemySpawn(candidate, snakePositions, placedEnemies, gridSize)) {
      return candidate;
    }
  }

  const margin = 4 + enemyIndex * 3;
  return {
    x: Math.min(gridSize - margin, margin + enemyIndex * 5),
    y: Math.min(gridSize - margin, margin + enemyIndex * 4),
  };
}

function getValidMoves(
  enemy: Enemy,
  gridSize: number,
  enemies: Enemy[],
  players: Record<PlayerId, PlayerState>,
): { position: Position; direction: Direction }[] {
  const moves: { position: Position; direction: Direction }[] = [];

  for (const direction of ENEMY_DIRECTIONS) {
    const position = getNextHead(enemy.position, direction);
    if (!isBlocked(position, gridSize, enemies, players, enemy.id)) {
      moves.push({ position, direction });
    }
  }

  return moves;
}

function getSeparationMove(
  enemy: Enemy,
  moves: { position: Position; direction: Direction }[],
  enemies: Enemy[],
): { position: Position; direction: Direction } | null {
  let bestMove: { position: Position; direction: Direction } | null = null;
  let bestDistance = -1;

  for (const move of moves) {
    let nearestEnemyDistance = Infinity;

    for (const other of enemies) {
      if (other.id === enemy.id) {
        continue;
      }

      const distance = manhattanDistance(move.position, other.position);
      nearestEnemyDistance = Math.min(nearestEnemyDistance, distance);
    }

    if (nearestEnemyDistance > bestDistance) {
      bestDistance = nearestEnemyDistance;
      bestMove = move;
    }
  }

  return bestMove;
}

function isCrowdedNearTarget(
  enemy: Enemy,
  target: Position,
  enemies: Enemy[],
): boolean {
  return enemies.some(
    (other) =>
      other.id !== enemy.id &&
      manhattanDistance(other.position, target) <= ENEMY_SEPARATION_RADIUS,
  );
}

function pickWanderMove(
  enemy: Enemy,
  moves: { position: Position; direction: Direction }[],
): { position: Position; direction: Direction } | null {
  if (moves.length === 0) {
    return null;
  }

  const continueForward = moves.find((move) => move.direction === enemy.direction);
  if (continueForward && Math.random() < 0.55) {
    return continueForward;
  }

  return moves[Math.floor(Math.random() * moves.length)];
}

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

function applyMove(
  enemy: Enemy,
  move: { position: Position; direction: Direction } | null,
): Enemy {
  if (!move) {
    return enemy;
  }

  return {
    ...enemy,
    position: move.position,
    direction: move.direction,
  };
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

  const nextEnemy = { ...enemy, moveCooldown: stats.moveInterval };
  const target = getNearestTarget(enemy, players, mode);
  const validMoves = getValidMoves(enemy, gridSize, enemies, players);

  if (validMoves.length === 0) {
    return nextEnemy;
  }

  const nearestEnemyDistance = enemies.reduce((minDistance, other) => {
    if (other.id === enemy.id) {
      return minDistance;
    }

    return Math.min(minDistance, manhattanDistance(enemy.position, other.position));
  }, Infinity);

  if (nearestEnemyDistance <= ENEMY_SEPARATION_RADIUS) {
    const separationMove = getSeparationMove(enemy, validMoves, enemies);
    return applyMove(nextEnemy, separationMove ?? pickWanderMove(enemy, validMoves));
  }

  const shouldChase =
    target !== null &&
    Math.random() < CHASE_CHANCE[enemy.kind] &&
    !isCrowdedNearTarget(enemy, target, enemies);

  if (shouldChase) {
    const chased = tryChaseMove(nextEnemy, target, gridSize, enemies, players);
    if (!positionsEqual(chased.position, enemy.position)) {
      return chased;
    }
  }

  if (enemy.kind === "patroller") {
    const forward = validMoves.find((move) => move.direction === enemy.direction);
    if (forward) {
      return applyMove(nextEnemy, forward);
    }

    const wander = pickWanderMove(enemy, validMoves);
    return applyMove(nextEnemy, wander);
  }

  const wander = pickWanderMove(enemy, validMoves);
  return applyMove(nextEnemy, wander);
}

export function createInitialEnemies(
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
  gridSize: number,
): Enemy[] {
  const snakePositions = getSnakePositions(players, mode);
  const kinds = shuffle([...ENEMY_KINDS]);
  const enemies: Enemy[] = [];

  for (let index = 0; index < ENEMY_COUNT; index += 1) {
    const kind = kinds[index % kinds.length];
    const position = pickRandomSpawn(snakePositions, enemies, gridSize, index);
    const direction = ENEMY_DIRECTIONS[Math.floor(Math.random() * ENEMY_DIRECTIONS.length)];

    enemies.push({
      id: index,
      kind,
      position,
      direction,
      moveCooldown: ENEMY_STATS[kind].moveInterval + index,
      attackCooldown: ENEMY_STATS[kind].attackInterval + index * 2,
    });
  }

  return enemies;
}

export function findEnemyAt(enemies: Enemy[], position: Position): number {
  return enemies.findIndex((enemy) => positionsEqual(enemy.position, position));
}

export function spawnReplacementEnemy(
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
  gridSize: number,
  enemies: Enemy[],
  nextId: number,
): { enemy: Enemy; nextEnemyId: number } {
  const kind = ENEMY_KINDS[Math.floor(Math.random() * ENEMY_KINDS.length)];
  const snakePositions = getSnakePositions(players, mode);
  const position = pickRandomSpawn(snakePositions, enemies, gridSize, nextId);
  const direction = ENEMY_DIRECTIONS[Math.floor(Math.random() * ENEMY_DIRECTIONS.length)];

  return {
    enemy: {
      id: nextId,
      kind,
      position,
      direction,
      moveCooldown: ENEMY_STATS[kind].moveInterval,
      attackCooldown: ENEMY_STATS[kind].attackInterval,
    },
    nextEnemyId: nextId + 1,
  };
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
  const start = getNextHead(enemy.position, direction);

  return {
    bullets: [createBullet(bulletId, start, direction, "spread", BULLET_SPEED)],
    nextBulletId: bulletId + 1,
  };
}

function createBurstAttack(
  enemy: Enemy,
  target: Position,
  bulletId: number,
): { bullets: Bullet[]; nextBulletId: number } {
  const direction = getAimDirection(enemy.position, target);
  const start = getNextHead(enemy.position, direction);

  return {
    bullets: [createBullet(bulletId, start, direction, "burst", BURST_BULLET_SPEED)],
    nextBulletId: bulletId + 1,
  };
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
  let length = 0;

  while (!isOutOfBounds(position, gridSize) && length < BEAM_MAX_LENGTH) {
    bullets.push(createBullet(id, position, direction, "beam", 0, BEAM_TTL));
    position = getNextHead(position, direction);
    id += 1;
    length += 1;
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
