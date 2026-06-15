import type { Direction, Position, Turn } from "@/types/game";

export function turnLeft(direction: Direction): Direction {
  switch (direction) {
    case "UP":
      return "LEFT";
    case "LEFT":
      return "DOWN";
    case "DOWN":
      return "RIGHT";
    case "RIGHT":
      return "UP";
  }
}

export function turnRight(direction: Direction): Direction {
  switch (direction) {
    case "UP":
      return "RIGHT";
    case "RIGHT":
      return "DOWN";
    case "DOWN":
      return "LEFT";
    case "LEFT":
      return "UP";
  }
}

export function applyTurn(direction: Direction, turn: Turn): Direction {
  return turn === "left" ? turnLeft(direction) : turnRight(direction);
}

export function getNextHead(head: Position, direction: Direction): Position {
  switch (direction) {
    case "UP":
      return { x: head.x, y: head.y - 1 };
    case "DOWN":
      return { x: head.x, y: head.y + 1 };
    case "LEFT":
      return { x: head.x - 1, y: head.y };
    case "RIGHT":
      return { x: head.x + 1, y: head.y };
  }
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
