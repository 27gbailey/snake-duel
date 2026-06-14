import { GRID_SIZE } from "@/lib/game/constants";
import {
  detectCollision,
  getAlivePlayers,
  isHeadToHead,
} from "@/lib/game/collision";
import {
  advanceBullets,
  advanceEnemies,
  createInitialEnemies,
  fireEnemyAttacks,
  getBulletHits,
  getEnemyCollisionPlayer,
  getOccupiedCells,
  removeHitBullets,
} from "@/lib/game/enemies";
import {
  getNextHead,
  isOppositeDirection,
  positionsEqual,
} from "@/lib/game/direction";
import type {
  Direction,
  GameMode,
  GameState,
  PlayerId,
  PlayerState,
  Position,
} from "@/types/game";

function createInactivePlayer(): PlayerState {
  return {
    snake: [],
    direction: "RIGHT",
    nextDirection: "RIGHT",
    score: 0,
    alive: false,
    endReason: null,
  };
}

function getActivePlayerIds(mode: GameMode): PlayerId[] {
  return mode === "solo" ? [1] : [1, 2];
}

function getStartMessage(mode: GameMode): string {
  if (mode === "solo") {
    return "Solo — dodge moving enemies: shots, spreads, bursts & beams";
  }

  return "Dodge hunters, patrollers, strikers & wardens";
}

function createInitialSnake(
  startX: number,
  startY: number,
  direction: Direction,
): Position[] {
  const body: Position[] = [{ x: startX, y: startY }];

  for (let i = 1; i <= 2; i++) {
    switch (direction) {
      case "RIGHT":
        body.push({ x: startX - i, y: startY });
        break;
      case "LEFT":
        body.push({ x: startX + i, y: startY });
        break;
      case "DOWN":
        body.push({ x: startX, y: startY - i });
        break;
      case "UP":
        body.push({ x: startX, y: startY + i });
        break;
    }
  }

  return body;
}

function createPlayer(
  startX: number,
  startY: number,
  direction: Direction,
): PlayerState {
  return {
    snake: createInitialSnake(startX, startY, direction),
    direction,
    nextDirection: direction,
    score: 0,
    alive: true,
    endReason: null,
  };
}

export function createInitialGameState(mode: GameMode = "duel"): GameState {
  const mid = Math.floor(GRID_SIZE / 2);
  const enemies = createInitialEnemies();

  const players =
    mode === "solo"
      ? {
          1: createPlayer(mid, mid, "RIGHT"),
          2: createInactivePlayer(),
        }
      : {
          1: createPlayer(4, mid, "RIGHT"),
          2: createPlayer(GRID_SIZE - 5, mid, "LEFT"),
        };

  return {
    gridSize: GRID_SIZE,
    mode,
    players,
    food: spawnFood(players, enemies, GRID_SIZE),
    enemies,
    bullets: [],
    tick: 0,
    nextBulletId: 0,
    status: "playing",
    winner: null,
    message: getStartMessage(mode),
  };
}

export function spawnFood(
  players: Record<PlayerId, PlayerState>,
  enemies: GameState["enemies"],
  gridSize: number,
): Position {
  const occupied = getOccupiedCells(players, enemies);

  const freeCells: Position[] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: 0, y: 0 };
  }

  const index = Math.floor(Math.random() * freeCells.length);
  return freeCells[index];
}

export function setPlayerDirection(
  state: GameState,
  playerId: PlayerId,
  direction: Direction,
): GameState {
  if (state.status !== "playing" || !state.players[playerId].alive) {
    return state;
  }

  const player = state.players[playerId];

  if (isOppositeDirection(player.direction, direction)) {
    return state;
  }

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        nextDirection: direction,
      },
    },
  };
}

function buildEndMessage(
  winner: PlayerId | "draw" | null,
  players: Record<PlayerId, PlayerState>,
  mode: GameMode,
): string {
  if (mode === "solo") {
    const player = players[1];
    const reason =
      player.endReason === "wall"
        ? "Hit the wall!"
        : player.endReason === "self"
          ? "Bit yourself!"
          : player.endReason === "bullet"
            ? "Hit by a bullet!"
            : player.endReason === "enemy"
              ? "Ran into a turret!"
              : "";

    return reason
      ? `Game over! Score: ${player.score} — ${reason}`
      : `Game over! Score: ${player.score}`;
  }

  if (winner === "draw") {
    const p1 = players[1].endReason;
    const p2 = players[2].endReason;

    if (p1 === "head-to-head" && p2 === "head-to-head") {
      return "Head-to-head draw! Both snakes collide.";
    }

    return "Draw! Both players are out.";
  }

  if (winner === 1) {
    return `Player 1 wins! Score: ${players[1].score}`;
  }

  if (winner === 2) {
    return `Player 2 wins! Score: ${players[2].score}`;
  }

  return "";
}

function finalizeGame(state: GameState): GameState {
  if (state.mode === "solo") {
    return {
      ...state,
      status: "ended",
      winner: null,
      message: buildEndMessage(null, state.players, state.mode),
    };
  }

  const alive = getAlivePlayers({
    1: state.players[1].alive,
    2: state.players[2].alive,
  });

  let winner: PlayerId | "draw" | null = null;

  if (alive.length === 0) {
    winner = "draw";
  } else if (alive.length === 1) {
    winner = alive[0];
  }

  return {
    ...state,
    status: "ended",
    winner,
    message: buildEndMessage(winner, state.players, state.mode),
  };
}

export function advanceGame(state: GameState): GameState {
  if (state.status !== "playing") {
    return state;
  }

  const tick = state.tick + 1;
  const activeIds = getActivePlayerIds(state.mode);
  let players = { ...state.players };

  let enemies = advanceEnemies(state.enemies, players, state.mode, state.gridSize);

  const attackResult = fireEnemyAttacks(
    enemies,
    players,
    state.mode,
    state.gridSize,
    state.nextBulletId,
  );
  enemies = attackResult.enemies;

  let bullets = advanceBullets(
    [...state.bullets, ...attackResult.bullets],
    state.gridSize,
  );
  const nextBulletId = attackResult.nextBulletId;
  const bulletHits = getBulletHits(bullets, players, state.mode);

  if (bulletHits.length > 0) {
    const hitBulletIds = new Set<number>();

    for (const hit of bulletHits) {
      hitBulletIds.add(hit.bulletId);
      if (players[hit.playerId].alive) {
        players = {
          ...players,
          [hit.playerId]: {
            ...players[hit.playerId],
            alive: false,
            endReason: "bullet",
          },
        };
      }
    }

    bullets = removeHitBullets(bullets, hitBulletIds);
  }

  const nextHeads: Record<PlayerId, Position> = { 1: { x: 0, y: 0 }, 2: { x: 0, y: 0 } };
  const ateFood: Record<PlayerId, boolean> = { 1: false, 2: false };

  for (const id of activeIds) {
    const player = players[id];

    if (!player.alive) {
      nextHeads[id] = player.snake[0] ?? { x: 0, y: 0 };
      continue;
    }

    const direction = player.nextDirection;
    const head = player.snake[0];
    const nextHead = getNextHead(head, direction);
    nextHeads[id] = nextHead;
  }

  const headToHead =
    state.mode === "duel" &&
    players[1].alive &&
    players[2].alive &&
    isHeadToHead(nextHeads[1], nextHeads[2]);

  if (headToHead) {
    players[1] = {
      ...players[1],
      alive: false,
      endReason: "head-to-head",
    };
    players[2] = {
      ...players[2],
      alive: false,
      endReason: "head-to-head",
    };

    return finalizeGame({
      ...state,
      players,
      enemies,
      bullets,
      tick,
      nextBulletId,
    });
  }

  for (const id of activeIds) {
    const player = players[id];

    if (!player.alive) {
      continue;
    }

    const direction = player.nextDirection;
    const body = player.snake;
    const otherSnake =
      state.mode === "duel" ? players[id === 1 ? 2 : 1].snake : [];
    const nextHead = nextHeads[id];

    if (getEnemyCollisionPlayer(nextHead, enemies)) {
      players[id] = {
        ...player,
        alive: false,
        endReason: "enemy",
      };
      continue;
    }

    const endReason = detectCollision(
      nextHead,
      body,
      otherSnake,
      state.gridSize,
    );

    if (endReason) {
      players[id] = {
        ...player,
        alive: false,
        endReason,
      };
      continue;
    }

    const willEat = positionsEqual(nextHead, state.food);
    ateFood[id] = willEat;

    const newSnake = [nextHead, ...body];
    if (!willEat) {
      newSnake.pop();
    }

    players[id] = {
      ...player,
      snake: newSnake,
      direction,
      nextDirection: direction,
      score: willEat ? player.score + 1 : player.score,
    };
  }

  const aliveAfterMove = getAlivePlayers({
    1: players[1].alive,
    2: players[2].alive,
  });

  if (state.mode === "solo" && !players[1].alive) {
    return finalizeGame({
      ...state,
      players,
      enemies,
      bullets,
      tick,
      nextBulletId,
    });
  }

  if (state.mode === "duel" && aliveAfterMove.length < 2) {
    return finalizeGame({
      ...state,
      players,
      enemies,
      bullets,
      tick,
      nextBulletId,
    });
  }

  let food = state.food;
  if (activeIds.some((id) => ateFood[id])) {
    food = spawnFood(players, enemies, state.gridSize);
  }

  return {
    ...state,
    players,
    enemies,
    food,
    bullets,
    tick,
    nextBulletId,
  };
}
