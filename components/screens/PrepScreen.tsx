"use client";

import { useState } from "react";
import PizzaCanvas from "@/components/pizza/PizzaCanvas";
import { Button, Panel } from "@/components/ui";
import { TOPPING_CATALOG } from "@/features/game/data/toppings";
import { getActiveOrder, useGameStore } from "@/features/game/store/gameStore";
import type { DoughId, PizzaRegion, SauceId, ToppingId } from "@/features/game/types";

const REGIONS: PizzaRegion[] = [
  "all",
  "left",
  "right",
  "top",
  "bottom",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const SAUCES: SauceId[] = ["marinara", "alfredo", "pesto", "bbq"];
const DOUGHS: DoughId[] = ["thin", "regular", "thick", "gluten-free"];

export default function PrepScreen() {
  const state = useGameStore();
  const {
    activePizza,
    unlockedToppings,
    applySauce,
    applyCheese,
    toggleTopping,
    setDough,
    sendToOven,
    navigate,
  } = state;
  const order = getActiveOrder(state);
  const [region, setRegion] = useState<PizzaRegion>("all");

  if (!activePizza || !order) {
    return (
      <div className="screen">
        <p>No active order.</p>
        <Button onClick={() => navigate("restaurant")}>Back</Button>
      </div>
    );
  }

  const availableToppings = TOPPING_CATALOG.filter((t) =>
    unlockedToppings.includes(t.id),
  );

  return (
    <div className="screen screen--prep">
      <Panel title="Prep Station">
        <p className="prep-order">Order: {order.description}</p>

        <div className="prep-layout">
          <PizzaCanvas
            pizza={activePizza}
            selectedRegion={region}
            onSelectRegion={setRegion}
          />

          <div className="prep-controls">
            <div className="prep-controls__group">
              <h4>Dough</h4>
              <div className="chip-row">
                {DOUGHS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`chip${activePizza.dough === d ? " chip--active" : ""}`}
                    onClick={() => setDough(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="prep-controls__group">
              <h4>Region</h4>
              <div className="chip-row chip-row--wrap">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`chip${region === r ? " chip--active" : ""}`}
                    onClick={() => setRegion(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="prep-controls__group">
              <h4>Sauce on {region}</h4>
              <div className="chip-row">
                {SAUCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    onClick={() => applySauce(region, s)}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  className="chip"
                  onClick={() => applyCheese(region, false)}
                >
                  no sauce
                </button>
              </div>
            </div>

            <div className="prep-controls__group">
              <h4>Cheese on {region}</h4>
              <div className="chip-row">
                <button type="button" className="chip" onClick={() => applyCheese(region, true)}>
                  add cheese
                </button>
                <button type="button" className="chip" onClick={() => applyCheese(region, false)}>
                  no cheese
                </button>
              </div>
            </div>

            <div className="prep-controls__group">
              <h4>Toppings on {region}</h4>
              <div className="chip-row chip-row--wrap">
                {availableToppings.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="chip"
                    onClick={() => toggleTopping(region, t.id as ToppingId)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="screen__footer">
          <Button variant="ghost" onClick={() => navigate("restaurant")}>
            Cancel
          </Button>
          <Button onClick={sendToOven} disabled={!activePizza.dough}>
            Send to Oven
          </Button>
        </div>
      </Panel>
    </div>
  );
}
