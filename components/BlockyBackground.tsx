"use client";

import { useEffect, useMemo, useState } from "react";
import CompactPixelSprite from "@/components/CompactPixelSprite";
import PixelGrid from "@/components/PixelGrid";
import {
  BLOCK_SIZE,
  buildSceneGrid,
  CRUST_ROWS,
  getSceneLayout,
  getTreeHeight,
  SCENE_COLORS,
  TREE_A,
  TREE_B,
  TREE_COLORS,
  type SceneLayout,
} from "@/lib/pixelScene";

function useSceneLayout(): SceneLayout {
  const [layout, setLayout] = useState<SceneLayout>(() =>
    getSceneLayout(1200, 800),
  );

  useEffect(() => {
    const update = () => {
      setLayout(getSceneLayout(window.innerWidth, window.innerHeight));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return layout;
}

type PixelTreeProps = {
  col: number;
  skyRows: number;
  flip?: boolean;
};

function PixelTree({ col, skyRows, flip = false }: PixelTreeProps) {
  const grid = flip ? TREE_B : TREE_A;
  const treeHeight = getTreeHeight(grid);

  return (
    <div
      className="scene-tree"
      style={{
        left: col * BLOCK_SIZE,
        top: (skyRows - treeHeight) * BLOCK_SIZE,
      }}
    >
      <CompactPixelSprite grid={grid} colors={TREE_COLORS} />
    </div>
  );
}

export default function BlockyBackground() {
  const layout = useSceneLayout();
  const sceneGrid = useMemo(() => buildSceneGrid(layout), [layout]);
  const { cols, skyRows } = layout;

  return (
    <div className="blocky-scene" aria-hidden="true">
      <div
        className="scene-grid-wrap"
        style={{
          width: cols * BLOCK_SIZE,
          height: (skyRows + CRUST_ROWS) * BLOCK_SIZE,
        }}
      >
        <PixelGrid
          grid={sceneGrid}
          colors={SCENE_COLORS}
          transparentEmpty={false}
          className="scene-grid"
        />

        <PixelTree col={2} skyRows={skyRows} />
        <PixelTree col={Math.floor(cols * 0.12)} skyRows={skyRows} flip />
        <PixelTree col={Math.floor(cols * 0.68)} skyRows={skyRows} flip />
        <PixelTree col={Math.floor(cols * 0.82)} skyRows={skyRows} />
        <PixelTree col={Math.floor(cols * 0.4)} skyRows={skyRows} flip />
      </div>
    </div>
  );
}
