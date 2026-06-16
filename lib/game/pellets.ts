import { PELLET_SPAWN_CLEARANCE } from "@/lib/game/constants";
import { distance, isTooClose } from "@/lib/game/motion";
import type { Position } from "@/types/game";

const MAX_SPAWN_ATTEMPTS = 64;
const DEATH_PELLET_MIN_SPREAD = 280;
const DEATH_PELLET_SPREAD_FACTOR = 3.2;

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

export function spawnPelletsFromBody(
  body: Position[],
  pellets: Position[],
  worldSize: number,
): Position[] {
  const margin = PELLET_SPAWN_CLEARANCE;
  const count = body.length;
  const nextPellets = [...pellets];

  if (count === 0) {
    return nextPellets;
  }

  let centerX = 0;
  let centerY = 0;
  let maxSegmentDistance = 0;

  for (const segment of body) {
    centerX += segment.x;
    centerY += segment.y;
  }

  centerX /= count;
  centerY /= count;

  for (const segment of body) {
    maxSegmentDistance = Math.max(
      maxSegmentDistance,
      distance(segment, { x: centerX, y: centerY }),
    );
  }

  const spreadRadius = Math.max(
    DEATH_PELLET_MIN_SPREAD,
    maxSegmentDistance * DEATH_PELLET_SPREAD_FACTOR,
  );

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * spreadRadius;
    const candidate = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };

    nextPellets.push({
      x: Math.max(margin, Math.min(worldSize - margin, candidate.x)),
      y: Math.max(margin, Math.min(worldSize - margin, candidate.y)),
    });
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
