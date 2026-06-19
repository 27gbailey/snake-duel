import { PELLET_SPAWN_CLEARANCE } from "@/lib/game/constants";
import { isTooClose } from "@/lib/game/motion";
import type { Position } from "@/types/game";

const MAX_SPAWN_ATTEMPTS = 64;
const DEATH_PELLET_JITTER = 14;
const DEATH_PELLET_MIN_SEPARATION = PELLET_SPAWN_CLEARANCE * 0.9;
const MAX_PELLETS = 650;

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

function isInsideArena(point: Position, worldSize: number): boolean {
  const margin = PELLET_SPAWN_CLEARANCE;
  return (
    point.x >= margin &&
    point.x <= worldSize - margin &&
    point.y >= margin &&
    point.y <= worldSize - margin
  );
}

function tryPlacePelletNear(
  origin: Position,
  occupied: Position[],
  worldSize: number,
): Position | null {
  const margin = PELLET_SPAWN_CLEARANCE;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const spread = DEATH_PELLET_JITTER * (attempt + 1) / 4;
    const candidate = {
      x: origin.x + (Math.random() - 0.5) * spread * 2,
      y: origin.y + (Math.random() - 0.5) * spread * 2,
    };

    if (!isInsideArena(candidate, worldSize)) {
      continue;
    }

    if (!isTooClose(candidate, occupied, DEATH_PELLET_MIN_SEPARATION)) {
      occupied.push(candidate);
      return candidate;
    }
  }

  return null;
}

export function spawnPelletsFromBody(
  body: Position[],
  pellets: Position[],
  worldSize: number,
): Position[] {
  if (body.length === 0) {
    return pellets;
  }

  let nextPellets = [...pellets];
  const occupied = [...nextPellets];

  for (const segment of body) {
    if (nextPellets.length >= MAX_PELLETS) {
      break;
    }

    const placed = tryPlacePelletNear(segment, occupied, worldSize);
    if (placed) {
      nextPellets = [...nextPellets, placed];
    }
  }

  return nextPellets;
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

  const margin = PELLET_SPAWN_CLEARANCE;
  const fallback = {
    x: margin + Math.random() * (worldSize - margin * 2),
    y: margin + Math.random() * (worldSize - margin * 2),
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

export function capPelletCount(pellets: Position[], max = MAX_PELLETS): Position[] {
  if (pellets.length <= max) {
    return pellets;
  }

  return pellets.slice(pellets.length - max);
}
