import type { Camera, GameState } from "@/types/game";

export function getCameraTarget(
  state: GameState,
  cellSize: number,
): Camera {
  const canvasSize = state.viewportCells * cellSize;
  const worldSize = state.gridSize * cellSize;
  const head = state.player.body[0];
  const headCenterX = head.x * cellSize + cellSize / 2;
  const headCenterY = head.y * cellSize + cellSize / 2;

  let x = headCenterX - canvasSize / 2;
  let y = headCenterY - canvasSize / 2;

  if (worldSize > canvasSize) {
    x = Math.max(0, Math.min(x, worldSize - canvasSize));
    y = Math.max(0, Math.min(y, worldSize - canvasSize));
  } else {
    x = 0;
    y = 0;
  }

  return { x, y };
}

export function smoothCamera(
  current: Camera,
  target: Camera,
  factor = 0.28,
): Camera {
  return {
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  };
}

// Legacy alias used by tests or imports
export function getCamera(state: GameState, cellSize: number): Camera {
  return getCameraTarget(state, cellSize);
}
