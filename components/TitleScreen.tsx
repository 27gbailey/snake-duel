"use client";

import BlockyBackground from "@/components/BlockyBackground";

export default function TitleScreen() {
  return (
    <main className="title-screen">
      <BlockyBackground />
      <div className="title-screen__content">
        <h1 className="blocky-title">
          Create
          <br />
          Earth
        </h1>
        <button type="button" className="start-button">
          Start
        </button>
        <p className="title-screen__version">Create Earth · v1</p>
      </div>
    </main>
  );
}
