export const GRID_SIZE = 50;
export const TICK_MS = 110;

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
