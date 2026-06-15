import type { Direction, SnakeColor, Turn } from "@/types/game";

export const GRID_SIZE = 120;
export const VIEWPORT_CELLS = 26;
export const TICK_MS = 100;
export const MAX_TICKS_PER_FRAME = 2;
export const MAX_FRAME_DELTA_MS = 50;
export const INITIAL_SNAKE_LENGTH = 16;
export const PELLET_TARGET = 200;
export const PELLET_MIN = 160;
export const PELLET_REFILL_BATCH = 15;
export const AI_SNAKE_COUNT = 4;
/** Opponents move 9 out of every 10 player ticks (~10% slower). */
export const OPPONENT_MOVE_STEP = 9;
export const OPPONENT_MOVE_THRESHOLD = 10;
export const PLAYER_ID = 0;

export const PLAYER_COLOR: SnakeColor = {
  head: "#4ade80",
  body: "#22c55e",
  glow: "rgba(74, 222, 128, 0.55)",
};

export const AI_COLORS: SnakeColor[] = [
  { head: "#f472b6", body: "#ec4899", glow: "rgba(244, 114, 182, 0.5)" },
  { head: "#60a5fa", body: "#3b82f6", glow: "rgba(96, 165, 250, 0.5)" },
  { head: "#fbbf24", body: "#f59e0b", glow: "rgba(251, 191, 36, 0.5)" },
  { head: "#a78bfa", body: "#8b5cf6", glow: "rgba(167, 139, 250, 0.5)" },
  { head: "#fb7185", body: "#f43f5e", glow: "rgba(251, 113, 133, 0.5)" },
  { head: "#2dd4bf", body: "#14b8a6", glow: "rgba(45, 212, 191, 0.5)" },
  { head: "#f97316", body: "#ea580c", glow: "rgba(249, 115, 22, 0.5)" },
  { head: "#c084fc", body: "#a855f7", glow: "rgba(192, 132, 252, 0.5)" },
];

export const PELLET_COLOR = "#fde047";
export const BACKGROUND_COLOR = "#1a1033";
export const BACKGROUND_ACCENT = "#2d1b4e";
export const GRID_LINE_COLOR = "rgba(255, 255, 255, 0.04)";

export const DIRECTION_ORDER: Direction[] = [
  "UP",
  "UP_RIGHT",
  "RIGHT",
  "DOWN_RIGHT",
  "DOWN",
  "DOWN_LEFT",
  "LEFT",
  "UP_LEFT",
];

export const AI_DIRECTIONS: Direction[] = DIRECTION_ORDER;

export const TURN_KEYS: Record<string, Turn> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

export const BUILD_LABEL =
  process.env.NEXT_PUBLIC_BUILD_ID?.slice(0, 7) ?? "local";

export const ARENA_VERSION = "large-arena-v7";
