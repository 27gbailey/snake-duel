export const BLOCK_TYPES = {
  RED: { label: "RED", color: "#e53935" },
  ORANGE: { label: "ORANGE", color: "#fb8c00" },
  YELLOW: { label: "YELLOW", color: "#fdd835" },
  GREEN: { label: "GREEN", color: "#2e7d32" },
  BLUE: { label: "BLUE", color: "#1e88e5" },
  PURPLE: { label: "PURPLE", color: "#8e24aa" },
  PINK: { label: "PINK", color: "#ec407a" },
  GRASS: { label: "GRASS", color: "#7cfc00" },
  DIRT: { label: "DIRT", color: "#8d6e63" },
  STONE: { label: "STONE", color: "#9e9e9e" },
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;

export const BLOCK_TYPE_LIST = Object.keys(BLOCK_TYPES) as BlockType[];

export function blockKey(col: number, row: number): string {
  return `${col},${row}`;
}
