"use client";

import { Button, Panel } from "@/components/ui";
import { getRestockPrice } from "@/features/game/engines/economyEngine";
import { TOPPING_CATALOG } from "@/features/game/data/toppings";
import { useGameStore } from "@/features/game/store/gameStore";

export default function ShopScreen() {
  const { cash, restock, navigate } = useGameStore();

  const items = [
    ...(["thin", "regular", "thick", "gluten-free"] as const).map((id) => ({
      category: "dough" as const,
      id,
      label: `${id} dough (5)`,
      cost: getRestockPrice("dough", id),
    })),
    ...(["marinara", "alfredo", "pesto", "bbq"] as const).map((id) => ({
      category: "sauce" as const,
      id,
      label: `${id} sauce (8)`,
      cost: getRestockPrice("sauce", id),
    })),
    ...(["mozzarella", "cheddar", "parmesan", "vegan"] as const).map((id) => ({
      category: "cheese" as const,
      id,
      label: `${id} cheese (8)`,
      cost: getRestockPrice("cheese", id),
    })),
    ...TOPPING_CATALOG.map((t) => ({
      category: "topping" as const,
      id: t.id,
      label: `${t.name} (10)`,
      cost: getRestockPrice("topping", t.id),
    })),
  ];

  return (
    <div className="screen screen--shop">
      <Panel title="Ingredient Shop">
        <p className="shop-balance">Balance: ${cash.toFixed(2)}</p>
        <ul className="shop-list">
          {items.map((item) => (
            <li key={`${item.category}-${item.id}`} className="shop-list__item">
              <span>{item.label}</span>
              <Button
                variant="secondary"
                disabled={cash < item.cost}
                onClick={() => restock(item.category, item.id)}
              >
                ${item.cost.toFixed(2)}
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="ghost" onClick={() => navigate("restaurant")}>
          Back to Restaurant
        </Button>
      </Panel>
    </div>
  );
}
