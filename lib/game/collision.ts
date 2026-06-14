import type { EndReason, PlayerId, Position } from "@/types/game";
import { isOutOfBounds, positionsEqual } from "@/lib/game/direction";

export function isSelfCollision(head: Position, body: Position[]): boolean {
  return body.some((segment) => positionsEqual(head, segment));
}

export function isSnakeCollision(
  head: Position,
  otherSnake: Position[],
  includeHead: boolean,
): boolean {
  const segments = includeHead ? otherSnake : otherSnake.slice(1);
  return segments.some((segment) => positionsEqual(head, segment));
}

export function detectCollision(
  head: Position,
  ownBody: Position[],
  otherSnake: Position[],
  gridSize: number,
): EndReason {
  if (isOutOfBounds(head, gridSize)) {
    return "wall";
  }

  if (isSelfCollision(head, ownBody)) {
    return "self";
  }

  if (isSnakeCollision(head, otherSnake, true)) {
    return "snake";
  }

  return null;
}

export function isHeadToHead(
  head1: Position,
  head2: Position,
): boolean {
  return positionsEqual(head1, head2);
}

export function getAlivePlayers(
  alive: Record<PlayerId, boolean>,
): PlayerId[] {
  return ([1, 2] as PlayerId[]).filter((id) => alive[id]);
}
