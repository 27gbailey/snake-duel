import { PELLET_SPAWN_CLEARANCE, SEGMENT_SPACING } from "@/lib/game/constants";
import { distance, isTooClose } from "@/lib/game/motion";
import type { Position } from "@/types/game";

const MAX_SPAWN_ATTEMPTS = 64;
/** Pellets cluster near the corpse instead of scattering across the arena. */
const DEATH_PELLET_JITTER = 16;
const DEATH_PELLET_EXTRA_SPREAD = 28;

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

  const clusterRadius =
    maxSegmentDistance + DEATH_PELLET_EXTRA_SPREAD + SEGMENT_SPACING;

  for (let i = 0; i < count; i += 1) {
    const segment = body[i];
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * clusterRadius;
    const candidate = {
      x: segment.x + Math.cos(angle) * radius * 0.35 + (Math.random() - 0.5) * DEATH_PELLET_JITTER,
      y: segment.y + Math.sin(angle) * radius * 0.35 + (Math.random() - 0.5) * DEATH_PELLET_JITTER,
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
