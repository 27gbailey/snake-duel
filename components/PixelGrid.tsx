import { BLOCK_SIZE } from "@/lib/pixelScene";

type PixelGridProps = {
  grid: number[][];
  colors: Record<number, string>;
  className?: string;
  transparentEmpty?: boolean;
};

export default function PixelGrid({
  grid,
  colors,
  className = "",
  transparentEmpty = true,
}: PixelGridProps) {
  if (grid.length === 0 || grid[0].length === 0) {
    return null;
  }

  return (
    <div
      className={`pixel-grid ${className}`.trim()}
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, ${BLOCK_SIZE}px)`,
        gridTemplateRows: `repeat(${grid.length}, ${BLOCK_SIZE}px)`,
      }}
    >
      {grid.flatMap((row, y) =>
        row.map((cell, x) => {
          if (cell === 0 && transparentEmpty) {
            return <span key={`${x}-${y}`} className="pixel-grid__empty" />;
          }

          return (
            <span
              key={`${x}-${y}`}
              className="pixel-grid__cell"
              style={{
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
