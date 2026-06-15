import {
  BACKGROUND_ACCENT,
  BACKGROUND_COLOR,
  GRID_LINE_COLOR,
  GRID_SIZE,
  PELLET_COLOR,
  PELLET_GLOW,
  PLAYER_COLOR,
} from "@/lib/game/constants";
import type { GameState, Snake } from "@/types/game";

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellSize: number,
): void {
  const width = state.gridSize * cellSize;
  const height = state.gridSize * cellSize;

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    cellSize * 4,
    width / 2,
    height / 2,
    width * 0.75,
  );
  gradient.addColorStop(0, BACKGROUND_ACCENT);
  gradient.addColorStop(1, BACKGROUND_COLOR);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawGrid(ctx, state.gridSize, cellSize);

  for (const pellet of state.pellets) {
    drawPellet(ctx, pellet, cellSize);
  }

  for (const opponent of state.opponents) {
    if (opponent.alive) {
      drawSnake(ctx, opponent, cellSize);
    }
  }

  drawSnake(ctx, state.player, cellSize, true);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number,
): void {
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridSize; i += 5) {
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

function drawPellet(
  ctx: CanvasRenderingContext2D,
  pellet: { x: number; y: number },
  cellSize: number,
): void {
  const padding = cellSize * 0.28;
  const x = pellet.x * cellSize + padding;
  const y = pellet.y * cellSize + padding;
  const size = cellSize - padding * 2;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.fillStyle = PELLET_GLOW;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PELLET_COLOR;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  cellSize: number,
  isPlayer = false,
): void {
  const colors = snake.color;
  const padding = cellSize * 0.1;

  snake.body.forEach((segment, index) => {
    const x = segment.x * cellSize + padding;
    const y = segment.y * cellSize + padding;
    const size = cellSize - padding * 2;
    const isHead = index === 0;
    const t = snake.body.length <= 1 ? 1 : index / (snake.body.length - 1);

    if (isHead && snake.alive) {
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = cellSize * 0.45;
    } else {
      ctx.shadowBlur = 0;
    }

    const bodyColor = blendColor(colors.body, colors.head, 1 - t * 0.35);
    ctx.fillStyle = isHead ? colors.head : bodyColor;

    const radius = isHead ? size * 0.42 : size * 0.34;

    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (isHead && isPlayer && snake.alive) {
      ctx.strokeStyle = PLAYER_COLOR.head;
      ctx.lineWidth = Math.max(1, cellSize * 0.06);
      ctx.stroke();
    }
  });
}

function blendColor(from: string, to: string, amount: number): string {
  const parse = (hex: string) => {
    const value = hex.replace("#", "");
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  };

  const a = parse(from);
  const b = parse(to);
  const mix = (channel: "r" | "g" | "b") =>
    Math.round(a[channel] + (b[channel] - a[channel]) * amount);

  return `rgb(${mix("r")}, ${mix("g")}, ${mix("b")})`;
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
