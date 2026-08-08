"use client";

import { useEffect, useMemo, useState } from "react";
import PixelGrid from "@/components/PixelGrid";
import {
  BLOCK_SIZE,
  buildSceneGrid,
  CRUST_ROWS,
  getSceneLayout,
  getTreeHeight,
  getTreeWidth,
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
  scale?: number;
  flip?: boolean;
};

function PixelTree({ col, skyRows, scale = 1, flip = false }: PixelTreeProps) {
  const grid = flip ? TREE_B : TREE_A;
  const treeHeight = getTreeHeight(grid);
  const treeWidth = getTreeWidth(grid);

  return (
    <div
      className="scene-tree"
      style={{
        left: col * BLOCK_SIZE,
        top: (skyRows - treeHeight) * BLOCK_SIZE,
        width: treeWidth * BLOCK_SIZE,
        transform: `scale(${scale})`,
        transformOrigin: "bottom left",
      }}
    >
      <PixelGrid grid={grid} colors={TREE_COLORS} transparentEmpty />
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

        <PixelTree col={2} skyRows={skyRows} scale={0.95} />
        <PixelTree col={Math.floor(cols * 0.12)} skyRows={skyRows} scale={1.05} flip />
        <PixelTree col={Math.floor(cols * 0.68)} skyRows={skyRows} scale={1} flip />
        <PixelTree col={Math.floor(cols * 0.82)} skyRows={skyRows} scale={0.9} />
        <PixelTree col={Math.floor(cols * 0.4)} skyRows={skyRows} scale={0.85} flip />
      </div>
    </div>
  );
}
