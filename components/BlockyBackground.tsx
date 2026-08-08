"use client";

import { useEffect, useMemo, useState } from "react";
import PixelGrid from "@/components/PixelGrid";
import {
  BLOCK_SIZE,
  buildCrustGrid,
  buildSkyGrid,
  CLOUD_COLORS,
  CLOUD_SHAPE,
  CRUST_COLORS,
  CRUST_ROWS,
  SKY_COLORS,
  SUN_COLORS,
  SUN_SHAPE,
  TREE_A,
  TREE_B,
  TREE_COLORS,
} from "@/lib/pixelScene";

function useSceneSize(): { cols: number; skyRows: number; sunCol: number; sunRow: number } {
  const [size, setSize] = useState({ cols: 48, skyRows: 18, sunCol: 38, sunRow: 3 });

  useEffect(() => {
    const update = () => {
      const cols = Math.max(24, Math.ceil(window.innerWidth / BLOCK_SIZE));
      const skyRows = Math.max(14, Math.floor((window.innerHeight * 0.62) / BLOCK_SIZE));
      const sunCol = cols - 10;
      const sunRow = 3;
      setSize({ cols, skyRows, sunCol, sunRow });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

type PixelTreeProps = {
  left: string;
  scale?: number;
  flip?: boolean;
};

function PixelTree({ left, scale = 1, flip = false }: PixelTreeProps) {
  const grid = flip ? TREE_B : TREE_A;

  return (
    <div
      className="scene-tree"
      style={{
        left,
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
      }}
    >
      <PixelGrid grid={grid} colors={TREE_COLORS} transparentEmpty />
    </div>
  );
}

function BlockCloud({ top, left, scale = 1 }: { top: string; left: string; scale?: number }) {
  return (
    <div className="scene-cloud" style={{ top, left, transform: `scale(${scale})` }}>
      <PixelGrid grid={CLOUD_SHAPE} colors={CLOUD_COLORS} transparentEmpty />
    </div>
  );
}

function BlockSun({ col, row }: { col: number; row: number }) {
  return (
    <div
      className="scene-sun"
      style={{
        left: col * BLOCK_SIZE,
        top: row * BLOCK_SIZE,
      }}
    >
      <PixelGrid grid={SUN_SHAPE} colors={SUN_COLORS} transparentEmpty />
    </div>
  );
}

export default function BlockyBackground() {
  const { cols, skyRows, sunCol, sunRow } = useSceneSize();
  const skyGrid = useMemo(() => buildSkyGrid(cols, skyRows, sunCol, sunRow), [cols, skyRows, sunCol, sunRow]);
  const crustGrid = useMemo(() => buildCrustGrid(cols, CRUST_ROWS), [cols]);
  const crustHeight = CRUST_ROWS * BLOCK_SIZE;

  return (
    <div className="blocky-scene" aria-hidden="true">
      <div className="blocky-sky" style={{ bottom: crustHeight }}>
        <PixelGrid
          grid={skyGrid}
          colors={SKY_COLORS}
          transparentEmpty={false}
          className="blocky-sky__grid"
        />
        <BlockCloud top="10%" left="4%" scale={1.1} />
        <BlockCloud top="18%" left="48%" scale={1} />
        <BlockCloud top="6%" left="28%" scale={0.95} />
        <BlockCloud top="24%" left="72%" scale={0.85} />
        <BlockSun col={sunCol} row={sunRow} />
      </div>

      <div className="crust-cross" style={{ height: crustHeight }}>
        <PixelGrid grid={crustGrid} colors={CRUST_COLORS} transparentEmpty />
      </div>

      <div className="blocky-trees" style={{ bottom: crustHeight - BLOCK_SIZE }}>
        <PixelTree left="3%" scale={0.95} />
        <PixelTree left="15%" scale={1.05} flip />
        <PixelTree left="72%" scale={1} flip />
        <PixelTree left="86%" scale={0.9} />
        <PixelTree left="42%" scale={0.85} flip />
      </div>
    </div>
  );
}
