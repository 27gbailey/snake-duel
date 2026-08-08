type BlockTreeProps = {
  left: string;
  bottom: string;
  scale?: number;
  variant?: "round" | "tall" | "wide";
};

function BlockTree({ left, bottom, scale = 1, variant = "round" }: BlockTreeProps) {
  return (
    <div
      className={`block-tree block-tree--${variant}`}
      style={{
        left,
        bottom,
        transform: `scale(${scale})`,
      }}
    >
      <div className="block-tree__canopy">
        <span />
        <span />
        <span />
        <span />
        {variant === "tall" && <span className="block-tree__canopy-top" />}
        {variant === "wide" && (
          <>
            <span />
            <span />
          </>
        )}
      </div>
      <div className="block-tree__trunk">
        <span />
        <span />
      </div>
    </div>
  );
}

function BlockCloud({ top, left, scale = 1 }: { top: string; left: string; scale?: number }) {
  return (
    <div className="block-cloud" style={{ top, left, transform: `scale(${scale})` }}>
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export default function BlockyBackground() {
  return (
    <div className="blocky-scene" aria-hidden="true">
      <div className="blocky-sky">
        <div className="blocky-sky__band blocky-sky__band--deep" />
        <div className="blocky-sky__band blocky-sky__band--mid" />
        <div className="blocky-sky__band blocky-sky__band--light" />
        <BlockCloud top="12%" left="8%" scale={1.1} />
        <BlockCloud top="18%" left="62%" scale={0.9} />
        <BlockCloud top="8%" left="38%" scale={0.75} />
        <div className="blocky-sun" />
      </div>

      <div className="blocky-hills">
        <div className="blocky-hill blocky-hill--back" />
        <div className="blocky-hill blocky-hill--mid" />
      </div>

      <div className="blocky-trees">
        <BlockTree left="4%" bottom="28%" scale={0.85} variant="tall" />
        <BlockTree left="14%" bottom="24%" scale={1} variant="round" />
        <BlockTree left="78%" bottom="26%" scale={0.95} variant="wide" />
        <BlockTree left="88%" bottom="22%" scale={0.8} variant="tall" />
        <BlockTree left="68%" bottom="20%" scale={0.7} variant="round" />
        <BlockTree left="26%" bottom="18%" scale={0.65} variant="round" />
      </div>

      <div className="blocky-grass">
        <div className="blocky-grass__stripes" />
        <div className="blocky-grass__blocks">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="blocky-grass__block"
              style={{
                left: `${(i * 4.3) % 100}%`,
                bottom: `${(i * 7) % 28}px`,
                opacity: 0.35 + (i % 5) * 0.12,
              }}
            />
          ))}
        </div>
        <div className="blocky-grass__foreground" />
      </div>
    </div>
  );
}
