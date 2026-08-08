"use client";

import { useState } from "react";
import BlockyBackground from "@/components/BlockyBackground";
import PlayScreen from "@/components/PlayScreen";

export default function TitleScreen() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <PlayScreen />;
  }

  return (
    <main className="scene-screen">
      <BlockyBackground />
      <div className="title-screen__content">
        <h1 className="blocky-title">
          Create
          <br />
          Earth
        </h1>
        <button
          type="button"
          className="start-button"
          onClick={() => setStarted(true)}
        >
          Start
        </button>
        <p className="title-screen__version">Create Earth · v1</p>
      </div>
    </main>
  );
}
