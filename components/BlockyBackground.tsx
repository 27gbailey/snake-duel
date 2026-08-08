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
  upscaleGrid,
} from "@/lib/pixelScene";

function useSceneSize(): { cols: number; skyRows: number } {
  const [size, setSize] = useState({ cols: 80, skyRows: 32 });

  useEffect(() => {
    const update = () => {
      const cols = Math.max(40, Math.ceil(window.innerWidth / BLOCK_SIZE));
      const skyRows = Math.max(28, Math.floor((window.innerHeight * 0.58) / BLOCK_SIZE));
      setSize({ cols, skyRows });
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
  const base = flip ? TREE_B : TREE_A;
  const grid = useMemo(() => upscaleGrid(base, 2), [base]);

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

function BlockSun() {
  return (
    <div className="scene-sun">
      <PixelGrid grid={SUN_SHAPE} colors={SUN_COLORS} transparentEmpty />
    </div>
  );
}

export default function BlockyBackground() {
  const { cols, skyRows } = useSceneSize();
  const skyGrid = useMemo(() => buildSkyGrid(cols, skyRows), [cols, skyRows]);
  const crustGrid = useMemo(() => buildCrustGrid(cols, CRUST_ROWS), [cols]);
  const crustHeight = CRUST_ROWS * BLOCK_SIZE;

  return (
    <div className="blocky-scene" aria-hidden="true">
      <div className="blocky-sky">
        <PixelGrid
          grid={skyGrid}
          colors={SKY_COLORS}
          transparentEmpty={false}
          className="blocky-sky__grid"
        />
        <BlockCloud top="8%" left="5%" scale={1.2} />
        <BlockCloud top="14%" left="52%" scale={1} />
        <BlockCloud top="5%" left="30%" scale={0.9} />
        <BlockCloud top="20%" left="76%" scale={0.75} />
        <BlockSun />
      </div>

      <div className="crust-cross" style={{ height: crustHeight }}>
        <PixelGrid grid={crustGrid} colors={CRUST_COLORS} transparentEmpty />
      </div>

      <div className="blocky-trees" style={{ bottom: crustHeight - BLOCK_SIZE }}>
        <PixelTree left="2%" scale={2.2} />
        <PixelTree left="14%" scale={2.6} flip />
        <PixelTree left="70%" scale={2.4} flip />
        <PixelTree left="84%" scale={2.1} />
        <PixelTree left="40%" scale={1.8} flip />
      </div>
    </div>
  );
}
