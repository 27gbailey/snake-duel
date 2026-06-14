import type { Direction, Position } from "@/types/game";

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  return OPPOSITE[current] === next;
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

export function flipDirection(direction: Direction): Direction {
  switch (direction) {
    case "UP":
      return "DOWN";
    case "DOWN":
      return "UP";
    case "LEFT":
      return "RIGHT";
    case "RIGHT":
      return "LEFT";
  }
}

export function getPerpendicularDirections(direction: Direction): [Direction, Direction] {
  switch (direction) {
    case "UP":
    case "DOWN":
      return ["LEFT", "RIGHT"];
    case "LEFT":
    case "RIGHT":
      return ["UP", "DOWN"];
  }
}

export function isOutOfBounds(pos: Position, gridSize: number): boolean {
  return pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize;
}
