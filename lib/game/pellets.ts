import { PELLET_SPAWN_CLEARANCE } from "@/lib/game/constants";
import { isTooClose } from "@/lib/game/motion";
import type { Position } from "@/types/game";

const MAX_SPAWN_ATTEMPTS = 64;

export function collectOccupiedPoints(
  snakeBodies: Position[][],
  pellets: Position[],
): Position[] {
  const occupied: Position[] = [...pellets];

  for (const body of snakeBodies) {
    occupied.push(...body);
  }

  return occupied;
}

export function spawnPelletFast(
  occupied: Position[],
  worldSize: number,
): Position {
  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
    const margin = PELLET_SPAWN_CLEARANCE;
    const x = margin + Math.random() * (worldSize - margin * 2);
    const y = margin + Math.random() * (worldSize - margin * 2);
    const candidate = { x, y };

    if (!isTooClose(candidate, occupied, PELLET_SPAWN_CLEARANCE)) {
      occupied.push(candidate);
      return candidate;
    }
  }

  const fallback = {
    x: worldSize / 2,
    y: worldSize / 2,
  };
  occupied.push(fallback);
  return fallback;
}

export function spawnPelletsFast(
  occupied: Position[],
  worldSize: number,
  count: number,
): Position[] {
  const pellets: Position[] = [];

  for (let i = 0; i < count; i += 1) {
    pellets.push(spawnPelletFast(occupied, worldSize));
  }

  return pellets;
}
