import type { Direction, SnakeColor, Turn } from "@/types/game";

export const GRID_SIZE = 50;
export const TICK_MS = 75;
export const INITIAL_SNAKE_LENGTH = 8;
export const PELLET_COUNT = 45;
export const AI_SNAKE_COUNT = 6;
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
export const PELLET_GLOW = "rgba(253, 224, 71, 0.6)";
export const BACKGROUND_COLOR = "#1a1033";
export const BACKGROUND_ACCENT = "#2d1b4e";
export const GRID_LINE_COLOR = "rgba(255, 255, 255, 0.03)";

export const AI_DIRECTIONS: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

export const TURN_KEYS: Record<string, Turn> = {
  ArrowLeft: "left",
  ArrowRight: "right",
};
