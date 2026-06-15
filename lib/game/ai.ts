import type { Direction, GameState, Snake, Turn } from "@/types/game";
import {
  getNextHead,
  isOutOfBounds,
  positionKey,
  turnLeft,
  turnRight,
} from "@/lib/game/direction";

function isBlocked(
  pos: { x: number; y: number },
  gridSize: number,
  blocked: Set<string>,
): boolean {
  return isOutOfBounds(pos, gridSize) || blocked.has(positionKey(pos));
}

function pickAiTurn(snake: Snake, state: GameState, blocked: Set<string>): Turn | null {
  const head = snake.body[0];
  const forward = getNextHead(head, snake.direction);
  const leftHead = getNextHead(head, turnLeft(snake.direction));
  const rightHead = getNextHead(head, turnRight(snake.direction));

  const canForward = !isBlocked(forward, state.gridSize, blocked);
  const canLeft = !isBlocked(leftHead, state.gridSize, blocked);
  const canRight = !isBlocked(rightHead, state.gridSize, blocked);

  if (canForward && Math.random() > 0.12) {
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

export function buildBlockedCells(state: GameState, excludeSnakeId: number): Set<string> {
  const blocked = new Set<string>();

  const allSnakes = [state.player, ...state.opponents];

  for (const snake of allSnakes) {
    if (!snake.alive || snake.id === excludeSnakeId) {
      continue;
    }

    const segments = snake.body.slice(0, -1);
    for (const segment of segments) {
      blocked.add(positionKey(segment));
    }
  }

  for (const pellet of state.pellets) {
    blocked.add(positionKey(pellet));
  }

  return blocked;
}

export function assignAiTurns(state: GameState): Snake[] {
  return state.opponents.map((opponent) => {
    if (!opponent.alive) {
      return opponent;
    }

    const blocked = buildBlockedCells(state, opponent.id);
    const turn = pickAiTurn(opponent, state, blocked);

    return {
      ...opponent,
      pendingTurn: turn,
    };
  });
}

export function applyPendingTurn(snake: Snake): Snake {
  if (!snake.pendingTurn) {
    return snake;
  }

  const direction: Direction =
    snake.pendingTurn === "left"
      ? turnLeft(snake.direction)
      : turnRight(snake.direction);

  return {
    ...snake,
    direction,
    pendingTurn: null,
  };
}
