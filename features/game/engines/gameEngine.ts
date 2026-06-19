import { INGREDIENT_COSTS, TOPPING_CATALOG } from "@/features/game/data/toppings";
import type {
  DoughId,
  GameState,
  IngredientStock,
  PizzaBuild,
  SliceState,
  ToppingId,
} from "@/features/game/types";

export const GAME_VERSION = 1;
export const STARTING_CASH = 120;
export const STARTING_REPUTATION = 50;
export const STARTING_RATING = 3.5;
export const BASE_BAKE_TIME = 8;
export const PATIENCE_TICK_MS = 1000;

export function createEmptySlice(): SliceState {
  return { sauce: null, cheese: false, toppings: [] };
}

export function createEmptyPizza(): PizzaBuild {
  return {
    dough: null,
    slices: Array.from({ length: 8 }, createEmptySlice),
    stage: "prep",
    bakeProgress: 0,
    bakeTarget: BASE_BAKE_TIME,
    cut: false,
  };
}

export function createStarterInventory(): IngredientStock {
  return {
    dough: { thin: 10, regular: 15, thick: 8, "gluten-free": 4 },
    sauce: { marinara: 20, alfredo: 8, pesto: 6, bbq: 6 },
    cheese: { mozzarella: 20, cheddar: 10, parmesan: 8, vegan: 5 },
    toppings: {
      pepperoni: 30,
      sausage: 20,
      mushroom: 25,
      onion: 25,
      olive: 15,
      "bell-pepper": 12,
      bacon: 10,
      ham: 10,
    },
  };
}

export function getBakeTarget(state: GameState): number {
  const hasFastOven = state.upgrades.some(
    (u) => u.id === "fast-oven" && u.purchased,
  );
  return hasFastOven ? Math.ceil(BASE_BAKE_TIME * 0.75) : BASE_BAKE_TIME;
}

export function estimateIngredientCost(pizza: PizzaBuild): number {
  if (!pizza.dough) {
    return 0;
  }

  let cost = INGREDIENT_COSTS.dough[pizza.dough];

  for (const slice of pizza.slices) {
    if (slice.sauce) {
      cost += INGREDIENT_COSTS.sauce[slice.sauce];
    }
    if (slice.cheese) {
      cost += INGREDIENT_COSTS.cheese.mozzarella;
    }
    for (const topping of slice.toppings) {
      const catalog = TOPPING_CATALOG.find((t) => t.id === topping);
      cost += catalog?.cost ?? 0.35;
    }
  }

  return Math.round(cost * 100) / 100;
}

export function deductPizzaIngredients(
  inventory: IngredientStock,
  pizza: PizzaBuild,
): IngredientStock {
  const next = structuredClone(inventory);

  if (pizza.dough) {
    next.dough[pizza.dough] = Math.max(0, next.dough[pizza.dough] - 1);
  }

  for (const slice of pizza.slices) {
    if (slice.sauce) {
      next.sauce[slice.sauce] = Math.max(0, next.sauce[slice.sauce] - 1);
    }
    if (slice.cheese) {
      next.cheese.mozzarella = Math.max(0, next.cheese.mozzarella - 1);
    }
    for (const topping of slice.toppings) {
      next.toppings[topping] = Math.max(0, next.toppings[topping] - 1);
    }
  }

  return next;
}

export function hasIngredientsForPizza(
  inventory: IngredientStock,
  dough: DoughId,
): boolean {
  return inventory.dough[dough] > 0;
}

export function getUnlockedToppingsForDay(day: number): ToppingId[] {
  return TOPPING_CATALOG.filter((t) => t.unlockDay <= day).map((t) => t.id);
}
