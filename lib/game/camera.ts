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
  factor = 0.35,
): Camera {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);

  // Snap when far behind so the snake is never off-screen.
  if (distance > 120) {
    return target;
  }

  return {
    x: current.x + dx * factor,
    y: current.y + dy * factor,
  };
}

export function getCamera(state: GameState, cellSize: number): Camera {
  return getCameraTarget(state, cellSize);
}
