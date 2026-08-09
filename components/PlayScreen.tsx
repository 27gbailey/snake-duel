"use client";

import { useState } from "react";
import BlockyBackground from "@/components/BlockyBackground";
import BlockMenu from "@/components/BlockMenu";
import MenuButton from "@/components/MenuButton";
import { blockKey, type BlockType } from "@/lib/blockTypes";

export default function PlayScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);
  const [placedBlocks, setPlacedBlocks] = useState<Record<string, BlockType>>({});

  const handleSelectBlock = (blockType: BlockType) => {
    setSelectedBlock(blockType);
  };

  const handlePlaceBlock = (col: number, row: number) => {
    if (!selectedBlock) {
      return;
    }

    setPlacedBlocks((current) => ({
      ...current,
      [blockKey(col, row)]: selectedBlock,
    }));
  };

  return (
    <main className="scene-screen play-screen">
      <BlockyBackground
        placedBlocks={placedBlocks}
        placementActive={selectedBlock !== null}
        onPlaceBlock={handlePlaceBlock}
      />
      <div className="play-screen__ui">
        <MenuButton
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        />
        <BlockMenu
          open={menuOpen}
          selected={selectedBlock}
          onSelect={handleSelectBlock}
        />
      </div>
    </main>
  );
}
