import {
  BACKGROUND_ACCENT,
  BACKGROUND_COLOR,
  GRID_LINE_COLOR,
  PELLET_COLOR,
  PLAYER_COLOR,
} from "@/lib/game/constants";
import type { Camera, GameState, Position, Snake } from "@/types/game";

type ViewportBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function getViewportBounds(
  camera: Camera,
  cellSize: number,
  viewportCells: number,
): ViewportBounds {
  const margin = 1;
  const minX = Math.floor(camera.x / cellSize) - margin;
  const minY = Math.floor(camera.y / cellSize) - margin;
  const maxX = minX + viewportCells + margin * 2;
  const maxY = minY + viewportCells + margin * 2;

  return { minX, minY, maxX, maxY };
}

function isVisible(
  position: Position,
  bounds: ViewportBounds,
  gridSize: number,
): boolean {
  return (
    position.x >= Math.max(0, bounds.minX) &&
    position.x <= Math.min(gridSize - 1, bounds.maxX) &&
    position.y >= Math.max(0, bounds.minY) &&
    position.y <= Math.min(gridSize - 1, bounds.maxY)
  );
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellSize: number,
  camera: Camera,
): void {
  const canvasWidth = state.viewportCells * cellSize;
  const canvasHeight = state.viewportCells * cellSize;
  const bounds = getViewportBounds(camera, cellSize, state.viewportCells);

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawArenaBackground(ctx, state.gridSize, cellSize, bounds);
  drawGrid(ctx, state.gridSize, cellSize, bounds);

  for (const pellet of state.pellets) {
    if (isVisible(pellet, bounds, state.gridSize)) {
      drawPellet(ctx, pellet, cellSize);
    }
  }

  for (const opponent of state.opponents) {
    if (opponent.alive) {
      drawSnake(ctx, opponent, cellSize, bounds, state.gridSize);
    }
  }

  drawSnake(ctx, state.player, cellSize, bounds, state.gridSize, true);

  ctx.restore();
}

function drawArenaBackground(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number,
  bounds: ViewportBounds,
): void {
  const worldWidth = gridSize * cellSize;
  const worldHeight = gridSize * cellSize;
  const x = Math.max(0, bounds.minX) * cellSize;
  const y = Math.max(0, bounds.minY) * cellSize;
  const width = Math.min(gridSize, bounds.maxX + 1) * cellSize - x;
  const height = Math.min(gridSize, bounds.maxY + 1) * cellSize - y;

  ctx.fillStyle = BACKGROUND_ACCENT;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = Math.max(2, cellSize * 0.06);
  ctx.strokeRect(0, 0, worldWidth, worldHeight);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number,
  bounds: ViewportBounds,
): void {
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 1;

  const startX = Math.max(0, bounds.minX);
  const startY = Math.max(0, bounds.minY);
  const endX = Math.min(gridSize, bounds.maxX + 1);
  const endY = Math.min(gridSize, bounds.maxY + 1);

  for (let x = startX; x <= endX; x += 10) {
    const pos = x * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, startY * cellSize);
    ctx.lineTo(pos, endY * cellSize);
    ctx.stroke();
  }

  for (let y = startY; y <= endY; y += 10) {
    const pos = y * cellSize;
    ctx.beginPath();
    ctx.moveTo(startX * cellSize, pos);
    ctx.lineTo(endX * cellSize, pos);
    ctx.stroke();
  }
}

function drawPellet(
  ctx: CanvasRenderingContext2D,
  pellet: Position,
  cellSize: number,
): void {
  const padding = cellSize * 0.32;
  const x = pellet.x * cellSize + padding;
  const y = pellet.y * cellSize + padding;
  const size = cellSize - padding * 2;

  ctx.fillStyle = PELLET_COLOR;
  ctx.fillRect(x, y, size, size);
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  cellSize: number,
  bounds: ViewportBounds,
  gridSize: number,
  isPlayer = false,
): void {
  const colors = snake.color;
  const padding = cellSize * 0.12;
  const bodyColor = colors.body;

  for (let index = snake.body.length - 1; index >= 0; index -= 1) {
    const segment = snake.body[index];

    if (!isVisible(segment, bounds, gridSize)) {
      continue;
    }

    const x = segment.x * cellSize + padding;
    const y = segment.y * cellSize + padding;
    const size = cellSize - padding * 2;
    const isHead = index === 0;

    ctx.fillStyle = isHead ? colors.head : bodyColor;
    ctx.fillRect(x, y, size, size);

    if (isHead && isPlayer && snake.alive) {
      ctx.strokeStyle = PLAYER_COLOR.head;
      ctx.lineWidth = Math.max(1, cellSize * 0.05);
      ctx.strokeRect(x, y, size, size);
    }
  }
}

export function getCellSize(
  containerWidth: number,
  containerHeight: number,
  viewportCells: number,
): number {
  const maxSize = Math.min(containerWidth, containerHeight);
  return Math.floor(maxSize / viewportCells);
}

export function getCanvasSize(
  cellSize: number,
  viewportCells: number,
): { width: number; height: number } {
  return {
    width: viewportCells * cellSize,
    height: viewportCells * cellSize,
  };
}
