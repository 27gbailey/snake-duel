import { distance, isTooClose } from "@/lib/game/motion";
import type { GameState, Position, Snake } from "@/types/game";

const HUMAN_BODY_CLEARANCE = 140;
const VIEWPORT_EXCLUSION_PADDING = 80;

export function getHumanViewportExclusionRadius(state: GameState): number {
  return state.viewportSize * 0.52 + VIEWPORT_EXCLUSION_PADDING;
}

export function isNearHumanPlayers(
  position: Position,
  state: GameState,
): boolean {
  const viewportRadius = getHumanViewportExclusionRadius(state);
  const humans: Snake[] = [state.player];

  if (state.player2) {
    humans.push(state.player2);
  }

  for (const human of humans) {
    if (!human.alive) {
      continue;
    }

    const head = human.body[0];
    if (distance(position, head) < viewportRadius) {
      return true;
    }

    for (const segment of human.body) {
      if (distance(position, segment) < HUMAN_BODY_CLEARANCE) {
        return true;
      }
    }
  }

  return false;
}

export function isSafeRespawnPosition(
  position: Position,
  state: GameState,
  occupied: Position[],
): boolean {
  if (isNearHumanPlayers(position, state)) {
    return false;
  }

  return !isTooClose(position, occupied, HUMAN_BODY_CLEARANCE);
}
