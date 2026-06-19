import type { SnakeColor } from "@/types/game";

export const WORLD_SIZE = 3600;
export const VIEWPORT_SIZE = 840;
export const TICK_MS = 100;
export const MAX_TICKS_PER_FRAME = 2;
export const MAX_FRAME_DELTA_MS = 50;
export const INITIAL_SNAKE_LENGTH = 48;
export const SEGMENT_SPACING = 10;
export const SEGMENT_RADIUS = 7;
export const PLAYER_SPEED = 10.5;
export const TURN_RATE = 0.22;
export const HEAD_COLLISION_DIST = SEGMENT_RADIUS * 1.75;
export const BODY_COLLISION_DIST = SEGMENT_RADIUS * 1.6;
export const PELLET_RADIUS = 5;
export const PELLET_EAT_DIST = 12;
export const PELLET_SPAWN_CLEARANCE = 22;
export const PELLET_TARGET = 500;
export const PELLET_MIN = 400;
export const PELLET_REFILL_BATCH = 25;
export const AI_SNAKE_COUNT = 18;
/** Opponents move 9 out of every 10 player ticks (~10% slower). */
export const OPPONENT_MOVE_STEP = 9;
export const OPPONENT_MOVE_THRESHOLD = 10;
export const PLAYER_ID = 0;
export const PLAYER2_ID = -1;
export const VIEW_MERGE_START = VIEWPORT_SIZE * 0.38;
export const VIEW_MERGE_END = VIEWPORT_SIZE * 0.72;

export type AiSizeProfile = {
  length: number;
  sizeScale: number;
  speed: number;
};

export const AI_SIZE_PROFILES: AiSizeProfile[] = [
  { length: 18, sizeScale: 0.62, speed: 10.4 },
  { length: 28, sizeScale: 0.78, speed: 9.6 },
  { length: 36, sizeScale: 0.88, speed: 9.0 },
  { length: 44, sizeScale: 0.96, speed: 8.6 },
  { length: 52, sizeScale: 1.08, speed: 8.2 },
  { length: 64, sizeScale: 1.22, speed: 7.8 },
  { length: 76, sizeScale: 1.35, speed: 7.2 },
];

export const PLAYER_COLOR: SnakeColor = {
  head: "#4ade80",
  body: "#22c55e",
  glow: "rgba(74, 222, 128, 0.55)",
};

export const PLAYER2_COLOR: SnakeColor = {
  head: "#60a5fa",
  body: "#3b82f6",
  glow: "rgba(96, 165, 250, 0.55)",
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
  { head: "#34d399", body: "#10b981", glow: "rgba(52, 211, 153, 0.5)" },
  { head: "#f87171", body: "#ef4444", glow: "rgba(248, 113, 113, 0.5)" },
  { head: "#38bdf8", body: "#0ea5e9", glow: "rgba(56, 189, 248, 0.5)" },
  { head: "#e879f9", body: "#d946ef", glow: "rgba(232, 121, 249, 0.5)" },
  { head: "#a3e635", body: "#84cc16", glow: "rgba(163, 230, 53, 0.5)" },
  { head: "#fb923c", body: "#f97316", glow: "rgba(251, 146, 60, 0.5)" },
  { head: "#818cf8", body: "#6366f1", glow: "rgba(129, 140, 248, 0.5)" },
  { head: "#f9a8d4", body: "#f472b6", glow: "rgba(249, 168, 212, 0.5)" },
  { head: "#5eead4", body: "#2dd4bf", glow: "rgba(94, 234, 212, 0.5)" },
  { head: "#fcd34d", body: "#fbbf24", glow: "rgba(252, 211, 77, 0.5)" },
];

export const PELLET_COLOR = "#fde047";
export const BACKGROUND_COLOR = "#1a1033";
export const BACKGROUND_ACCENT = "#2d1b4e";

export const PLAYER1_TURN_KEYS: Record<string, "left" | "right"> = {
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

export const PLAYER2_TURN_KEYS: Record<string, "left" | "right"> = {
  ArrowLeft: "left",
  ArrowRight: "right",
};

/** Single-player: arrows or A/D */
export const TURN_KEYS: Record<string, "left" | "right"> = {
  ...PLAYER1_TURN_KEYS,
  ...PLAYER2_TURN_KEYS,
};

export const BUILD_LABEL =
  process.env.NEXT_PUBLIC_BUILD_ID?.slice(0, 7) ?? "local";

export const ARENA_VERSION = "free-move-v16";

export function getMaxSnakeLength(): number {
  const aiMax = Math.max(...AI_SIZE_PROFILES.map((profile) => profile.length));
  return Math.max(INITIAL_SNAKE_LENGTH, aiMax);
}
