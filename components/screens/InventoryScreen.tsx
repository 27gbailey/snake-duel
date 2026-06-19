"use client";

import { Button, Panel } from "@/components/ui";
import { getInventoryValue } from "@/features/game/engines/inventoryEngine";
import { useGameStore } from "@/features/game/store/gameStore";

export default function InventoryScreen() {
  const state = useGameStore();
  const { inventory, navigate } = state;
  const value = getInventoryValue(state);

  const sections = [
    { title: "Dough", items: inventory.dough },
    { title: "Sauce", items: inventory.sauce },
    { title: "Cheese", items: inventory.cheese },
    { title: "Toppings", items: inventory.toppings },
  ];

  return (
    <div className="screen screen--inventory">
      <Panel title="Inventory">
        <p className="shop-balance">Estimated value: ${value.toFixed(2)}</p>
        {sections.map((section) => (
          <div key={section.title} className="inventory-section">
            <h4>{section.title}</h4>
            <ul className="inventory-grid">
              {Object.entries(section.items).map(([id, count]) => (
                <li key={id} className={`inventory-grid__item${count <= 3 ? " inventory-grid__item--low" : ""}`}>
                  <span>{id}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Button variant="ghost" onClick={() => navigate("restaurant")}>
          Back
        </Button>
      </Panel>
    </div>
  );
}
