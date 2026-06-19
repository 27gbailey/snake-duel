"use client";

import PizzaCanvas from "@/components/pizza/PizzaCanvas";
import { Button, Panel } from "@/components/ui";
import { useGameStore } from "@/features/game/store/gameStore";
import { useState } from "react";
import type { PizzaRegion } from "@/features/game/types";

export default function CutScreen() {
  const { activePizza, cutPizza, servePizza, navigate } = useGameStore();
  const [region, setRegion] = useState<PizzaRegion>("all");

  if (!activePizza) {
    return (
      <div className="screen">
        <p>No pizza to cut.</p>
        <Button onClick={() => navigate("restaurant")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="screen screen--cut">
      <Panel title="Cutting Station">
        <p className="cut-instructions">
          Slice the pizza before serving. Click &ldquo;Cut Pizza&rdquo; when ready.
        </p>

        <PizzaCanvas
          pizza={activePizza}
          selectedRegion={region}
          onSelectRegion={setRegion}
          showLabels={false}
        />

        <div className="cut-status">
          {activePizza.cut ? (
            <span className="cut-status__done">✓ Pizza cut and ready to serve</span>
          ) : (
            <span className="cut-status__pending">Pizza needs cutting</span>
          )}
        </div>

        <div className="screen__footer">
          <Button variant="ghost" onClick={() => navigate("oven")}>
            Back
          </Button>
          {!activePizza.cut && (
            <Button variant="secondary" onClick={cutPizza}>
              Cut Pizza
            </Button>
          )}
          <Button onClick={servePizza} disabled={!activePizza.cut}>
            Serve Customer
          </Button>
        </div>
      </Panel>
    </div>
  );
}
