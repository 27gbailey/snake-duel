/** Uniform block size used across the entire scene. */
export const BLOCK_SIZE = 16;
export const CRUST_ROWS = 12;

/** All background block colors — one palette for the full grid. */
export const SCENE_COLORS: Record<number, string> = {
  1: "#7ec8e8",
  2: "#b8e4f8",
  3: "#ffcc00",
  4: "#ffe566",
  5: "#ffffff",
  10: "#4caf50",
  11: "#3d9a45",
  12: "#9a7030",
  13: "#7a5535",
  14: "#5c4030",
  15: "#909098",
  16: "#787880",
  17: "#626268",
  18: "#505058",
  19: "#2e2e34",
  20: "#8a9098",
  21: "#b87333",
  22: "#121010",
};

export const TREE_COLORS: Record<number, string> = {
  1: "#1a5c2e",
  2: "#268542",
  3: "#3cb356",
  4: "#5c3d1e",
  5: "#3d2810",
};

/** Build a puffy oval cumulus cloud with a flat bottom (not triangular). */
export function buildCumulusShape(width = 23, height = 9): number[][] {
  const shape: number[][] = [];
  const centerX = (width - 1) / 2;
  const flatRows = 2;
  const domeBottom = height - flatRows;

  for (let y = 0; y < height; y++) {
    const row = Array<number>(width).fill(0);

    if (y >= domeBottom) {
      for (let x = 0; x < width; x++) {
        row[x] = 1;
      }
      shape.push(row);
      continue;
    }

    const radiusX = width / 2 - 1;
    const radiusY = domeBottom - 0.5;

    for (let x = 0; x < width; x++) {
      const nx = (x - centerX) / radiusX;
      const ny = (y - domeBottom) / radiusY;
      if (nx * nx + ny * ny <= 1.08) {
        row[x] = 1;
      }
    }

    if (y <= 2) {
      for (let x = 0; x < width; x++) {
        for (const lobeCenter of [centerX - 5, centerX, centerX + 5]) {
          const dx = x - lobeCenter;
          const dy = y - 1.2;
          if (dx * dx + dy * dy <= 5) {
            row[x] = 1;
          }
        }
      }
    }

    shape.push(row);
  }

  return shape;
}

export const CUMULUS_SHAPE = buildCumulusShape();

/** Circular blocky sun — centered on glow. */
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

export type SceneLayout = {
  cols: number;
  skyRows: number;
  sunCol: number;
  sunRow: number;
};

function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function stampShape(
  grid: number[][],
  startCol: number,
  startRow: number,
  shape: number[][],
  mapValue: (value: number) => number,
): void {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      const value = shape[y][x];
      if (value === 0) continue;

      const targetY = startRow + y;
      const targetX = startCol + x;

      if (
        targetY >= 0 &&
        targetY < grid.length &&
        targetX >= 0 &&
        targetX < grid[0].length
      ) {
        grid[targetY][targetX] = mapValue(value);
      }
    }
  }
}

function crustBlock(x: number, crustY: number): number {
  if (crustY === 0) {
    return (x + crustY) % 4 === 0 ? 11 : 10;
  }

  if (crustY <= 3) {
    const noise = (x * 13 + crustY * 7) % 10;
    if (noise < 3) return 12;
    if (noise < 7) return 13;
    return 14;
  }

  const noise = (x * 17 + crustY * 23) % 31;
  if (noise === 0) return 19;
  if (noise === 1) return 21;
  if (noise === 2) return 20;
  if (noise < 9) return 15;
  if (noise < 18) return 16;
  if (noise < 25) return 17;
  return 18;
}

export function buildSceneGrid(layout: SceneLayout): number[][] {
  const { cols, skyRows, sunCol, sunRow } = layout;
  const totalRows = skyRows + CRUST_ROWS;
  const glowRadius = 11;
  const sunOffsetCol = sunCol - Math.floor(SUN_SHAPE[0].length / 2);
  const sunOffsetRow = sunRow - Math.floor(SUN_SHAPE.length / 2);

  const grid: number[][] = [];

  for (let y = 0; y < totalRows; y++) {
    const row: number[] = [];

    for (let x = 0; x < cols; x++) {
      if (y >= skyRows) {
        row.push(crustBlock(x, y - skyRows));
        continue;
      }

      const dist = Math.hypot(x - sunCol, y - sunRow);
      row.push(dist <= glowRadius ? 2 : 1);
    }

    grid.push(row);
  }

  stampShape(grid, sunOffsetCol, sunOffsetRow, SUN_SHAPE, (value) => (value === 2 ? 4 : 3));

  const cloudPlacements = [
    { col: 3, row: 2 },
    { col: Math.floor(cols * 0.28), row: 4 },
    { col: Math.floor(cols * 0.52), row: 2 },
    { col: Math.floor(cols * 0.72), row: 5 },
  ];

  for (const cloud of cloudPlacements) {
    stampShape(grid, cloud.col, cloud.row, CUMULUS_SHAPE, () => 5);
  }

  const caves = [
    { cx: cols * 0.48, cy: skyRows + 7, rx: Math.max(3, cols * 0.04), ry: 1.6 },
  ];

  for (let y = skyRows + 1; y < totalRows; y++) {
    for (let x = 0; x < cols; x++) {
      for (const cave of caves) {
        if (inEllipse(x, y, cave.cx, cave.cy, cave.rx, cave.ry)) {
          grid[y][x] = 22;
        }
      }
    }
  }

  return grid;
}

export function getSceneLayout(viewportWidth: number, viewportHeight: number): SceneLayout {
  const cols = Math.max(24, Math.ceil(viewportWidth / BLOCK_SIZE));
  const totalRows = Math.max(CRUST_ROWS + 14, Math.ceil(viewportHeight / BLOCK_SIZE));
  const skyRows = totalRows - CRUST_ROWS;
  const sunCol = Math.floor(cols * 0.72);
  const sunRow = Math.floor(skyRows * 0.24);

  return { cols, skyRows, sunCol, sunRow };
}

export function getTreeHeight(grid: number[][]): number {
  return grid.length;
}

export function getTreeWidth(grid: number[][]): number {
  return grid[0]?.length ?? 0;
}
