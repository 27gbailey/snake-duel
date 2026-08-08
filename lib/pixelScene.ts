/** Uniform block size used across the entire scene. */
export const BLOCK_SIZE = 16;

export const SKY_COLORS: Record<number, string> = {
  1: "#7ec8e8",
  2: "#b8e4f8",
};

export const CRUST_COLORS: Record<number, string> = {
  1: "#4caf50",
  2: "#3d8a3d",
  3: "#8b6914",
  4: "#6b4a2e",
  5: "#5a4030",
  6: "#3a3a42",
  7: "#7a7a82",
  8: "#2a2420",
  9: "#141010",
  10: "#3a3028",
  11: "#b87333",
  12: "#9aa0a8",
};

export const TREE_COLORS: Record<number, string> = {
  1: "#1a5c2e",
  2: "#268542",
  3: "#3cb356",
  4: "#5c3d1e",
  5: "#3d2810",
};

export const SUN_COLORS: Record<number, string> = {
  1: "#ffcc00",
  2: "#ffe566",
};

export const CLOUD_COLORS: Record<number, string> = {
  1: "#ffffff",
};

export function buildSkyGrid(
  cols: number,
  rows: number,
  sunCol: number,
  sunRow: number,
): number[][] {
  const glowRadius = 8;
  const grid: number[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: number[] = [];
    for (let x = 0; x < cols; x++) {
      const dist = Math.hypot(x - sunCol, y - sunRow);
      row.push(dist < glowRadius ? 2 : 1);
    }
    grid.push(row);
  }

  return grid;
}

function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

export function buildCrustGrid(cols: number, rows: number): number[][] {
  const grid: number[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: number[] = [];
    for (let x = 0; x < cols; x++) {
      if (y === 0) {
        const bump = Math.sin(x * 0.55) * 2 + Math.cos(x * 0.25) * 1.5;
        row.push(bump > 0.8 ? 1 : bump > -0.5 ? 2 : 0);
        continue;
      }

      if (y === 1) {
        row.push(x % 7 === 0 ? 3 : 4);
        continue;
      }

      if (y < 4) {
        row.push(x % 5 === 0 ? 3 : 4);
        continue;
      }

      if (y < 8) {
        const oreRoll = (x * 17 + y * 31) % 23;
        if (oreRoll === 0) row.push(12);
        else if (oreRoll === 1) row.push(11);
        else if (oreRoll === 2) row.push(6);
        else row.push(x % 4 === 0 ? 5 : 7);
        continue;
      }

      const deepRoll = (x * 13 + y * 19) % 19;
      if (deepRoll === 0) row.push(12);
      else if (deepRoll === 1) row.push(11);
      else row.push(x % 3 === 0 ? 8 : 10);
    }
    grid.push(row);
  }

  const caves = [
    { cx: cols * 0.22, cy: 5, rx: cols * 0.08, ry: 2.5 },
    { cx: cols * 0.55, cy: 8, rx: cols * 0.1, ry: 3 },
    { cx: cols * 0.78, cy: 6, rx: cols * 0.07, ry: 2.5 },
    { cx: cols * 0.4, cy: 10, rx: cols * 0.09, ry: 2.8 },
  ];

  for (let y = 1; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      for (const cave of caves) {
        if (inEllipse(x, y, cave.cx, cave.cy, cave.rx, cave.ry)) {
          grid[y][x] = 9;
        }
      }
    }
  }

  return grid;
}

/** Flat-bottom puffy cloud — single white color, round bumps on top. */
export const CLOUD_SHAPE: number[][] = [
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

/** Circular blocky sun — yellow with brighter yellow center, no rays. */
export const SUN_SHAPE: number[][] = [
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
];

export const TREE_A: number[][] = [
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0],
  [0, 1, 1, 2, 2, 3, 2, 2, 1, 1, 0, 0],
  [0, 1, 2, 2, 3, 3, 3, 2, 2, 1, 0, 0],
  [1, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1, 0],
  [0, 1, 2, 2, 3, 3, 3, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 5, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 5, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0],
];

export const TREE_B: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0],
  [0, 1, 1, 2, 2, 3, 2, 2, 1, 1, 0],
  [0, 1, 2, 2, 3, 3, 3, 2, 2, 1, 0],
  [1, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1],
  [1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 1],
  [0, 1, 2, 2, 3, 3, 3, 2, 2, 1, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 5, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 5, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0],
];

export const CRUST_ROWS = 12;
