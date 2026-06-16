import { VIEW_MERGE_END, VIEW_MERGE_START } from "@/lib/game/constants";
import { distance } from "@/lib/game/motion";
import type { Camera, GameState, Position } from "@/types/game";

function clampCamera(
  x: number,
  y: number,
  worldSize: number,
  viewportSize: number,
): Camera {
  const maxX = Math.max(0, worldSize - viewportSize);
  const maxY = Math.max(0, worldSize - viewportSize);

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
  };
}

export function getCameraTargetForHead(
  head: Position,
  worldSize: number,
  viewportSize: number,
): Camera {
  return clampCamera(
    head.x - viewportSize / 2,
    head.y - viewportSize / 2,
    worldSize,
    viewportSize,
  );
}

export function getCameraTarget(
  state: GameState,
  _scale: number,
): Camera {
  return getCameraTargetForHead(
    state.player.body[0],
    state.worldSize,
    state.viewportSize,
  );
}

export function getMergedTwoPlayerCamera(
  state: GameState,
  viewportSize: number,
): Camera {
  const head1 = state.player.body[0];
  const head2 = state.player2?.body[0] ?? head1;
  const midX = (head1.x + head2.x) / 2;
  const midY = (head1.y + head2.y) / 2;
  const span = distance(head1, head2) + viewportSize * 0.35;
  const effectiveViewport = Math.max(viewportSize, Math.min(span, viewportSize * 1.85));

  return clampCamera(
    midX - effectiveViewport / 2,
    midY - effectiveViewport / 2,
    state.worldSize,
    effectiveViewport,
  );
}

export function getViewMergeFactor(state: GameState): number {
  if (state.mode !== "two-player" || !state.player2) {
    return 1;
  }

  const dist = distance(state.player.body[0], state.player2.body[0]);

  if (dist <= VIEW_MERGE_START) {
    return 1;
  }

  if (dist >= VIEW_MERGE_END) {
    return 0;
  }

  return 1 - (dist - VIEW_MERGE_START) / (VIEW_MERGE_END - VIEW_MERGE_START);
}

export function smoothCamera(
  current: Camera,
  target: Camera,
  factor = 0.35,
): Camera {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 180) {
    return target;
  }

  return {
    x: current.x + dx * factor,
    y: current.y + dy * factor,
  };
}

export function getCamera(state: GameState, scale: number): Camera {
  return getCameraTarget(state, scale);
}
