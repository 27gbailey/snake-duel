import {
  BODY_COLLISION_DIST,
  SEGMENT_RADIUS,
  TURN_RATE,
} from "@/lib/game/constants";
import type { GameState, Position, Snake } from "@/types/game";
import {
  angleDifference,
  distance,
  getNextHead,
  isOutOfBounds,
  isTooClose,
  normalizeAngle,
  steerTowardAngle,
} from "@/lib/game/motion";

const AI_TARGET_MIN_TICKS = 40;
const AI_TARGET_MAX_TICKS = 75;
const AI_HUNT_TARGET_MIN_TICKS = 22;
const AI_HUNT_TARGET_MAX_TICKS = 45;
const WALL_LOOKAHEAD = 140;
const HUNT_RANGE = 820;
const HUNT_PLAYER_BONUS = 140;
const HUNT_BODY_SAMPLE_STEP = 3;

function collisionRadius(snake: Snake): number {
  return snake.sizeScale * SEGMENT_RADIUS * (BODY_COLLISION_DIST / SEGMENT_RADIUS);
}

function getOtherSnakes(state: GameState, selfId: number): Snake[] {
  const snakes: Snake[] = [state.player];

  if (state.player2) {
    snakes.push(state.player2);
  }

  for (const opponent of state.opponents) {
    if (opponent.id !== selfId && opponent.alive) {
      snakes.push(opponent);
    }
  }

  return snakes.filter((snake) => snake.alive);
}

type HuntTarget = {
  x: number;
  y: number;
  score: number;
};

function scoreHuntPoint(
  hunter: Snake,
  target: Snake,
  head: Position,
  point: Position,
  kind: "intercept" | "flank" | "body",
): number {
  const dist = distance(head, point);
  if (dist > HUNT_RANGE) {
    return -Infinity;
  }

  let score = HUNT_RANGE - dist;

  if (target.isPlayer) {
    score += HUNT_PLAYER_BONUS;
  }

  const lengthDelta = hunter.body.length - target.body.length;
  score += Math.max(-25, lengthDelta * 6);

  const targetHead = target.body[0];
  const toPoint = Math.atan2(point.y - head.y, point.x - head.x);
  const cutAlignment = Math.abs(angleDifference(target.angle, toPoint));

  if (kind === "flank" || kind === "body") {
    score += 55;
    if (cutAlignment > 0.45 && cutAlignment < 2.4) {
      score += 30;
    }
  }

  if (kind === "intercept") {
    score += 25;
    if (lengthDelta >= 0) {
      score += 20;
    }
  }

  if (kind === "body") {
    score += 35;
  }

  for (let i = 1; i < hunter.body.length; i += 1) {
    const segment = hunter.body[i];
    if (distance(point, segment) < collisionRadius(hunter) * 1.2) {
      score -= 20;
      break;
    }
  }

  return score;
}

function getHuntCandidates(
  hunter: Snake,
  target: Snake,
  head: Position,
): HuntTarget[] {
  const targetHead = target.body[0];
  const dist = distance(head, targetHead);

  if (dist > HUNT_RANGE) {
    return [];
  }

  const candidates: HuntTarget[] = [];
  const leadTime = Math.min(14, dist / Math.max(target.speed, 1));
  const intercept = {
    x: targetHead.x + Math.cos(target.angle) * target.speed * leadTime,
    y: targetHead.y + Math.sin(target.angle) * target.speed * leadTime,
  };

  candidates.push({
    x: intercept.x,
    y: intercept.y,
    score: scoreHuntPoint(hunter, target, head, intercept, "intercept"),
  });

  const flankDistance = 75 + hunter.sizeScale * 12;
  for (const sign of [-1, 1]) {
    const flankAngle = target.angle + sign * (Math.PI / 2);
    const flankPoint = {
      x: targetHead.x + Math.cos(flankAngle) * flankDistance,
      y: targetHead.y + Math.sin(flankAngle) * flankDistance,
    };
    candidates.push({
      x: flankPoint.x,
      y: flankPoint.y,
      score: scoreHuntPoint(hunter, target, head, flankPoint, "flank"),
    });
  }

  for (let i = 1; i < target.body.length; i += HUNT_BODY_SAMPLE_STEP) {
    const segment = target.body[i];
    candidates.push({
      x: segment.x,
      y: segment.y,
      score: scoreHuntPoint(hunter, target, head, segment, "body"),
    });
  }

  return candidates;
}

function findBestHuntTarget(
  snake: Snake,
  state: GameState,
): HuntTarget | null {
  const head = snake.body[0];
  let best: HuntTarget | null = null;

  for (const target of getOtherSnakes(state, snake.id)) {
    for (const candidate of getHuntCandidates(snake, target, head)) {
      if (candidate.score < 120) {
        continue;
      }

      if (!best || candidate.score > best.score) {
        best = candidate;
      }
    }
  }

  return best;
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
): { angle: number; hunting: boolean } {
  const head = snake.body[0];
  const huntTarget = findBestHuntTarget(snake, state);

  if (huntTarget) {
    return {
      angle: Math.atan2(huntTarget.y - head.y, huntTarget.x - head.x),
      hunting: true,
    };
  }

  const pellet = findBestPelletTarget(head, snake.angle, state.pellets);

  if (pellet && distance(head, pellet) < 520) {
    return {
      angle: Math.atan2(pellet.y - head.y, pellet.x - head.x),
      hunting: false,
    };
  }

  return {
    angle: pickOpenAngle(snake, state, blocked),
    hunting: false,
  };
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
    const pick = pickWanderTarget(snake, state, blocked);
    targetAngle = pick.angle;

    const minTicks = pick.hunting ? AI_HUNT_TARGET_MIN_TICKS : AI_TARGET_MIN_TICKS;
    const maxTicks = pick.hunting ? AI_HUNT_TARGET_MAX_TICKS : AI_TARGET_MAX_TICKS;
    const span =
      minTicks + Math.floor(Math.random() * (maxTicks - minTicks));
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
