import { positionKey } from "@/lib/game/direction";
import type { Position } from "@/types/game";

const MAX_SPAWN_ATTEMPTS = 48;

export function buildOccupiedSet(
  snakeBodies: Position[][],
  pellets: Position[],
): Set<string> {
  const occupied = new Set<string>();

  for (const body of snakeBodies) {
    for (const segment of body) {
      occupied.add(positionKey(segment));
    }
  }

  for (const pellet of pellets) {
    occupied.add(positionKey(pellet));
  }

  return occupied;
}

export function spawnPelletFast(
  occupied: Set<string>,
  gridSize: number,
): Position {
  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const key = `${x},${y}`;

    if (!occupied.has(key)) {
      occupied.add(key);
      return { x, y };
    }
  }

  return { x: 0, y: 0 };
}

export function spawnPelletsFast(
  occupied: Set<string>,
  gridSize: number,
  count: number,
): Position[] {
  const pellets: Position[] = [];

  for (let i = 0; i < count; i += 1) {
    pellets.push(spawnPelletFast(occupied, gridSize));
  }

  return pellets;
}
