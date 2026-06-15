import type { Direction, GameState, Snake, Turn } from "@/types/game";
import {
  getNextHead,
  isOutOfBounds,
  positionKey,
  positionsEqual,
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

function pickAiTurn(
  snake: Snake,
  state: GameState,
  blocked: Set<string>,
): Turn | null {
  const head = snake.body[0];
  const forward = getNextHead(head, snake.direction);
  const leftHead = getNextHead(head, turnLeft(snake.direction));
  const rightHead = getNextHead(head, turnRight(snake.direction));

  const canForward = !isBlocked(forward, state.gridSize, blocked);
  const canLeft = !isBlocked(leftHead, state.gridSize, blocked);
  const canRight = !isBlocked(rightHead, state.gridSize, blocked);

  if (canForward && Math.random() > 0.18) {
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

function buildSharedBlockedCells(state: GameState): Set<string> {
  const blocked = new Set<string>();
  const allSnakes = [state.player, ...state.opponents];

  for (const snake of allSnakes) {
    if (!snake.alive) {
      continue;
    }

    const tail = snake.body[snake.body.length - 1];
    for (const segment of snake.body) {
      if (positionsEqual(segment, tail)) {
        continue;
      }
      blocked.add(positionKey(segment));
    }
  }

  return blocked;
}

export function assignAiTurns(state: GameState): Snake[] {
  const sharedBlocked = buildSharedBlockedCells(state);

  return state.opponents.map((opponent) => {
    if (!opponent.alive) {
      return opponent;
    }

    const blocked = new Set(sharedBlocked);
    const tail = opponent.body[opponent.body.length - 1];
    blocked.delete(positionKey(tail));

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
