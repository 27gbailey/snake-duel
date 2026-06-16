import {
  AI_COLORS,
  AI_SIZE_PROFILES,
  AI_SNAKE_COUNT,
  INITIAL_SNAKE_LENGTH,
  OPPONENT_MOVE_STEP,
  OPPONENT_MOVE_THRESHOLD,
  PELLET_EAT_DIST,
  PELLET_MIN,
  PELLET_REFILL_BATCH,
  PELLET_TARGET,
  PLAYER2_COLOR,
  PLAYER2_ID,
  PLAYER_COLOR,
  PLAYER_ID,
  PLAYER_SPEED,
  SEGMENT_RADIUS,
  SEGMENT_SPACING,
  TURN_RATE,
  VIEWPORT_SIZE,
  WORLD_SIZE,
  getMaxSnakeLength,
  type AiSizeProfile,
} from "@/lib/game/constants";
import { assignAiTurns } from "@/lib/game/ai";
import {
  detectCollision,
  resolveHeadToHead,
} from "@/lib/game/collision";
import {
  applyTurnInput,
  distance,
  getNextHead,
} from "@/lib/game/motion";
import {
  collectOccupiedPoints,
  spawnPelletFast,
  spawnPelletsFast,
  spawnPelletsFromBody,
} from "@/lib/game/pellets";
import type {
  EndReason,
  GameInputs,
  GameMode,
  GameState,
  PlayerInput,
  Position,
  Snake,
  SnakeColor,
} from "@/types/game";

function createSnakeBody(
  startX: number,
  startY: number,
  angle: number,
  length: number,
): Position[] {
  const body: Position[] = [{ x: startX, y: startY }];

  for (let i = 1; i < length; i += 1) {
    body.push({
      x: startX - Math.cos(angle) * SEGMENT_SPACING * i,
      y: startY - Math.sin(angle) * SEGMENT_SPACING * i,
    });
  }

  return body;
}

function createHumanSnake(
  id: number,
  startX: number,
  startY: number,
  angle: number,
  color: SnakeColor,
  playerSlot: 0 | 1,
): Snake {
  const body = createSnakeBody(startX, startY, angle, INITIAL_SNAKE_LENGTH);

  return {
    id,
    body,
    angle,
    score: body.length,
    alive: true,
    isPlayer: true,
    color,
    moveAccumulator: 0,
    speed: PLAYER_SPEED,
    sizeScale: 1,
    aiTargetAngle: angle,
    aiTargetUntilTick: 0,
    playerSlot,
  };
}

function createAiSnake(
  id: number,
  startX: number,
  startY: number,
  angle: number,
  colorIndex: number,
  profile?: AiSizeProfile,
): Snake {
  const length = profile?.length ?? 36;
  const body = createSnakeBody(startX, startY, angle, length);
  const speed = profile?.speed ?? 8.5;
  const sizeScale = profile?.sizeScale ?? 1;

  return {
    id,
    body,
    angle,
    score: body.length,
    alive: true,
    isPlayer: false,
    color: AI_COLORS[colorIndex % AI_COLORS.length],
    moveAccumulator: 0,
    speed,
    sizeScale,
    aiTargetAngle: angle,
    aiTargetUntilTick: 0,
  };
}

function pickAiProfile(index: number): AiSizeProfile {
  return AI_SIZE_PROFILES[index % AI_SIZE_PROFILES.length];
}

function pickRandomAiProfile(): AiSizeProfile {
  return AI_SIZE_PROFILES[
    Math.floor(Math.random() * AI_SIZE_PROFILES.length)
  ];
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

function getSpawnEdgeMargin(worldSize: number): number {
  const maxLength = getMaxSnakeLength();
  const bodyReach = (maxLength - 1) * SEGMENT_SPACING + SEGMENT_RADIUS * 4;
  return Math.max(worldSize * 0.08, bodyReach);
}

function getAiSpawnPoints(worldSize: number): Array<{
  x: number;
  y: number;
  angle: number;
}> {
  const center = worldSize / 2;
  const margin = getSpawnEdgeMargin(worldSize);
  const ring = worldSize * 0.22;

  const points: Array<{ x: number; y: number; angle: number }> = [
    { x: margin, y: margin, angle: 0 },
    { x: worldSize - margin, y: margin, angle: Math.PI },
    { x: margin, y: worldSize - margin, angle: 0 },
    { x: worldSize - margin, y: worldSize - margin, angle: Math.PI },
    { x: center, y: margin, angle: Math.PI / 2 },
    { x: center, y: worldSize - margin, angle: -Math.PI / 2 },
    { x: margin, y: center, angle: 0 },
    { x: worldSize - margin, y: center, angle: Math.PI },
    { x: center - ring, y: center - ring, angle: Math.PI / 4 },
    { x: center + ring, y: center + ring, angle: -Math.PI * 0.75 },
    { x: center + ring, y: center - ring, angle: Math.PI * 0.75 },
    { x: center - ring, y: center + ring, angle: -Math.PI / 4 },
    { x: center - ring, y: center, angle: 0 },
    { x: center + ring, y: center, angle: Math.PI },
    { x: center, y: center - ring, angle: Math.PI / 2 },
    { x: center, y: center + ring, angle: -Math.PI / 2 },
    { x: center - ring * 0.5, y: margin + ring * 0.3, angle: Math.PI / 2 },
    { x: center + ring * 0.5, y: worldSize - margin - ring * 0.3, angle: -Math.PI / 2 },
  ];

  return points;
}

function createOpponents(
  worldSize: number,
  nextSnakeId: number,
): { opponents: Snake[]; nextId: number } {
  const spawnPoints = getAiSpawnPoints(worldSize);
  const opponents: Snake[] = [];
  let nextId = nextSnakeId;

  for (let i = 0; i < AI_SNAKE_COUNT; i += 1) {
    const spawn = spawnPoints[i % spawnPoints.length];
    opponents.push(
      createAiSnake(
        nextId,
        spawn.x,
        spawn.y,
        spawn.angle,
        i,
        pickAiProfile(i),
      ),
    );
    nextId += 1;
  }

  return { opponents, nextId };
}

function spawnReplacementOpponent(
  state: GameState,
): { opponent: Snake; nextSnakeId: number } {
  const spawnPoints = getAiSpawnPoints(state.worldSize);
  const spawn =
    spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  const colorIndex = state.opponents.length + state.tick;
  const profile = pickRandomAiProfile();

  const opponent = createAiSnake(
    state.nextSnakeId,
    spawn.x,
    spawn.y,
    spawn.angle,
    colorIndex,
    profile,
  );

  return {
    opponent,
    nextSnakeId: state.nextSnakeId + 1,
  };
}

function collectSnakeBodies(
  player: Snake,
  opponents: Snake[],
  player2: Snake | null = null,
): Position[][] {
  const bodies = [player.body];

  if (player2?.alive) {
    bodies.push(player2.body);
  }

  for (const opponent of opponents) {
    if (opponent.alive) {
      bodies.push(opponent.body);
    }
  }

  return bodies;
}

function collectSnakeBodiesFromState(state: GameState): Position[][] {
  return collectSnakeBodies(state.player, state.opponents, state.player2);
}

function applyHumanInput(snake: Snake, input: PlayerInput): Snake {
  return {
    ...snake,
    angle: applyTurnInput(
      snake.angle,
      input.turnLeft,
      input.turnRight,
      TURN_RATE,
    ),
  };
}

function processHumanSnake(
  snake: Snake,
  nextHeads: Map<number, Position>,
  pellets: Position[],
  deadIds: Set<number>,
): { snake: Snake; pellets: Position[]; ate: boolean } {
  if (!snake.alive || deadIds.has(snake.id)) {
    return {
      snake: deadIds.has(snake.id) ? { ...snake, alive: false } : snake,
      pellets,
      ate: false,
    };
  }

  const nextHead = nextHeads.get(snake.id)!;
  const eatResult = tryEatPellet(nextHead, pellets);

  return {
    snake: {
      ...snake,
      body: advanceSnakeBody(snake, nextHead, eatResult.ate),
      score: eatResult.ate ? snake.score + 1 : snake.score,
    },
    pellets: eatResult.pellets,
    ate: eatResult.ate,
  };
}

function tryEatPellet(
  head: Position,
  pellets: Position[],
): { pellets: Position[]; ate: boolean } {
  const index = pellets.findIndex(
    (pellet) => distance(head, pellet) < PELLET_EAT_DIST,
  );

  if (index < 0) {
    return { pellets, ate: false };
  }

  const nextPellets = pellets.slice();
  nextPellets.splice(index, 1);
  return { pellets: nextPellets, ate: true };
}

export function createInitialGameState(mode: GameMode = "single"): GameState {
  const center = WORLD_SIZE / 2;
  const spawnOffset = 280;
  const player = createHumanSnake(
    PLAYER_ID,
    center - spawnOffset,
    center,
    0,
    PLAYER_COLOR,
    0,
  );

  let player2: Snake | null = null;
  let nextSnakeId = 1;

  if (mode === "two-player") {
    player2 = createHumanSnake(
      PLAYER2_ID,
      center + spawnOffset,
      center,
      Math.PI,
      PLAYER2_COLOR,
      1,
    );
    nextSnakeId = 2;
  }

  const { opponents, nextId } = createOpponents(WORLD_SIZE, nextSnakeId);
  const occupied = collectOccupiedPoints(collectSnakeBodiesFromState({
    mode,
    worldSize: WORLD_SIZE,
    viewportSize: VIEWPORT_SIZE,
    player,
    player2,
    opponents,
    pellets: [],
    status: "playing",
    message: "",
    tick: 0,
    nextSnakeId: nextId,
  }), []);
  const pellets = spawnPelletsFast(occupied, WORLD_SIZE, PELLET_TARGET);

  return {
    mode,
    worldSize: WORLD_SIZE,
    viewportSize: VIEWPORT_SIZE,
    player,
    player2,
    opponents,
    pellets,
    status: "playing",
    message:
      mode === "two-player"
        ? "P1: A/D · P2: Arrow keys — views merge when you meet"
        : "Steer freely — dead snakes scatter pellets across the area",
    tick: 0,
    nextSnakeId: nextId,
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

function replenishPellets(
  state: GameState,
  pellets: Position[],
  ateThisTick: boolean,
  tick: number,
): Position[] {
  let nextPellets = pellets;
  const { player, opponents, player2, worldSize } = state;

  if (ateThisTick) {
    for (let i = 0; i < 3; i += 1) {
      const occupied = collectOccupiedPoints(
        collectSnakeBodies(player, opponents, player2),
        nextPellets,
      );
      nextPellets = [
        ...nextPellets,
        spawnPelletFast(occupied, worldSize),
      ];
    }
  }

  if (tick % 10 === 0 && nextPellets.length < PELLET_TARGET) {
    const pelletsNeeded = PELLET_TARGET - nextPellets.length;
    const spawnCount = Math.min(PELLET_REFILL_BATCH, pelletsNeeded);

    for (let i = 0; i < spawnCount; i += 1) {
      const occupied = collectOccupiedPoints(
        collectSnakeBodies(player, opponents, player2),
        nextPellets,
      );
      nextPellets = [
        ...nextPellets,
        spawnPelletFast(occupied, worldSize),
      ];
    }
  }

  if (tick % 24 === 0 && nextPellets.length < PELLET_MIN) {
    const occupied = collectOccupiedPoints(
      collectSnakeBodies(player, opponents, player2),
      nextPellets,
    );
    nextPellets = [
      ...nextPellets,
      spawnPelletFast(occupied, worldSize),
    ];
  }

  return nextPellets;
}

export function advanceGame(
  state: GameState,
  inputs: GameInputs = {
    player1: { turnLeft: false, turnRight: false },
    player2: { turnLeft: false, turnRight: false },
  },
): GameState {
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
  let player = applyHumanInput(state.player, inputs.player1);
  let player2 = state.player2
    ? applyHumanInput(state.player2, inputs.player2)
    : null;

  const allSnakes = [
    player,
    ...(player2 ? [player2] : []),
    ...opponents,
  ];
  const aliveSnakes = allSnakes.filter((snake) => snake.alive);

  const nextHeads = new Map<number, Position>();
  for (const snake of aliveSnakes) {
    if (snake.isPlayer || movingOpponentIds.has(snake.id)) {
      nextHeads.set(
        snake.id,
        getNextHead(snake.body[0], snake.angle, snake.speed),
      );
    } else {
      nextHeads.set(snake.id, snake.body[0]);
    }
  }

  const deadIds = resolveHeadToHead(aliveSnakes, nextHeads);
  const playerEndReasons = new Map<number, EndReason>();

  for (const snake of aliveSnakes) {
    if (deadIds.has(snake.id)) {
      if (snake.isPlayer && !playerEndReasons.has(snake.id)) {
        playerEndReasons.set(snake.id, "head-to-head");
      }
      continue;
    }

    const head = nextHeads.get(snake.id)!;
    const otherBodies = getOtherBodies(aliveSnakes, snake.id);
    const endReason = detectCollision(head, otherBodies, state.worldSize);

    if (endReason) {
      deadIds.add(snake.id);
      if (snake.isPlayer) {
        playerEndReasons.set(snake.id, endReason);
      }
    }
  }

  const victims = aliveSnakes.filter((snake) => deadIds.has(snake.id));
  const playerDead = deadIds.has(player.id);
  const player2Dead = player2 ? deadIds.has(player2.id) : false;

  opponents = opponents.map((opponent) =>
    deadIds.has(opponent.id) ? { ...opponent, alive: false } : opponent,
  );

  let pellets = state.pellets;
  let nextSnakeId = state.nextSnakeId;
  const deadOpponents: Snake[] = [];
  let anyPelletEaten = false;

  const playerResult = processHumanSnake(
    player,
    nextHeads,
    pellets,
    deadIds,
  );
  player = playerResult.snake;
  pellets = playerResult.pellets;
  if (playerResult.ate) {
    anyPelletEaten = true;
  }

  if (player2) {
    const player2Result = processHumanSnake(
      player2,
      nextHeads,
      pellets,
      deadIds,
    );
    player2 = player2Result.snake;
    pellets = player2Result.pellets;
    if (player2Result.ate) {
      anyPelletEaten = true;
    }
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
    pellets = spawnPelletsFromBody(victim.body, pellets, state.worldSize);
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
    { ...state, player, player2, opponents },
    pellets,
    anyPelletEaten,
    tick,
  );

  const gameEnded =
    state.mode === "two-player"
      ? playerDead || player2Dead
      : playerDead;

  if (gameEnded) {
    let message = "";

    if (state.mode === "two-player" && player2) {
      if (playerDead && player2Dead) {
        message = `Draw — P1: ${player.score} · P2: ${player2.score}`;
      } else if (playerDead) {
        message = `Player 2 wins — Score ${player2.score} (P1: ${player.score})`;
      } else {
        message = `Player 1 wins — Score ${player.score} (P2: ${player2.score})`;
      }
    } else {
      const reason = playerEndReasons.get(player.id);
      const reasonText =
        reason === "wall"
          ? "Hit the arena wall!"
          : reason === "snake"
            ? "You crashed into a rival!"
            : reason === "head-to-head"
              ? "Head-to-head crash!"
              : "You crashed!";
      message = `Game over — Score: ${player.score}. ${reasonText}`;
    }

    return {
      ...state,
      player,
      player2,
      opponents,
      pellets,
      tick,
      nextSnakeId,
      status: "ended",
      message,
    };
  }

  return {
    ...state,
    player,
    player2,
    opponents,
    pellets,
    tick,
    nextSnakeId,
    message:
      state.mode === "two-player"
        ? "Split views merge when players meet in the same area"
        : "Trap rivals — their body scatters pellets when they die",
  };
}
