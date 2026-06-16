import {
  BODY_COLLISION_DIST,
  SEGMENT_RADIUS,
  TURN_RATE,
} from "@/lib/game/constants";
import type { GameState, Snake } from "@/types/game";
import {
  angleDifference,
  distance,
  getNextHead,
  isOutOfBounds,
  isTooClose,
  normalizeAngle,
  steerTowardAngle,
} from "@/lib/game/motion";

const AI_TARGET_MIN_TICKS = 50;
const AI_TARGET_MAX_TICKS = 90;
const WALL_LOOKAHEAD = 140;

function collisionRadius(snake: Snake): number {
  return snake.sizeScale * SEGMENT_RADIUS * (BODY_COLLISION_DIST / SEGMENT_RADIUS);
}

function findBestPelletTarget(
  head: { x: number; y: number },
  angle: number,
  pellets: { x: number; y: number }[],
): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bestScore = Infinity;

  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);

  for (const pellet of pellets) {
    const dx = pellet.x - head.x;
    const dy = pellet.y - head.y;
    const pelletDistance = Math.hypot(dx, dy);
    if (pelletDistance < 1) {
      continue;
    }

    const dot = (dx * forwardX + dy * forwardY) / pelletDistance;
    const forwardBias = dot < 0 ? pelletDistance * 1.8 : 0;
    const score = pelletDistance + forwardBias;

    if (score < bestScore) {
      bestScore = score;
      best = pellet;
    }
  }

  return best;
}

function isBlocked(
  pos: { x: number; y: number },
  worldSize: number,
  blocked: { x: number; y: number }[],
  snake: Snake,
): boolean {
  if (isOutOfBounds(pos, worldSize, snake.sizeScale * SEGMENT_RADIUS)) {
    return true;
  }

  return isTooClose(pos, blocked, collisionRadius(snake));
}

function scoreDirection(
  head: { x: number; y: number },
  angle: number,
  speed: number,
  worldSize: number,
  blocked: { x: number; y: number }[],
  snake: Snake,
): number {
  const sampleDistance = speed * 3;
  let score = 0;

  for (let step = 1; step <= 3; step += 1) {
    const sample = getNextHead(head, angle, sampleDistance * step);
    if (isBlocked(sample, worldSize, blocked, snake)) {
      score -= 40 * step;
    } else {
      score += 12 * step;
    }
  }

  const center = worldSize / 2;
  const toCenter = Math.atan2(center - head.y, center - head.x);
  score += Math.cos(angleDifference(angle, toCenter)) * 8;

  return score;
}

function pickOpenAngle(
  snake: Snake,
  state: GameState,
  blocked: { x: number; y: number }[],
): number {
  const head = snake.body[0];
  const candidates = [
    snake.angle,
    snake.angle - TURN_RATE * 2,
    snake.angle + TURN_RATE * 2,
    snake.angle - TURN_RATE * 4,
    snake.angle + TURN_RATE * 4,
    snake.angle - TURN_RATE * 6,
    snake.angle + TURN_RATE * 6,
    snake.angle + Math.PI,
  ];

  let bestAngle = snake.angle;
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    const score = scoreDirection(
      head,
      candidate,
      snake.speed,
      state.worldSize,
      blocked,
      snake,
    );
    if (score > bestScore) {
      bestScore = score;
      bestAngle = candidate;
    }
  }

  return normalizeAngle(bestAngle);
}

function needsNewTarget(snake: Snake, tick: number): boolean {
  return tick >= snake.aiTargetUntilTick;
}

function pickWanderTarget(
  snake: Snake,
  state: GameState,
  blocked: { x: number; y: number }[],
): number {
  const head = snake.body[0];
  const pellet = findBestPelletTarget(head, snake.angle, state.pellets);

  if (pellet && distance(head, pellet) < 520) {
    return Math.atan2(pellet.y - head.y, pellet.x - head.x);
  }

  return pickOpenAngle(snake, state, blocked);
}

function avoidWalls(
  snake: Snake,
  state: GameState,
  targetAngle: number,
): number {
  const head = snake.body[0];
  const margin = snake.sizeScale * SEGMENT_RADIUS + 24;
  const lookahead = getNextHead(head, snake.angle, WALL_LOOKAHEAD);

  const nearLeft = head.x < margin * 2;
  const nearRight = head.x > state.worldSize - margin * 2;
  const nearTop = head.y < margin * 2;
  const nearBottom = head.y > state.worldSize - margin * 2;

  if (!nearLeft && !nearRight && !nearTop && !nearBottom) {
    return targetAngle;
  }

  if (isOutOfBounds(lookahead, state.worldSize, snake.sizeScale * SEGMENT_RADIUS)) {
    return pickOpenAngle(snake, state, []);
  }

  const center = state.worldSize / 2;
  const toCenter = Math.atan2(center - head.y, center - head.x);

  if (nearLeft && Math.cos(snake.angle) < 0) {
    return toCenter;
  }

  if (nearRight && Math.cos(snake.angle) > 0) {
    return toCenter;
  }

  if (nearTop && Math.sin(snake.angle) < 0) {
    return toCenter;
  }

  if (nearBottom && Math.sin(snake.angle) > 0) {
    return toCenter;
  }

  return targetAngle;
}

function buildSharedBlockedSegments(state: GameState): { x: number; y: number }[] {
  const blocked: { x: number; y: number }[] = [];
  const allSnakes = [state.player, ...state.opponents];
  if (state.player2) {
    allSnakes.push(state.player2);
  }

  for (const snake of allSnakes) {
    if (!snake.alive) {
      continue;
    }

    const tail = snake.body[snake.body.length - 1];
    for (const segment of snake.body) {
      if (segment.x === tail.x && segment.y === tail.y) {
        continue;
      }
      blocked.push(segment);
    }
  }

  return blocked;
}

function updateAiTarget(
  snake: Snake,
  state: GameState,
  blocked: { x: number; y: number }[],
  tick: number,
): Snake {
  let targetAngle = snake.aiTargetAngle;
  let targetUntilTick = snake.aiTargetUntilTick;

  const forward = getNextHead(snake.body[0], snake.angle, snake.speed * 2);
  const blockedAhead = isBlocked(
    forward,
    state.worldSize,
    blocked,
    snake,
  );

  if (needsNewTarget(snake, tick) || blockedAhead) {
    targetAngle = pickWanderTarget(snake, state, blocked);
    const span =
      AI_TARGET_MIN_TICKS +
      Math.floor(Math.random() * (AI_TARGET_MAX_TICKS - AI_TARGET_MIN_TICKS));
    targetUntilTick = tick + span;
  }

  targetAngle = avoidWalls(snake, state, targetAngle);

  return {
    ...snake,
    aiTargetAngle: normalizeAngle(targetAngle),
    aiTargetUntilTick: targetUntilTick,
  };
}

export function assignAiTurns(
  state: GameState,
  movingOpponentIds: Set<number>,
): Snake[] {
  const sharedBlocked = buildSharedBlockedSegments(state);
  const tick = state.tick;

  return state.opponents.map((opponent) => {
    if (!opponent.alive || !movingOpponentIds.has(opponent.id)) {
      return opponent;
    }

    const blocked = sharedBlocked.filter(
      (segment) =>
        !opponent.body.some(
          (bodySegment) =>
            bodySegment.x === segment.x && bodySegment.y === segment.y,
        ),
    );

    const withTarget = updateAiTarget(opponent, state, blocked, tick);

    return {
      ...withTarget,
      angle: steerTowardAngle(
        withTarget.angle,
        withTarget.aiTargetAngle,
        TURN_RATE,
      ),
    };
  });
}
