import type { AttackKind, Direction, EnemyKind } from "@/types/game";

export const GRID_SIZE = 50;
export const TICK_MS = 110;
export const COUNTDOWN_SECONDS = 3;

export const ENEMY_COUNT = 4;
export const ENEMY_KINDS = ["hunter", "patroller", "striker", "warden"] as const;
export const ENEMY_MIN_SNAKE_DISTANCE = 10;
export const ENEMY_MIN_SEPARATION = 9;
export const ENEMY_SEPARATION_RADIUS = 4;

export const PLAYER_COLORS: Record<1 | 2, { head: string; body: string; glow: string }> = {
  1: {
    head: "#22c55e",
    body: "#16a34a",
    glow: "rgba(34, 197, 94, 0.4)",
  },
  2: {
    head: "#3b82f6",
    body: "#2563eb",
    glow: "rgba(59, 130, 246, 0.4)",
  },
};

export const FOOD_COLOR = "#f97316";
export const GRID_LINE_COLOR = "rgba(255, 255, 255, 0.04)";
export const BACKGROUND_COLOR = "#0f172a";

export type EnemySpawnConfig = {
  kind: EnemyKind;
  direction: Direction;
};

export const ENEMY_DIRECTIONS: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

export const ENEMY_STATS: Record<
  EnemyKind,
  { moveInterval: number; attackInterval: number; color: string; glow: string }
> = {
  hunter: {
    moveInterval: 1,
    attackInterval: 14,
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.45)",
  },
  patroller: {
    moveInterval: 1,
    attackInterval: 18,
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.45)",
  },
  striker: {
    moveInterval: 1,
    attackInterval: 16,
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.45)",
  },
  warden: {
    moveInterval: 2,
    attackInterval: 22,
    color: "#dc2626",
    glow: "rgba(220, 38, 38, 0.5)",
  },
};

export const BULLET_COLORS: Record<AttackKind, string> = {
  shot: "#fbbf24",
  spread: "#fb923c",
  burst: "#f472b6",
  beam: "#f87171",
};

export const BULLET_SPEED = 2;
export const BURST_BULLET_SPEED = 3;
export const BEAM_TTL = 4;
export const BEAM_MAX_LENGTH = 5;
export const FOOD_COUNT = 20;
export const ENEMY_EAT_SCORE = 3;

export const PLAYER_1_KEYS: Record<string, "UP" | "DOWN" | "LEFT" | "RIGHT"> = {
  w: "UP",
  W: "UP",
  s: "DOWN",
  S: "DOWN",
  a: "LEFT",
  A: "LEFT",
  d: "RIGHT",
  D: "RIGHT",
};

export const PLAYER_2_KEYS: Record<string, "UP" | "DOWN" | "LEFT" | "RIGHT"> = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
};
