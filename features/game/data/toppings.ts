import type { ToppingDefinition } from "@/features/game/types";

/** Configurable topping catalog — add entries here to extend the game. */
export const TOPPING_CATALOG: ToppingDefinition[] = [
  { id: "pepperoni", name: "Pepperoni", cost: 0.35, unlockDay: 1, color: "#c0392b" },
  { id: "sausage", name: "Sausage", cost: 0.4, unlockDay: 1, color: "#8b4513" },
  { id: "mushroom", name: "Mushroom", cost: 0.3, unlockDay: 1, color: "#a0826d" },
  { id: "onion", name: "Onion", cost: 0.25, unlockDay: 1, color: "#e8d5b7" },
  { id: "olive", name: "Olive", cost: 0.28, unlockDay: 2, color: "#2d5016" },
  { id: "bell-pepper", name: "Bell Pepper", cost: 0.32, unlockDay: 3, color: "#27ae60" },
  { id: "bacon", name: "Bacon", cost: 0.45, unlockDay: 4, color: "#d35400" },
  { id: "ham", name: "Ham", cost: 0.42, unlockDay: 5, color: "#f1948a" },
];

export const INGREDIENT_COSTS = {
  dough: { thin: 0.5, regular: 0.6, thick: 0.75, "gluten-free": 1.1 } as const,
  sauce: { marinara: 0.3, alfredo: 0.45, pesto: 0.5, bbq: 0.4 } as const,
  cheese: { mozzarella: 0.55, cheddar: 0.5, parmesan: 0.65, vegan: 0.7 } as const,
};
