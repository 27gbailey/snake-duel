import {
  BACKGROUND_ACCENT,
  BACKGROUND_COLOR,
  PELLET_COLOR,
  PELLET_RADIUS,
  PLAYER_COLOR,
  SEGMENT_RADIUS,
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
  viewportSize: number,
): ViewportBounds {
  const margin = 80;
  return {
    minX: camera.x - margin,
    minY: camera.y - margin,
    maxX: camera.x + viewportSize + margin,
    maxY: camera.y + viewportSize + margin,
  };
}

function isVisible(position: Position, bounds: ViewportBounds): boolean {
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.y >= bounds.minY &&
    position.y <= bounds.maxY
  );
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scale: number,
  camera: Camera,
): void {
  const canvasWidth = state.viewportSize * scale;
  const canvasHeight = state.viewportSize * scale;
  const bounds = getViewportBounds(camera, state.viewportSize);

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(-camera.x * scale, -camera.y * scale);

  drawArenaBackground(ctx, state.worldSize, scale);

  for (const pellet of state.pellets) {
    if (isVisible(pellet, bounds)) {
      drawPellet(ctx, pellet, scale);
    }
  }

  for (const opponent of state.opponents) {
    if (opponent.alive) {
      drawSnake(ctx, opponent, scale, bounds, false);
    }
  }

  drawSnake(ctx, state.player, scale, bounds, true);

  ctx.restore();
}

function drawArenaBackground(
  ctx: CanvasRenderingContext2D,
  worldSize: number,
  scale: number,
): void {
  const worldWidth = worldSize * scale;
  const worldHeight = worldSize * scale;

  ctx.fillStyle = BACKGROUND_ACCENT;
  ctx.fillRect(0, 0, worldWidth, worldHeight);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = Math.max(2, scale * 0.12);
  ctx.strokeRect(0, 0, worldWidth, worldHeight);
}

function drawPellet(
  ctx: CanvasRenderingContext2D,
  pellet: Position,
  scale: number,
): void {
  const radius = PELLET_RADIUS * scale;

  ctx.beginPath();
  ctx.arc(pellet.x * scale, pellet.y * scale, radius, 0, Math.PI * 2);
  ctx.fillStyle = PELLET_COLOR;
  ctx.fill();
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  scale: number,
  bounds: ViewportBounds,
  isPlayer = false,
): void {
  const colors = snake.color;
  const radius = SEGMENT_RADIUS * scale;

  for (let index = snake.body.length - 1; index >= 0; index -= 1) {
    const segment = snake.body[index];

    if (!isVisible(segment, bounds)) {
      continue;
    }

    const x = segment.x * scale;
    const y = segment.y * scale;
    const isHead = index === 0;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHead ? colors.head : colors.body;
    ctx.fill();

    if (isHead && isPlayer && snake.alive) {
      ctx.strokeStyle = PLAYER_COLOR.head;
      ctx.lineWidth = Math.max(1, scale * 0.08);
      ctx.stroke();
    }
  }
}

export function getScale(
  containerWidth: number,
  containerHeight: number,
  viewportSize: number,
): number {
  const maxSize = Math.min(containerWidth, containerHeight);
  return maxSize / viewportSize;
}

export function getCanvasSize(
  scale: number,
  viewportSize: number,
): { width: number; height: number } {
  return {
    width: viewportSize * scale,
    height: viewportSize * scale,
  };
}
