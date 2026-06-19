"use client";

import { useEffect } from "react";
import { Button, Panel } from "@/components/ui";
import { useGameStore } from "@/features/game/store/gameStore";

export default function OvenScreen() {
  const { activePizza, advanceBake, finishBaking, navigate } = useGameStore();

  useEffect(() => {
    if (!activePizza || activePizza.stage !== "baking") return;

    const interval = setInterval(() => advanceBake(1), 800);
    return () => clearInterval(interval);
  }, [activePizza, advanceBake]);

  if (!activePizza) {
    return (
      <div className="screen">
        <p>No pizza in oven.</p>
        <Button onClick={() => navigate("restaurant")}>Back</Button>
      </div>
    );
  }

  const progress = Math.min(
    100,
    Math.round((activePizza.bakeProgress / activePizza.bakeTarget) * 100),
  );

  return (
    <div className="screen screen--oven">
      <Panel title="Oven">
        <div className="oven-visual">
          <div className="oven-visual__door">
            <div className="oven-visual__pizza">🍕</div>
            <div className="oven-visual__glow" style={{ opacity: progress / 100 }} />
          </div>
          <div className="oven-progress">
            <div className="oven-progress__bar">
              <div className="oven-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <span>
              Baking... {activePizza.bakeProgress} / {activePizza.bakeTarget}s
            </span>
          </div>
        </div>

        <div className="screen__footer">
          <Button variant="ghost" onClick={() => navigate("prep")}>
            Back to Prep
          </Button>
          <Button variant="secondary" onClick={finishBaking}>
            Finish Early
          </Button>
        </div>
      </Panel>
    </div>
  );
}
