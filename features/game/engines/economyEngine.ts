import { INGREDIENT_COSTS, TOPPING_CATALOG } from "@/features/game/data/toppings";
import type {
  DailyFinances,
  DoughId,
  GameState,
  IngredientStock,
  SauceId,
  ToppingId,
} from "@/features/game/types";

export interface RestockItem {
  category: "dough" | "sauce" | "cheese" | "topping";
  id: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export function calculateRestockCost(items: RestockItem[]): number {
  return items.reduce((sum, item) => sum + item.totalCost, 0);
}

export function getRestockPrice(
  category: RestockItem["category"],
  id: string,
): number {
  switch (category) {
    case "dough":
      return INGREDIENT_COSTS.dough[id as DoughId] * 3;
    case "sauce":
      return INGREDIENT_COSTS.sauce[id as SauceId] * 4;
    case "cheese":
      return INGREDIENT_COSTS.cheese[id as keyof typeof INGREDIENT_COSTS.cheese] * 4;
    case "topping": {
      const topping = TOPPING_CATALOG.find((t) => t.id === id);
      return (topping?.cost ?? 0.35) * 10;
    }
    default:
      return 0;
  }
}

export function restockIngredient(
  inventory: IngredientStock,
  category: RestockItem["category"],
  id: string,
  quantity: number,
): IngredientStock {
  const next = structuredClone(inventory);

  switch (category) {
    case "dough":
      next.dough[id as DoughId] += quantity;
      break;
    case "sauce":
      next.sauce[id as SauceId] += quantity;
      break;
    case "cheese":
      next.cheese[id as keyof typeof next.cheese] += quantity;
      break;
    case "topping":
      next.toppings[id as ToppingId] += quantity;
      break;
  }

  return next;
}

export function recordSale(
  finances: DailyFinances,
  basePrice: number,
  tip: number,
  ingredientCost: number,
): DailyFinances {
  return {
    ...finances,
    revenue: Math.round((finances.revenue + basePrice) * 100) / 100,
    tips: Math.round((finances.tips + tip) * 100) / 100,
    ingredientCosts:
      Math.round((finances.ingredientCosts + ingredientCost) * 100) / 100,
    profit: Math.round(
      (finances.revenue +
        basePrice +
        finances.tips +
        tip -
        finances.ingredientCosts -
        ingredientCost -
        finances.upgradeCosts -
        finances.restockCosts) *
        100,
    ) / 100,
  };
}

export function recordRestock(
  finances: DailyFinances,
  cost: number,
): DailyFinances {
  return {
    ...finances,
    restockCosts: Math.round((finances.restockCosts + cost) * 100) / 100,
    profit: Math.round((finances.profit - cost) * 100) / 100,
  };
}

export function recordUpgradePurchase(
  finances: DailyFinances,
  cost: number,
): DailyFinances {
  return {
    ...finances,
    upgradeCosts: Math.round((finances.upgradeCosts + cost) * 100) / 100,
    profit: Math.round((finances.profit - cost) * 100) / 100,
  };
}

export function finalizeDayProfit(finances: DailyFinances): number {
  return Math.round(
    (finances.revenue + finances.tips - finances.ingredientCosts - finances.upgradeCosts - finances.restockCosts) *
      100,
  ) / 100;
}

export function getTipBonus(state: GameState): number {
  const brickOven = state.upgrades.find((u) => u.id === "brick-oven" && u.purchased);
  return brickOven ? 0.2 : 0;
}

export function getCustomerBonus(state: GameState): number {
  const neon = state.upgrades.find((u) => u.id === "neon-sign" && u.purchased);
  return neon ? 2 : 0;
}

export function getDoughDiscount(state: GameState): number {
  const mixer = state.upgrades.find((u) => u.id === "dough-mixer" && u.purchased);
  return mixer ? 0.15 : 0;
}

export function applyDoughDiscount(cost: number, discount: number): number {
  return Math.round(cost * (1 - discount) * 100) / 100;
}
