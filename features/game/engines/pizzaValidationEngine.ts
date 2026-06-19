import { getSlicesForRegion } from "@/features/game/data/regions";
import type {
  PizzaBuild,
  PizzaOrder,
  RegionRequirement,
  SliceIndex,
  SliceState,
  ValidationResult,
} from "@/features/game/types";

function sliceMatchesRequirement(
  slice: SliceState,
  requirement: RegionRequirement,
): { matched: boolean; issues: string[] } {
  const issues: string[] = [];
  let matched = true;

  if (requirement.sauce !== undefined) {
    if (requirement.sauce === null && slice.sauce !== null) {
      issues.push("Slice should have no sauce");
      matched = false;
    } else if (requirement.sauce && slice.sauce !== requirement.sauce) {
      issues.push(`Expected ${requirement.sauce} sauce`);
      matched = false;
    }
  }

  if (requirement.noCheese) {
    if (slice.cheese) {
      issues.push("Should have no cheese");
      matched = false;
    }
  } else if (requirement.cheese === true && !slice.cheese) {
    issues.push("Missing cheese");
    matched = false;
  } else if (requirement.cheese === false && slice.cheese) {
    issues.push("Should have no cheese");
    matched = false;
  }

  if (requirement.toppings) {
    for (const topping of requirement.toppings) {
      if (!slice.toppings.includes(topping)) {
        issues.push(`Missing ${topping}`);
        matched = false;
      }
    }

    const extra = slice.toppings.filter((t) => !requirement.toppings!.includes(t));
    if (extra.length > 0 && requirement.toppings.length > 0) {
      issues.push(`Unexpected toppings: ${extra.join(", ")}`);
      matched = false;
    }
  }

  return { matched, issues };
}

function validateDough(pizza: PizzaBuild, order: PizzaOrder): string[] {
  if (!pizza.dough) {
    return ["No dough selected"];
  }
  if (pizza.dough !== order.dough) {
    return [`Expected ${order.dough} crust, got ${pizza.dough}`];
  }
  return [];
}

function validateCut(pizza: PizzaBuild): string[] {
  if (!pizza.cut) {
    return ["Pizza must be cut before serving"];
  }
  return [];
}

/**
 * Pizza validation engine — scores how well a built pizza matches the order.
 * Returns 0–1 score used for satisfaction and tips.
 */
export function validatePizzaAgainstOrder(
  pizza: PizzaBuild,
  order: PizzaOrder,
): ValidationResult {
  const issues: string[] = [...validateDough(pizza, order), ...validateCut(pizza)];

  if (pizza.stage !== "ready" && pizza.stage !== "served") {
    issues.push("Pizza is not finished");
  }

  let matchedRequirements = 0;
  const totalRequirements = order.requirements.length;

  for (const requirement of order.requirements) {
    const sliceIndices = getSlicesForRegion(requirement.region);
    const sliceResults = sliceIndices.map((index) =>
      sliceMatchesRequirement(pizza.slices[index as SliceIndex], requirement),
    );

    const allMatched = sliceResults.every((r) => r.matched);
    if (allMatched) {
      matchedRequirements += 1;
    } else {
      for (const result of sliceResults) {
        issues.push(...result.issues);
      }
    }
  }

  const requirementScore =
    totalRequirements > 0 ? matchedRequirements / totalRequirements : 0;
  const doughPenalty = validateDough(pizza, order).length > 0 ? 0.2 : 0;
  const cutPenalty = validateCut(pizza).length > 0 ? 0.15 : 0;
  const stagePenalty = pizza.stage !== "ready" && pizza.stage !== "served" ? 0.25 : 0;

  const score = Math.max(
    0,
    Math.min(1, requirementScore - doughPenalty - cutPenalty - stagePenalty),
  );

  return {
    valid: score >= 0.85 && issues.length === 0,
    score: Math.round(score * 100) / 100,
    issues: [...new Set(issues)],
    matchedRequirements,
    totalRequirements,
  };
}

export function applySauceToRegion(
  pizza: PizzaBuild,
  region: RegionRequirement["region"],
  sauce: SliceState["sauce"],
): PizzaBuild {
  const slices = [...pizza.slices];
  for (const index of getSlicesForRegion(region)) {
    slices[index] = { ...slices[index], sauce };
  }
  return { ...pizza, slices };
}

export function applyCheeseToRegion(
  pizza: PizzaBuild,
  region: RegionRequirement["region"],
  cheese: boolean,
): PizzaBuild {
  const slices = [...pizza.slices];
  for (const index of getSlicesForRegion(region)) {
    slices[index] = { ...slices[index], cheese };
  }
  return { ...pizza, slices };
}

export function toggleToppingOnRegion(
  pizza: PizzaBuild,
  region: RegionRequirement["region"],
  topping: SliceState["toppings"][number],
): PizzaBuild {
  const slices = [...pizza.slices];
  for (const index of getSlicesForRegion(region)) {
    const current = slices[index];
    const has = current.toppings.includes(topping);
    slices[index] = {
      ...current,
      toppings: has
        ? current.toppings.filter((t) => t !== topping)
        : [...current.toppings, topping],
    };
  }
  return { ...pizza, slices };
}
