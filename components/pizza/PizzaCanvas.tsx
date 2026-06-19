import type { PizzaBuild, PizzaRegion, SliceIndex } from "@/features/game/types";
import { REGION_SLICES } from "@/features/game/data/regions";
import { TOPPING_CATALOG } from "@/features/game/data/toppings";

type PizzaCanvasProps = {
  pizza: PizzaBuild;
  selectedRegion: PizzaRegion;
  onSelectRegion: (region: PizzaRegion) => void;
  showLabels?: boolean;
};

const SLICE_ANGLES: Record<SliceIndex, number> = {
  0: -22.5,
  1: 22.5,
  2: 67.5,
  3: 112.5,
  4: 157.5,
  5: 202.5,
  6: 247.5,
  7: 292.5,
};

function getRegionForSlice(slice: SliceIndex): PizzaRegion[] {
  const regions: PizzaRegion[] = [];
  for (const [region, slices] of Object.entries(REGION_SLICES)) {
    if (region !== "all" && (slices as SliceIndex[]).includes(slice)) {
      regions.push(region as PizzaRegion);
    }
  }
  return regions;
}

function sliceFill(slice: PizzaBuild["slices"][number]): string {
  if (slice.sauce === "alfredo") return "#f5e6c8";
  if (slice.sauce === "pesto") return "#7cb342";
  if (slice.sauce === "bbq") return "#8d4024";
  if (slice.sauce) return "#c0392b";
  return "#f4d03f";
}

export default function PizzaCanvas({
  pizza,
  selectedRegion,
  onSelectRegion,
  showLabels = true,
}: PizzaCanvasProps) {
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 12;

  return (
    <div className="pizza-canvas">
      <svg viewBox={`0 0 ${size} ${size}`} className="pizza-canvas__svg">
        <circle
          cx={center}
          cy={center}
          r={radius + 8}
          fill="#d4a574"
          stroke="#8b5a2b"
          strokeWidth="4"
        />

        {pizza.slices.map((slice, index) => {
          const angle = SLICE_ANGLES[index as SliceIndex];
          const isHighlighted = REGION_SLICES[selectedRegion].includes(index as SliceIndex);
          const toppingColors = slice.toppings.map(
            (t) => TOPPING_CATALOG.find((c) => c.id === t)?.color ?? "#333",
          );

          return (
            <g
              key={index}
              transform={`rotate(${angle} ${center} ${center})`}
              className={`pizza-canvas__slice${isHighlighted ? " pizza-canvas__slice--active" : ""}`}
              onClick={() => {
                const regions = getRegionForSlice(index as SliceIndex);
                onSelectRegion(regions[0] ?? "all");
              }}
            >
              <path
                d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius * Math.sin(Math.PI / 4)} ${center - radius * Math.cos(Math.PI / 4)} Z`}
                fill={sliceFill(slice)}
                stroke={isHighlighted ? "#fff" : "#5d3a1a"}
                strokeWidth={isHighlighted ? 2.5 : 1}
                opacity={slice.cheese ? 1 : 0.85}
              />
              {toppingColors.slice(0, 3).map((color, i) => (
                <circle
                  key={i}
                  cx={center + (i - 1) * 10}
                  cy={center - radius * 0.55}
                  r="5"
                  fill={color}
                />
              ))}
            </g>
          );
        })}

        <circle cx={center} cy={center} r="10" fill="#f8f4e8" stroke="#8b5a2b" strokeWidth="2" />
      </svg>

      {showLabels && (
        <p className="pizza-canvas__region">
          Region: <strong>{selectedRegion}</strong>
          {pizza.dough && <> · {pizza.dough} crust</>}
        </p>
      )}
    </div>
  );
}
