import {
  BODY_COLLISION_DIST,
  OPPONENT_SPEED,
  TURN_RATE,
} from "@/lib/game/constants";
import type { GameState, Snake, Turn } from "@/types/game";
import {
  angleDifference,
  applyDiscreteTurn,
  distance,
  getNextHead,
  isOutOfBounds,
  isTooClose,
} from "@/lib/game/motion";

function findNearestPellet(
  head: { x: number; y: number },
  pellets: { x: number; y: number }[],
): { x: number; y: number } | null {
  let nearest: { x: number; y: number } | null = null;
  let nearestDistance = Infinity;

  for (const pellet of pellets) {
    const pelletDistance = distance(head, pellet);
    if (pelletDistance < nearestDistance) {
      nearestDistance = pelletDistance;
      nearest = pellet;
    }
  }

  return nearest;
}

function isBlocked(
  pos: { x: number; y: number },
  worldSize: number,
  blocked: { x: number; y: number }[],
): boolean {
  if (isOutOfBounds(pos, worldSize)) {
    return true;
  }

  return isTooClose(pos, blocked, BODY_COLLISION_DIST);
}

function pickAiTurn(
  snake: Snake,
  state: GameState,
  blocked: { x: number; y: number }[],
): Turn | null {
  const head = snake.body[0];
  const forward = getNextHead(head, snake.angle, OPPONENT_SPEED);
  const leftAngle = snake.angle - TURN_RATE;
  const rightAngle = snake.angle + TURN_RATE;
  const leftHead = getNextHead(head, leftAngle, OPPONENT_SPEED);
  const rightHead = getNextHead(head, rightAngle, OPPONENT_SPEED);

  const canForward = !isBlocked(forward, state.worldSize, blocked);
  const canLeft = !isBlocked(leftHead, state.worldSize, blocked);
  const canRight = !isBlocked(rightHead, state.worldSize, blocked);

  const nearestPellet = findNearestPellet(head, state.pellets);
  if (nearestPellet) {
    const desiredAngle = Math.atan2(
      nearestPellet.y - head.y,
      nearestPellet.x - head.x,
    );
    const diff = angleDifference(snake.angle, desiredAngle);

    if (Math.abs(diff) > 0.08) {
      if (diff < 0 && canLeft) {
        return "left";
      }

      if (diff > 0 && canRight) {
        return "right";
      }
    }
  }

  if (canForward && Math.random() > 0.2) {
    return null;
  }

  if (canLeft && canRight) {
    return Math.random() < 0.5 ? "left" : "right";
  }

  if (canLeft) {
    return "left";
  }

  if (canRight) {
    return "right";
  }

  if (canForward) {
    return null;
  }

  return Math.random() < 0.5 ? "left" : "right";
}

function buildSharedBlockedSegments(state: GameState): { x: number; y: number }[] {
  const blocked: { x: number; y: number }[] = [];
  const allSnakes = [state.player, ...state.opponents];

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

export function assignAiTurns(
  state: GameState,
  movingOpponentIds: Set<number>,
): Snake[] {
  const sharedBlocked = buildSharedBlockedSegments(state);

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

    const turn = pickAiTurn(opponent, state, blocked);
    if (!turn) {
      return opponent;
    }

    return {
      ...opponent,
      angle: applyDiscreteTurn(opponent.angle, turn, TURN_RATE),
    };
  });
}
