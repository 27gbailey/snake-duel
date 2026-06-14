import {
  BACKGROUND_COLOR,
  BULLET_COLORS,
  ENEMY_STATS,
  FOOD_COLOR,
  GRID_LINE_COLOR,
  GRID_SIZE,
  PLAYER_COLORS,
} from "@/lib/game/constants";
import type { Bullet, Enemy, GameState, PlayerId } from "@/types/game";

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

  for (const fruit of state.food) {
    drawFood(ctx, fruit, cellSize);
  }

  for (const bullet of state.bullets) {
    drawBullet(ctx, bullet, cellSize);
  }

  for (const enemy of state.enemies) {
    drawEnemy(ctx, enemy, cellSize);
  }

  drawSnake(ctx, state.players[1], 1, cellSize);

  if (state.mode === "duel") {
    drawSnake(ctx, state.players[2], 2, cellSize);
  }
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

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  cellSize: number,
): void {
  const stats = ENEMY_STATS[enemy.kind];
  const padding = cellSize * 0.12;
  const x = enemy.position.x * cellSize + padding;
  const y = enemy.position.y * cellSize + padding;
  const size = cellSize - padding * 2;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.shadowColor = stats.glow;
  ctx.shadowBlur = cellSize * 0.35;
  ctx.fillStyle = stats.color;
  ctx.beginPath();

  if (enemy.kind === "patroller") {
    ctx.roundRect(x, y, size, size, size * 0.2);
  } else if (enemy.kind === "striker") {
    ctx.moveTo(centerX, y);
    ctx.lineTo(x + size, centerY);
    ctx.lineTo(centerX, y + size);
    ctx.lineTo(x, centerY);
    ctx.closePath();
  } else if (enemy.kind === "warden") {
    ctx.arc(centerX, centerY, size * 0.46, 0, Math.PI * 2);
  } else {
    ctx.arc(centerX, centerY, size * 0.42, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function drawBullet(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
  cellSize: number,
): void {
  const padding = cellSize * 0.18;
  const x = bullet.position.x * cellSize + padding;
  const y = bullet.position.y * cellSize + padding;
  const size = cellSize - padding * 2;
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const color = BULLET_COLORS[bullet.kind];

  ctx.fillStyle = color;
  ctx.shadowColor = `${color}99`;
  ctx.shadowBlur = cellSize * 0.2;

  if (bullet.kind === "beam") {
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x, y, size, size);
    ctx.globalAlpha = 1;
  } else if (bullet.kind === "burst") {
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(x + size, centerY);
    ctx.lineTo(centerX, y + size);
    ctx.lineTo(x, centerY);
    ctx.closePath();
    ctx.fill();
  } else if (bullet.kind === "spread") {
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.34, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  player: GameState["players"][PlayerId],
  playerId: PlayerId,
  cellSize: number,
): void {
  if (player.snake.length === 0) {
    return;
  }

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
