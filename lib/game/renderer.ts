import {
  BACKGROUND_COLOR,
  FOOD_COLOR,
  GRID_LINE_COLOR,
  GRID_SIZE,
  PLAYER_COLORS,
} from "@/lib/game/constants";
import type { GameState, PlayerId } from "@/types/game";

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellSize: number,
): void {
  const width = state.gridSize * cellSize;
  const height = state.gridSize * cellSize;

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  drawGrid(ctx, state.gridSize, cellSize);
  drawFood(ctx, state.food, cellSize);
  drawSnake(ctx, state.players[1], 1, cellSize);
  drawSnake(ctx, state.players[2], 2, cellSize);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number,
): void {
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridSize; i++) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, gridSize * cellSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(gridSize * cellSize, pos);
    ctx.stroke();
  }
}

function drawFood(
  ctx: CanvasRenderingContext2D,
  food: { x: number; y: number },
  cellSize: number,
): void {
  const padding = cellSize * 0.15;
  const x = food.x * cellSize + padding;
  const y = food.y * cellSize + padding;
  const size = cellSize - padding * 2;

  ctx.fillStyle = FOOD_COLOR;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  player: GameState["players"][PlayerId],
  playerId: PlayerId,
  cellSize: number,
): void {
  const colors = PLAYER_COLORS[playerId];
  const padding = cellSize * 0.08;

  player.snake.forEach((segment, index) => {
    const x = segment.x * cellSize + padding;
    const y = segment.y * cellSize + padding;
    const size = cellSize - padding * 2;
    const isHead = index === 0;

    if (isHead && player.alive) {
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = cellSize * 0.3;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = isHead ? colors.head : colors.body;
    const radius = isHead ? size * 0.35 : size * 0.28;

    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

export function getCellSize(containerWidth: number, containerHeight: number): number {
  const maxSize = Math.min(containerWidth, containerHeight);
  return Math.floor(maxSize / GRID_SIZE);
}

export function getCanvasSize(cellSize: number): { width: number; height: number } {
  return {
    width: GRID_SIZE * cellSize,
    height: GRID_SIZE * cellSize,
  };
}
