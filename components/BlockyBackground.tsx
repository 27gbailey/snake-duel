type PixelTreeProps = {
  left: string;
  bottom: string;
  scale?: number;
  flip?: boolean;
};

/** Pixel art tree — 0 = empty, colors map to leaf/trunk shades without grid gaps. */
const TREE_A: number[][] = [
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

const TREE_B: number[][] = [
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

const TREE_COLORS: Record<number, string> = {
  1: "#1a5c2e",
  2: "#268542",
  3: "#3cb356",
  4: "#5c3d1e",
  5: "#3d2810",
};

function PixelTree({ left, bottom, scale = 1, flip = false }: PixelTreeProps) {
  const grid = flip ? TREE_B : TREE_A;
  const pixel = 10;

  return (
    <div
      className="pixel-tree"
      style={{
        left,
        bottom,
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
      }}
    >
      <div
        className="pixel-tree__grid"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, ${pixel}px)`,
          gridTemplateRows: `repeat(${grid.length}, ${pixel}px)`,
        }}
      >
        {grid.flatMap((row, y) =>
          row.map((cell, x) =>
            cell === 0 ? (
              <span key={`${x}-${y}`} className="pixel-tree__empty" />
            ) : (
              <span
                key={`${x}-${y}`}
                className="pixel-tree__cell"
                style={{ backgroundColor: TREE_COLORS[cell] }}
              />
            ),
          ),
        )}
      </div>
    </div>
  );
}

function BlockSun() {
  return (
    <div className="block-sun">
      <div className="block-sun__rays" />
      <div className="block-sun__corona" />
      <div className="block-sun__body">
        <span className="block-sun__highlight" />
      </div>
    </div>
  );
}

function BlockCloud({ top, left, scale = 1 }: { top: string; left: string; scale?: number }) {
  return (
    <div className="block-cloud-v2" style={{ top, left, transform: `scale(${scale})` }}>
      <div className="block-cloud-v2__puff block-cloud-v2__puff--back" />
      <div className="block-cloud-v2__puff block-cloud-v2__puff--mid" />
      <div className="block-cloud-v2__puff block-cloud-v2__puff--front" />
    </div>
  );
}

function EarthCrossSection() {
  return (
    <div className="earth-cross">
      <div className="earth-cross__surface">
        <div className="earth-cross__surface-grass" />
        <div className="earth-cross__surface-cut" />
      </div>
      <div className="earth-cross__layer earth-cross__layer--crust">
        <span className="earth-cross__label">Crust</span>
      </div>
      <div className="earth-cross__layer earth-cross__layer--upper-mantle">
        <span className="earth-cross__label">Upper Mantle</span>
      </div>
      <div className="earth-cross__layer earth-cross__layer--lower-mantle">
        <span className="earth-cross__label">Lower Mantle</span>
      </div>
      <div className="earth-cross__layer earth-cross__layer--outer-core">
        <span className="earth-cross__label">Outer Core</span>
      </div>
      <div className="earth-cross__layer earth-cross__layer--inner-core">
        <div className="earth-cross__core-glow" />
        <span className="earth-cross__label earth-cross__label--core">Inner Core</span>
      </div>
    </div>
  );
}

export default function BlockyBackground() {
  return (
    <div className="blocky-scene" aria-hidden="true">
      <div className="blocky-sky">
        <div className="blocky-sky__gradient" />
        <div className="blocky-sky__haze" />
        <BlockCloud top="10%" left="6%" scale={1.15} />
        <BlockCloud top="16%" left="55%" scale={1} />
        <BlockCloud top="6%" left="32%" scale={0.85} />
        <BlockCloud top="22%" left="78%" scale={0.7} />
        <BlockSun />
      </div>

      <EarthCrossSection />

      <div className="blocky-trees">
        <PixelTree left="2%" bottom="42%" scale={2.2} />
        <PixelTree left="16%" bottom="42%" scale={2.6} flip />
        <PixelTree left="72%" bottom="42%" scale={2.4} flip />
        <PixelTree left="86%" bottom="42%" scale={2.1} />
        <PixelTree left="42%" bottom="42%" scale={1.8} flip />
      </div>
    </div>
  );
}
