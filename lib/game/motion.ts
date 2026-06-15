import { SEGMENT_RADIUS } from "@/lib/game/constants";
import type { Position, Turn } from "@/types/game";

export function distance(a: Position, b: Position): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalizeAngle(angle: number): number {
  let next = angle;

  while (next > Math.PI) {
    next -= Math.PI * 2;
  }

  while (next < -Math.PI) {
    next += Math.PI * 2;
  }

  return next;
}

export function angleDifference(from: number, to: number): number {
  return normalizeAngle(to - from);
}

export function applyTurnInput(
  angle: number,
  turnLeft: boolean,
  turnRight: boolean,
  turnRate: number,
): number {
  if (turnLeft && !turnRight) {
    return angle - turnRate;
  }

  if (turnRight && !turnLeft) {
    return angle + turnRate;
  }

  return angle;
}

export function applyDiscreteTurn(angle: number, turn: Turn, turnRate: number): number {
  return turn === "left" ? angle - turnRate : angle + turnRate;
}

export function getNextHead(
  head: Position,
  angle: number,
  speed: number,
): Position {
  return {
    x: head.x + Math.cos(angle) * speed,
    y: head.y + Math.sin(angle) * speed,
  };
}

export function isOutOfBounds(
  pos: Position,
  worldSize: number,
  margin = SEGMENT_RADIUS,
): boolean {
  return (
    pos.x < margin ||
    pos.x > worldSize - margin ||
    pos.y < margin ||
    pos.y > worldSize - margin
  );
}

export function isTooClose(
  pos: Position,
  points: Position[],
  minDistance: number,
): boolean {
  for (const point of points) {
    if (distance(pos, point) < minDistance) {
      return true;
    }
  }

  return false;
}

export function flattenPoints(points: Position[][]): Position[] {
  const flat: Position[] = [];

  for (const group of points) {
    flat.push(...group);
  }

  return flat;
}
