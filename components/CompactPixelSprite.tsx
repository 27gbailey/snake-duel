import { BLOCK_SIZE } from "@/lib/pixelScene";

type CompactPixelSpriteProps = {
  grid: number[][];
  colors: Record<number, string>;
  className?: string;
};

/** Renders only filled pixels — no empty grid slots, so no background grid bleeds through. */
export default function CompactPixelSprite({
  grid,
  colors,
  className = "",
}: CompactPixelSpriteProps) {
  if (grid.length === 0 || grid[0].length === 0) {
    return null;
  }

  const width = grid[0].length * BLOCK_SIZE;
  const height = grid.length * BLOCK_SIZE;

  return (
    <div
      className={`compact-sprite ${className}`.trim()}
      style={{ width, height }}
    >
      {grid.flatMap((row, y) =>
        row.map((cell, x) => {
          if (cell === 0) return null;

          return (
            <span
              key={`${x}-${y}`}
              className="compact-sprite__cell"
              style={{
                left: x * BLOCK_SIZE,
                top: y * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: colors[cell] ?? "transparent",
              }}
            />
          );
        }),
      )}
    </div>
  );
}
