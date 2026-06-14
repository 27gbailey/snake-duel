import { GRID_SIZE } from "@/lib/game/constants";
import {
  detectCollision,
  getAlivePlayers,
  isHeadToHead,
} from "@/lib/game/collision";
import {
  getNextHead,
  isOppositeDirection,
  positionsEqual,
} from "@/lib/game/direction";
import type {
  Direction,
  GameState,
  PlayerId,
  PlayerState,
  Position,
} from "@/types/game";

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

export function createInitialGameState(): GameState {
  const midY = Math.floor(GRID_SIZE / 2);

  return {
    gridSize: GRID_SIZE,
    players: {
      1: createPlayer(4, midY, "RIGHT"),
      2: createPlayer(GRID_SIZE - 5, midY, "LEFT"),
    },
    food: spawnFood(
      {
        1: createPlayer(4, midY, "RIGHT"),
        2: createPlayer(GRID_SIZE - 5, midY, "LEFT"),
      },
      GRID_SIZE,
    ),
    status: "playing",
    winner: null,
    message: "Player 1: WASD · Player 2: Arrow keys",
  };
}

export function spawnFood(
  players: Record<PlayerId, PlayerState>,
  gridSize: number,
): Position {
  const occupied = new Set<string>();

  for (const player of Object.values(players)) {
    for (const segment of player.snake) {
      occupied.add(`${segment.x},${segment.y}`);
    }
  }

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
): string {
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
    message: buildEndMessage(winner, state.players),
  };
}

export function advanceGame(state: GameState): GameState {
  if (state.status !== "playing") {
    return state;
  }

  const players = { ...state.players };
  const nextHeads: Record<PlayerId, Position> = { 1: { x: 0, y: 0 }, 2: { x: 0, y: 0 } };
  const ateFood: Record<PlayerId, boolean> = { 1: false, 2: false };

  for (const id of [1, 2] as PlayerId[]) {
    const player = players[id];

    if (!player.alive) {
      nextHeads[id] = player.snake[0];
      continue;
    }

    const direction = player.nextDirection;
    const head = player.snake[0];
    const nextHead = getNextHead(head, direction);
    nextHeads[id] = nextHead;

  }

  const headToHead =
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
    });
  }

  for (const id of [1, 2] as PlayerId[]) {
    const player = players[id];

    if (!player.alive) {
      continue;
    }

    const direction = player.nextDirection;
    const body = player.snake;
    const otherId: PlayerId = id === 1 ? 2 : 1;
    const otherSnake = players[otherId].snake;
    const nextHead = nextHeads[id];

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

  if (aliveAfterMove.length < 2) {
    return finalizeGame({
      ...state,
      players,
    });
  }

  let food = state.food;
  if (ateFood[1] || ateFood[2]) {
    food = spawnFood(players, state.gridSize);
  }

  return {
    ...state,
    players,
    food,
  };
}
