import {
  AI_COLORS,
  AI_SNAKE_COUNT,
  GRID_SIZE,
  INITIAL_SNAKE_LENGTH,
  PELLET_COUNT,
  PLAYER_COLOR,
  PLAYER_ID,
} from "@/lib/game/constants";
import {
  assignAiTurns,
  applyPendingTurn,
} from "@/lib/game/ai";
import {
  detectCollision,
  diedOnPlayerBody,
  resolveHeadToHead,
} from "@/lib/game/collision";
import {
  getNextHead,
  positionKey,
  positionsEqual,
} from "@/lib/game/direction";
import type {
  Direction,
  EndReason,
  GameState,
  Position,
  Snake,
  Turn,
} from "@/types/game";

function createSnakeBody(
  startX: number,
  startY: number,
  direction: Direction,
  length: number,
): Position[] {
  const body: Position[] = [{ x: startX, y: startY }];

  for (let i = 1; i < length; i += 1) {
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

function createSnake(
  id: number,
  startX: number,
  startY: number,
  direction: Direction,
  isPlayer: boolean,
  colorIndex: number,
): Snake {
  const body = createSnakeBody(startX, startY, direction, INITIAL_SNAKE_LENGTH);

  return {
    id,
    body,
    direction,
    score: body.length,
    alive: true,
    isPlayer,
    color: isPlayer ? PLAYER_COLOR : AI_COLORS[colorIndex % AI_COLORS.length],
    pendingTurn: null,
  };
}

function getOccupiedCells(
  player: Snake,
  opponents: Snake[],
  pellets: Position[],
): Set<string> {
  const occupied = new Set<string>();

  for (const segment of player.body) {
    occupied.add(positionKey(segment));
  }

  for (const opponent of opponents) {
    if (!opponent.alive) {
      continue;
    }

    for (const segment of opponent.body) {
      occupied.add(positionKey(segment));
    }
  }

  for (const pellet of pellets) {
    occupied.add(positionKey(pellet));
  }

  return occupied;
}

function getFreeCells(
  player: Snake,
  opponents: Snake[],
  pellets: Position[],
  gridSize: number,
): Position[] {
  const occupied = getOccupiedCells(player, opponents, pellets);
  const free: Position[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }

  return free;
}

function spawnPellet(
  player: Snake,
  opponents: Snake[],
  pellets: Position[],
  gridSize: number,
): Position {
  const free = getFreeCells(player, opponents, pellets, gridSize);

  if (free.length === 0) {
    return { x: 0, y: 0 };
  }

  return free[Math.floor(Math.random() * free.length)];
}

function spawnPellets(
  player: Snake,
  opponents: Snake[],
  count: number,
  gridSize: number,
): Position[] {
  const pellets: Position[] = [];

  for (let i = 0; i < count; i += 1) {
    pellets.push(spawnPellet(player, opponents, pellets, gridSize));
  }

  return pellets;
}

const AI_SPAWN_POINTS: Array<{
  x: number;
  y: number;
  direction: Direction;
}> = [
  { x: 8, y: 8, direction: "RIGHT" },
  { x: 41, y: 8, direction: "LEFT" },
  { x: 8, y: 41, direction: "RIGHT" },
  { x: 41, y: 41, direction: "LEFT" },
  { x: 25, y: 6, direction: "DOWN" },
  { x: 25, y: 43, direction: "UP" },
  { x: 6, y: 25, direction: "RIGHT" },
  { x: 43, y: 25, direction: "LEFT" },
];

function createOpponents(nextSnakeId: number): { opponents: Snake[]; nextId: number } {
  const opponents: Snake[] = [];
  let nextId = nextSnakeId;

  for (let i = 0; i < AI_SNAKE_COUNT; i += 1) {
    const spawn = AI_SPAWN_POINTS[i % AI_SPAWN_POINTS.length];
    opponents.push(
      createSnake(nextId, spawn.x, spawn.y, spawn.direction, false, i),
    );
    nextId += 1;
  }

  return { opponents, nextId };
}

function spawnReplacementOpponent(
  state: GameState,
): { opponent: Snake; nextSnakeId: number } {
  const spawn =
    AI_SPAWN_POINTS[Math.floor(Math.random() * AI_SPAWN_POINTS.length)];
  const colorIndex = state.opponents.length + state.tick;

  const opponent = createSnake(
    state.nextSnakeId,
    spawn.x,
    spawn.y,
    spawn.direction,
    false,
    colorIndex,
  );

  return {
    opponent,
    nextSnakeId: state.nextSnakeId + 1,
  };
}

export function createInitialGameState(): GameState {
  const player = createSnake(PLAYER_ID, 25, 25, "RIGHT", true, 0);
  const { opponents, nextId } = createOpponents(1);
  const pellets = spawnPellets(player, opponents, PELLET_COUNT, GRID_SIZE);

  return {
    gridSize: GRID_SIZE,
    player,
    opponents,
    pellets,
    status: "playing",
    message: "Arrow keys turn your head — trap rivals for their points",
    tick: 0,
    nextSnakeId: nextId,
  };
}

export function setPlayerTurn(state: GameState, turn: Turn): GameState {
  if (state.status !== "playing" || !state.player.alive) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      pendingTurn: turn,
    },
  };
}

function advanceSnakeBody(
  snake: Snake,
  nextHead: Position,
  grows: boolean,
): Position[] {
  const newBody = [nextHead, ...snake.body];

  if (!grows) {
    newBody.pop();
  }

  return newBody;
}

function getOtherBodies(
  snakes: Snake[],
  snakeId: number,
): Position[][] {
  return snakes
    .filter((snake) => snake.id !== snakeId && snake.alive)
    .map((snake) => snake.body);
}

export function advanceGame(state: GameState): GameState {
  if (state.status !== "playing") {
    return state;
  }

  const tick = state.tick + 1;
  let opponents = assignAiTurns(state);
  let player = applyPendingTurn(state.player);
  opponents = opponents.map(applyPendingTurn);

  const allSnakes = [player, ...opponents];
  const aliveSnakes = allSnakes.filter((snake) => snake.alive);

  const nextHeads = new Map<number, Position>();
  for (const snake of aliveSnakes) {
    nextHeads.set(snake.id, getNextHead(snake.body[0], snake.direction));
  }

  const deadIds = resolveHeadToHead(aliveSnakes, nextHeads);
  let playerEndReason: EndReason = null;

  for (const snake of aliveSnakes) {
    if (deadIds.has(snake.id)) {
      if (snake.isPlayer) {
        playerEndReason = "head-to-head";
      }
      continue;
    }

    const head = nextHeads.get(snake.id)!;
    const otherBodies = getOtherBodies(aliveSnakes, snake.id);
    const endReason = detectCollision(head, snake.body, otherBodies, state.gridSize);

    if (endReason) {
      deadIds.add(snake.id);
      if (snake.isPlayer) {
        playerEndReason = endReason;
      }
    }
  }

  let pellets = [...state.pellets];
  let scoreGain = 0;
  let nextSnakeId = state.nextSnakeId;
  const deadOpponents: Snake[] = [];

  for (const opponent of opponents) {
    if (!opponent.alive) {
      continue;
    }

    if (!deadIds.has(opponent.id)) {
      continue;
    }

    const head = nextHeads.get(opponent.id)!;
    deadOpponents.push(opponent);

    if (player.alive && diedOnPlayerBody(head, player.body)) {
      scoreGain += opponent.score;
    } else if (player.alive) {
      scoreGain += Math.max(2, Math.floor(opponent.score / 2));
    }

    for (const segment of opponent.body) {
      pellets.push(segment);
    }
  }

  const playerDead = deadIds.has(player.id);
  opponents = opponents.map((opponent) =>
    deadIds.has(opponent.id) ? { ...opponent, alive: false } : opponent,
  );

  if (!playerDead) {
    const nextHead = nextHeads.get(player.id)!;
    const pelletIndex = pellets.findIndex((pellet) =>
      positionsEqual(pellet, nextHead),
    );
    const eatsPellet = pelletIndex >= 0;

    if (eatsPellet) {
      pellets = pellets.filter((_, index) => index !== pelletIndex);
      scoreGain += 1;
    }

    player = {
      ...player,
      body: advanceSnakeBody(player, nextHead, eatsPellet),
      score: player.score + scoreGain,
    };
  } else {
    player = { ...player, alive: false };
  }

  opponents = opponents.map((opponent) => {
    if (!opponent.alive || deadIds.has(opponent.id)) {
      return opponent;
    }

    const nextHead = nextHeads.get(opponent.id)!;
    const pelletIndex = pellets.findIndex((pellet) =>
      positionsEqual(pellet, nextHead),
    );
    const eatsPellet = pelletIndex >= 0;

    if (eatsPellet) {
      pellets = pellets.filter((_, index) => index !== pelletIndex);
    }

    return {
      ...opponent,
      body: advanceSnakeBody(opponent, nextHead, eatsPellet),
      score: eatsPellet ? opponent.score + 1 : opponent.score,
    };
  });

  for (let i = 0; i < deadOpponents.length; i += 1) {
    const replacement = spawnReplacementOpponent({
      ...state,
      opponents,
      nextSnakeId,
    });
    opponents = [...opponents, replacement.opponent];
    nextSnakeId = replacement.nextSnakeId;
  }

  while (pellets.length < PELLET_COUNT) {
    pellets = [...pellets, spawnPellet(player, opponents, pellets, state.gridSize)];
  }

  if (playerDead) {
    const reasonText =
      playerEndReason === "wall"
        ? "Hit the arena wall!"
        : playerEndReason === "self"
          ? "You ran into yourself!"
          : playerEndReason === "snake"
            ? "You crashed into a rival!"
            : playerEndReason === "head-to-head"
              ? "Head-to-head crash!"
              : "You crashed!";

    return {
      ...state,
      player,
      opponents,
      pellets,
      tick,
      nextSnakeId,
      status: "ended",
      message: `Game over — Score: ${player.score}. ${reasonText}`,
    };
  }

  return {
    ...state,
    player,
    opponents,
    pellets,
    tick,
    nextSnakeId,
    message: "Trap rivals against your body to steal their points",
  };
}
