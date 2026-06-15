import type { Camera, GameState } from "@/types/game";

export function getCameraTarget(
  state: GameState,
  scale: number,
): Camera {
  const canvasSize = state.viewportSize * scale;
  const worldSize = state.worldSize * scale;
  const head = state.player.body[0];

  let x = head.x * scale - canvasSize / 2;
  let y = head.y * scale - canvasSize / 2;

  if (worldSize > canvasSize) {
    x = Math.max(0, Math.min(x, worldSize - canvasSize));
    y = Math.max(0, Math.min(y, worldSize - canvasSize));
  } else {
    x = 0;
    y = 0;
  }

  return {
    x: x / scale,
    y: y / scale,
  };
}

export function smoothCamera(
  current: Camera,
  target: Camera,
  factor = 0.35,
): Camera {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 180) {
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
