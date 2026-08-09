"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import CompactPixelSprite from "@/components/CompactPixelSprite";
import PixelGrid from "@/components/PixelGrid";
import {
  BLOCK_TYPES,
  type BlockType,
} from "@/lib/blockTypes";
import {
  BLOCK_SIZE,
  buildSceneGrid,
  CRUST_ROWS,
  getSceneLayout,
  getTreeHeight,
  getTreePlacements,
  isPlaceableSkyCell,
  SCENE_COLORS,
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
  grid: number[][];
};

function PixelTree({ col, skyRows, grid }: PixelTreeProps) {
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

type BlockyBackgroundProps = {
  placedBlocks?: Record<string, BlockType>;
  placementActive?: boolean;
  onPlaceBlock?: (col: number, row: number) => void;
};

export default function BlockyBackground({
  placedBlocks = {},
  placementActive = false,
  onPlaceBlock,
}: BlockyBackgroundProps) {
  const layout = useSceneLayout();
  const sceneGrid = useMemo(() => buildSceneGrid(layout), [layout]);
  const { cols, skyRows } = layout;
  const trees = useMemo(
    () => getTreePlacements(cols, skyRows),
    [cols, skyRows],
  );

  const handleGridClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!placementActive || !onPlaceBlock) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / BLOCK_SIZE);
    const row = Math.floor((event.clientY - rect.top) / BLOCK_SIZE);

    if (!isPlaceableSkyCell(sceneGrid, col, row, layout)) {
      return;
    }

    onPlaceBlock(col, row);
  };

  return (
    <div
      className={`blocky-scene${placementActive ? " blocky-scene--interactive" : ""}`}
      aria-hidden={!placementActive}
    >
      <div
        className={`scene-grid-wrap${placementActive ? " scene-grid-wrap--interactive" : ""}`}
        style={{
          width: cols * BLOCK_SIZE,
          height: (skyRows + CRUST_ROWS) * BLOCK_SIZE,
        }}
        onClick={handleGridClick}
      >
        <PixelGrid
          grid={sceneGrid}
          colors={SCENE_COLORS}
          transparentEmpty={false}
          className="scene-grid"
        />

        {Object.entries(placedBlocks).map(([key, blockType]) => {
          const [colText, rowText] = key.split(",");
          const col = Number(colText);
          const row = Number(rowText);

          return (
            <span
              key={key}
              className="placed-block"
              style={{
                left: col * BLOCK_SIZE,
                top: row * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: BLOCK_TYPES[blockType].color,
              }}
            />
          );
        })}

        {trees.map((tree) => (
          <PixelTree
            key={`${tree.col}-${tree.grid.length}`}
            col={tree.col}
            skyRows={skyRows}
            grid={tree.grid}
          />
        ))}
      </div>
    </div>
  );
}
