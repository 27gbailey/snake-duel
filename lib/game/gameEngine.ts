import {
  AI_COLORS,
  AI_SNAKE_COUNT,
  GRID_SIZE,
  INITIAL_SNAKE_LENGTH,
  OPPONENT_MOVE_STEP,
  OPPONENT_MOVE_THRESHOLD,
  PELLET_MIN,
  PELLET_REFILL_BATCH,
  PELLET_TARGET,
  PLAYER_COLOR,
  PLAYER_ID,
  VIEWPORT_CELLS,
} from "@/lib/game/constants";
import {
  assignAiTurns,
  applyPendingTurn,
} from "@/lib/game/ai";
import {
  detectCollision,
  findHeadToHeadKiller,
  findKillerByBodyHit,
  getHeadToHeadGroups,
  resolveHeadToHead,
} from "@/lib/game/collision";
import {
  directionDelta,
  getNextHead,
  positionsEqual,
} from "@/lib/game/direction";
import {
  buildOccupiedSet,
  spawnPelletFast,
  spawnPelletsFast,
} from "@/lib/game/pellets";
import { absorbVictimBody } from "@/lib/game/snake";
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
  const forward = directionDelta(direction);
  const tailStep = { x: -forward.x, y: -forward.y };

  for (let i = 1; i < length; i += 1) {
    body.push({
      x: startX + tailStep.x * i,
      y: startY + tailStep.y * i,
    });
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
    moveAccumulator: 0,
  };
}

function opponentWillMoveThisTick(snake: Snake): boolean {
  return snake.moveAccumulator + OPPONENT_MOVE_STEP >= OPPONENT_MOVE_THRESHOLD;
}

function tickOpponentMoveAccumulator(snake: Snake): Snake {
  if (!snake.alive) {
    return snake;
  }

  let moveAccumulator = snake.moveAccumulator + OPPONENT_MOVE_STEP;
  if (moveAccumulator >= OPPONENT_MOVE_THRESHOLD) {
    moveAccumulator -= OPPONENT_MOVE_THRESHOLD;
  }

  return { ...snake, moveAccumulator };
}

function getAiSpawnPoints(gridSize: number): Array<{
  x: number;
  y: number;
  direction: Direction;
}> {
  const center = Math.floor(gridSize / 2);
  const margin = Math.floor(gridSize * 0.1);

  return [
    { x: margin, y: margin, direction: "RIGHT" },
    { x: gridSize - 1 - margin, y: margin, direction: "LEFT" },
    { x: margin, y: gridSize - 1 - margin, direction: "RIGHT" },
    { x: gridSize - 1 - margin, y: gridSize - 1 - margin, direction: "LEFT" },
    { x: center, y: margin, direction: "DOWN" },
    { x: center, y: gridSize - 1 - margin, direction: "UP" },
    { x: margin, y: center, direction: "RIGHT" },
    { x: gridSize - 1 - margin, y: center, direction: "LEFT" },
    { x: center - 16, y: center - 16, direction: "DOWN_RIGHT" },
    { x: center + 16, y: center + 16, direction: "UP_LEFT" },
  ];
}

function createOpponents(
  gridSize: number,
  nextSnakeId: number,
): { opponents: Snake[]; nextId: number } {
  const spawnPoints = getAiSpawnPoints(gridSize);
  const opponents: Snake[] = [];
  let nextId = nextSnakeId;

  for (let i = 0; i < AI_SNAKE_COUNT; i += 1) {
    const spawn = spawnPoints[i % spawnPoints.length];
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
  const spawnPoints = getAiSpawnPoints(state.gridSize);
  const spawn =
    spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
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

function collectSnakeBodies(
  player: Snake,
  opponents: Snake[],
): Position[][] {
  const bodies = [player.body];

  for (const opponent of opponents) {
    if (opponent.alive) {
      bodies.push(opponent.body);
    }
  }

  return bodies;
}

function tryEatPellet(
  head: Position,
  pellets: Position[],
): { pellets: Position[]; ate: boolean } {
  const index = pellets.findIndex((pellet) => positionsEqual(pellet, head));

  if (index < 0) {
    return { pellets, ate: false };
  }

  const nextPellets = pellets.slice();
  nextPellets.splice(index, 1);
  return { pellets: nextPellets, ate: true };
}

export function createInitialGameState(): GameState {
  const center = Math.floor(GRID_SIZE / 2);
  const player = createSnake(PLAYER_ID, center, center, "RIGHT", true, 0);
  const { opponents, nextId } = createOpponents(GRID_SIZE, 1);
  const occupied = buildOccupiedSet(
    collectSnakeBodies(player, opponents),
    [],
  );
  const pellets = spawnPelletsFast(occupied, GRID_SIZE, PELLET_TARGET);

  return {
    gridSize: GRID_SIZE,
    viewportCells: VIEWPORT_CELLS,
    player,
    opponents,
    pellets,
    status: "playing",
    message: "Arrow keys turn — trap rivals to absorb their length",
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

function applyAbsorption(
  player: Snake,
  opponents: Snake[],
  killerId: number,
  victim: Snake,
): { player: Snake; opponents: Snake[] } {
  if (killerId === player.id) {
    return {
      player: absorbVictimBody(player, victim),
      opponents,
    };
  }

  return {
    player,
    opponents: opponents.map((opponent) =>
      opponent.id === killerId
        ? absorbVictimBody(opponent, victim)
        : opponent,
    ),
  };
}

function replenishPellets(
  player: Snake,
  opponents: Snake[],
  pellets: Position[],
  gridSize: number,
  ateThisTick: boolean,
  tick: number,
): Position[] {
  let nextPellets = pellets;

  if (ateThisTick) {
    for (let i = 0; i < 2; i += 1) {
      const occupied = buildOccupiedSet(
        collectSnakeBodies(player, opponents),
        nextPellets,
      );
      nextPellets = [
        ...nextPellets,
        spawnPelletFast(occupied, gridSize),
      ];
    }
  }

  if (tick % 12 === 0 && nextPellets.length < PELLET_TARGET) {
    const pelletsNeeded = PELLET_TARGET - nextPellets.length;
    const spawnCount = Math.min(PELLET_REFILL_BATCH, pelletsNeeded);

    for (let i = 0; i < spawnCount; i += 1) {
      const occupied = buildOccupiedSet(
        collectSnakeBodies(player, opponents),
        nextPellets,
      );
      nextPellets = [
        ...nextPellets,
        spawnPelletFast(occupied, gridSize),
      ];
    }
  }

  if (tick % 30 === 0 && nextPellets.length < PELLET_MIN) {
    const occupied = buildOccupiedSet(
      collectSnakeBodies(player, opponents),
      nextPellets,
    );
    nextPellets = [
      ...nextPellets,
      spawnPelletFast(occupied, gridSize),
    ];
  }

  return nextPellets;
}

export function advanceGame(state: GameState): GameState {
  if (state.status !== "playing") {
    return state;
  }

  const tick = state.tick + 1;
  const movingOpponentIds = new Set<number>();

  for (const opponent of state.opponents) {
    if (opponent.alive && opponentWillMoveThisTick(opponent)) {
      movingOpponentIds.add(opponent.id);
    }
  }

  let opponents = assignAiTurns(state, movingOpponentIds);
  let player = applyPendingTurn(state.player);
  opponents = opponents.map((opponent) => {
    if (!opponent.alive || !movingOpponentIds.has(opponent.id)) {
      return opponent;
    }

    return applyPendingTurn(opponent);
  });

  const allSnakes = [player, ...opponents];
  const aliveSnakes = allSnakes.filter((snake) => snake.alive);

  const nextHeads = new Map<number, Position>();
  for (const snake of aliveSnakes) {
    if (snake.isPlayer || movingOpponentIds.has(snake.id)) {
      nextHeads.set(snake.id, getNextHead(snake.body[0], snake.direction));
    } else {
      nextHeads.set(snake.id, snake.body[0]);
    }
  }

  const deadIds = resolveHeadToHead(aliveSnakes, nextHeads);
  const headToHeadGroups = getHeadToHeadGroups(aliveSnakes, nextHeads);
  const killerMap = new Map<number, number>();
  let playerEndReason: EndReason = null;

  for (const group of headToHeadGroups.values()) {
    if (group.length < 2) {
      continue;
    }

    for (const snake of group) {
      if (!deadIds.has(snake.id)) {
        continue;
      }

      const killer = findHeadToHeadKiller(snake, group, deadIds);
      if (killer) {
        killerMap.set(snake.id, killer.id);
      }
    }
  }

  for (const snake of aliveSnakes) {
    if (deadIds.has(snake.id)) {
      if (snake.isPlayer && !playerEndReason) {
        playerEndReason = "head-to-head";
      }
      continue;
    }

    const head = nextHeads.get(snake.id)!;
    const otherBodies = getOtherBodies(aliveSnakes, snake.id);
    const endReason = detectCollision(head, otherBodies, state.gridSize);

    if (endReason) {
      deadIds.add(snake.id);
      if (snake.isPlayer) {
        playerEndReason = endReason;
      }

      const killer = findKillerByBodyHit(
        head,
        aliveSnakes,
        deadIds,
        snake.id,
      );
      if (killer) {
        killerMap.set(snake.id, killer.id);
      }
    }
  }

  const victims = aliveSnakes.filter((snake) => deadIds.has(snake.id));
  const playerDead = deadIds.has(player.id);

  opponents = opponents.map((opponent) =>
    deadIds.has(opponent.id) ? { ...opponent, alive: false } : opponent,
  );

  let pellets = state.pellets;
  let nextSnakeId = state.nextSnakeId;
  const deadOpponents: Snake[] = [];
  let anyPelletEaten = false;

  if (!playerDead) {
    const nextHead = nextHeads.get(player.id)!;
    const eatResult = tryEatPellet(nextHead, pellets);
    pellets = eatResult.pellets;
    anyPelletEaten = eatResult.ate;

    player = {
      ...player,
      body: advanceSnakeBody(player, nextHead, eatResult.ate),
      score: eatResult.ate ? player.score + 1 : player.score,
    };
  } else {
    player = { ...player, alive: false };
  }

  opponents = opponents.map((opponent) => {
    if (!opponent.alive || deadIds.has(opponent.id)) {
      if (deadIds.has(opponent.id)) {
        deadOpponents.push(opponent);
      }
      return opponent;
    }

    const opponentAfterTick = tickOpponentMoveAccumulator(opponent);

    if (!movingOpponentIds.has(opponent.id)) {
      return opponentAfterTick;
    }

    const nextHead = nextHeads.get(opponent.id)!;
    const eatResult = tryEatPellet(nextHead, pellets);
    pellets = eatResult.pellets;
    if (eatResult.ate) {
      anyPelletEaten = true;
    }

    return {
      ...opponentAfterTick,
      body: advanceSnakeBody(opponentAfterTick, nextHead, eatResult.ate),
      score: eatResult.ate ? opponent.score + 1 : opponent.score,
    };
  });

  for (const victim of victims) {
    const killerId = killerMap.get(victim.id);
    if (!killerId) {
      continue;
    }

    const result = applyAbsorption(player, opponents, killerId, victim);
    player = result.player;
    opponents = result.opponents;
  }

  opponents = opponents.filter((opponent) => opponent.alive);

  for (let i = 0; i < deadOpponents.length; i += 1) {
    const replacement = spawnReplacementOpponent({
      ...state,
      opponents,
      nextSnakeId,
    });
    opponents = [...opponents, replacement.opponent];
    nextSnakeId = replacement.nextSnakeId;
  }

  pellets = replenishPellets(
    player,
    opponents,
    pellets,
    state.gridSize,
    anyPelletEaten,
    tick,
  );

  if (playerDead) {
    const reasonText =
      playerEndReason === "wall"
        ? "Hit the arena wall!"
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
    message: "Trap rivals to absorb their full length onto your tail",
  };
}
