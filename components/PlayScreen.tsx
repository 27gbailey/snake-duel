"use client";

import { useState } from "react";
import BlockyBackground from "@/components/BlockyBackground";
import BlockMenu from "@/components/BlockMenu";
import MenuButton from "@/components/MenuButton";

export default function PlayScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="scene-screen play-screen">
      <BlockyBackground />
      <div className="play-screen__ui">
        <MenuButton
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        />
        <BlockMenu open={menuOpen} />
      </div>
    </main>
  );
}
