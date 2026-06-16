import {
  BACKGROUND_ACCENT,
  BACKGROUND_COLOR,
  PELLET_COLOR,
  PELLET_RADIUS,
  PLAYER2_COLOR,
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

type DrawOptions = {
  viewportSize?: number;
  humanPlayerIds?: number[];
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

function getHumanStrokeColor(snake: Snake): string | null {
  if (!snake.isPlayer || !snake.alive) {
    return null;
  }

  if (snake.playerSlot === 1) {
    return PLAYER2_COLOR.head;
  }

  return PLAYER_COLOR.head;
}

export function drawGameWorld(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scale: number,
  camera: Camera,
  options: DrawOptions = {},
): void {
  const viewportSize = options.viewportSize ?? state.viewportSize;
  const bounds = getViewportBounds(camera, viewportSize);
  const humanIds = options.humanPlayerIds ?? [];

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
      drawSnake(ctx, opponent, scale, bounds, humanIds.includes(opponent.id));
    }
  }

  drawSnake(ctx, state.player, scale, bounds, humanIds.includes(state.player.id));

  if (state.player2?.alive) {
    drawSnake(
      ctx,
      state.player2,
      scale,
      bounds,
      humanIds.includes(state.player2.id),
    );
  }

  ctx.restore();
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scale: number,
  camera: Camera,
  options: DrawOptions = {},
): void {
  const viewportSize = options.viewportSize ?? state.viewportSize;
  const canvasWidth = viewportSize * scale;
  const canvasHeight = viewportSize * scale;

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawGameWorld(ctx, state, scale, camera, options);
}

export function drawSplitTwoPlayerView(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  camera1: Camera,
  camera2: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const halfWidth = canvasWidth / 2;
  const panelScale = Math.min(halfWidth, canvasHeight) / state.viewportSize;
  const panelWorldSize = state.viewportSize * panelScale;
  const offsetX = (halfWidth - panelWorldSize) / 2;
  const offsetY = (canvasHeight - panelWorldSize) / 2;
  const humanIds = [state.player.id, state.player2?.id ?? -999];

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, halfWidth, canvasHeight);
  ctx.clip();
  ctx.translate(offsetX, offsetY);
  drawGameWorld(ctx, state, panelScale, camera1, { humanPlayerIds: humanIds });
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "600 11px system-ui, sans-serif";
  ctx.fillText("P1 · A/D", 10, 18);
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(halfWidth, 0);
  ctx.lineTo(halfWidth, canvasHeight);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.rect(halfWidth, 0, halfWidth, canvasHeight);
  ctx.clip();
  ctx.translate(halfWidth + offsetX, offsetY);
  drawGameWorld(ctx, state, panelScale, camera2, { humanPlayerIds: humanIds });
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "600 11px system-ui, sans-serif";
  ctx.fillText("P2 · Arrows", halfWidth + 10, 18);
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
  highlight = false,
): void {
  const colors = snake.color;
  const radius = SEGMENT_RADIUS * snake.sizeScale * scale;
  const strokeColor = highlight ? getHumanStrokeColor(snake) : null;

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

    if (isHead && strokeColor) {
      ctx.strokeStyle = strokeColor;
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
