import { DIRECTION_ORDER } from "@/lib/game/constants";
import type { Direction, Position, Turn } from "@/types/game";

export function turnLeft(direction: Direction): Direction {
  const index = DIRECTION_ORDER.indexOf(direction);
  return DIRECTION_ORDER[(index - 1 + DIRECTION_ORDER.length) % DIRECTION_ORDER.length];
}

export function turnRight(direction: Direction): Direction {
  const index = DIRECTION_ORDER.indexOf(direction);
  return DIRECTION_ORDER[(index + 1) % DIRECTION_ORDER.length];
}

export function applyTurn(direction: Direction, turn: Turn): Direction {
  return turn === "left" ? turnLeft(direction) : turnRight(direction);
}

export function directionDelta(direction: Direction): Position {
  switch (direction) {
    case "UP":
      return { x: 0, y: -1 };
    case "DOWN":
      return { x: 0, y: 1 };
    case "LEFT":
      return { x: -1, y: 0 };
    case "RIGHT":
      return { x: 1, y: 0 };
    case "UP_LEFT":
      return { x: -1, y: -1 };
    case "UP_RIGHT":
      return { x: 1, y: -1 };
    case "DOWN_LEFT":
      return { x: -1, y: 1 };
    case "DOWN_RIGHT":
      return { x: 1, y: 1 };
  }
}

export function getNextHead(head: Position, direction: Direction): Position {
  const delta = directionDelta(direction);
  return { x: head.x + delta.x, y: head.y + delta.y };
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function positionKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function isOutOfBounds(pos: Position, gridSize: number): boolean {
  return pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize;
}
