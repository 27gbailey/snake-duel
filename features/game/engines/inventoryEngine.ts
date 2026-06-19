import { INGREDIENT_COSTS, TOPPING_CATALOG } from "@/features/game/data/toppings";
import type { GameState, IngredientStock, ToppingId } from "@/features/game/types";

export function getLowStockItems(inventory: IngredientStock): string[] {
  const warnings: string[] = [];

  for (const [id, count] of Object.entries(inventory.dough)) {
    if (count <= 3) warnings.push(`Low dough: ${id}`);
  }
  for (const [id, count] of Object.entries(inventory.sauce)) {
    if (count <= 4) warnings.push(`Low sauce: ${id}`);
  }
  for (const [id, count] of Object.entries(inventory.cheese)) {
    if (count <= 4) warnings.push(`Low cheese: ${id}`);
  }
  for (const [id, count] of Object.entries(inventory.toppings)) {
    if (count <= 5) warnings.push(`Low topping: ${id}`);
  }

  return warnings;
}

export function unlockToppingsForDay(
  current: ToppingId[],
  day: number,
): ToppingId[] {
  const eligible = TOPPING_CATALOG.filter((t) => t.unlockDay <= day).map(
    (t) => t.id,
  );
  return [...new Set([...current, ...eligible])];
}

export function canAffordRestock(cash: number, cost: number): boolean {
  return cash >= cost;
}

export function summarizeInventory(inventory: IngredientStock): {
  totalItems: number;
  toppingCount: number;
} {
  const doughTotal = Object.values(inventory.dough).reduce((a, b) => a + b, 0);
  const sauceTotal = Object.values(inventory.sauce).reduce((a, b) => a + b, 0);
  const cheeseTotal = Object.values(inventory.cheese).reduce((a, b) => a + b, 0);
  const toppingTotal = Object.values(inventory.toppings).reduce((a, b) => a + b, 0);

  return {
    totalItems: doughTotal + sauceTotal + cheeseTotal + toppingTotal,
    toppingCount: toppingTotal,
  };
}

export function getInventoryValue(state: GameState): number {
  const { inventory } = state;
  let value = 0;

  for (const [id, count] of Object.entries(inventory.dough)) {
    value += count * INGREDIENT_COSTS.dough[id as keyof typeof INGREDIENT_COSTS.dough];
  }
  for (const [id, count] of Object.entries(inventory.sauce)) {
    value += count * INGREDIENT_COSTS.sauce[id as keyof typeof INGREDIENT_COSTS.sauce];
  }
  for (const [id, count] of Object.entries(inventory.cheese)) {
    value += count * INGREDIENT_COSTS.cheese[id as keyof typeof INGREDIENT_COSTS.cheese];
  }
  for (const [id, count] of Object.entries(inventory.toppings)) {
    const topping = TOPPING_CATALOG.find((t) => t.id === id);
    value += count * (topping?.cost ?? 0.35);
  }

  return Math.round(value * 100) / 100;
}
