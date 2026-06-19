import {
  CUSTOMER_NAMES,
  GREETINGS,
  ORDER_TEMPLATES,
  REVIEW_COMMENTS,
} from "@/features/game/data/dialogue";
import { getSlicesForRegion } from "@/features/game/data/regions";
import type {
  Customer,
  CustomerPersonality,
  DoughId,
  OrderComplexity,
  PizzaOrder,
  RegionRequirement,
  SauceId,
  ToppingId,
} from "@/features/game/types";

const PERSONALITIES: CustomerPersonality[] = [
  "patient",
  "impatient",
  "picky",
  "generous",
  "quiet",
];

const PERSONALITY_PATIENCE: Record<CustomerPersonality, number> = {
  patient: 90,
  impatient: 45,
  picky: 70,
  generous: 75,
  quiet: 60,
};

let customerCounter = 0;

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomId(prefix: string): string {
  customerCounter += 1;
  return `${prefix}-${Date.now()}-${customerCounter}`;
}

function parseOrderDescription(
  description: string,
  day: number,
): { requirements: RegionRequirement[]; dough: DoughId; complexity: OrderComplexity } {
  const lower = description.toLowerCase();
  const dough: DoughId = lower.includes("thick") ? "thick" : "regular";

  if (
    lower.includes("half") ||
    lower.includes("quarter") ||
    lower.includes("left") ||
    lower.includes("right")
  ) {
    return parseComplexOrder(lower, dough);
  }

  const toppings = extractToppings(lower);
  const noCheese = lower.includes("no cheese");

  return {
    dough,
    complexity: toppings.length > 1 ? "moderate" : "simple",
    requirements: [
      {
        region: "all",
        sauce: "marinara",
        cheese: !noCheese,
        noCheese,
        toppings,
      },
    ],
  };
}

function parseComplexOrder(
  lower: string,
  dough: DoughId,
): { requirements: RegionRequirement[]; dough: DoughId; complexity: OrderComplexity } {
  const requirements: RegionRequirement[] = [];

  if (lower.includes("half mushroom") && lower.includes("half onion")) {
    const noCheeseMushroom = lower.includes("no cheese");
    requirements.push(
      {
        region: "left",
        sauce: "marinara",
        cheese: !noCheeseMushroom,
        noCheese: noCheeseMushroom,
        toppings: ["mushroom"],
      },
      {
        region: "right",
        sauce: "marinara",
        cheese: true,
        toppings: ["onion"],
      },
    );
  } else if (lower.includes("left half pepperoni")) {
    requirements.push(
      { region: "left", sauce: "marinara", cheese: true, toppings: ["pepperoni"] },
      { region: "right", sauce: "marinara", cheese: true, toppings: ["sausage"] },
    );
  } else if (lower.includes("top half")) {
    requirements.push(
      {
        region: "top",
        sauce: "marinara",
        cheese: true,
        toppings: ["mushroom", "onion", "bell-pepper"],
      },
      {
        region: "bottom",
        sauce: "marinara",
        cheese: true,
        toppings: ["pepperoni", "sausage", "bacon"],
      },
    );
  } else if (lower.includes("quarter")) {
    requirements.push(
      { region: "top-left", sauce: "marinara", cheese: true, toppings: ["olive"] },
      { region: "top-right", sauce: "marinara", cheese: true, toppings: ["onion"] },
      { region: "bottom-left", sauce: "marinara", cheese: true, toppings: [] },
      { region: "bottom-right", sauce: "marinara", cheese: true, toppings: [] },
    );
  } else {
    requirements.push({
      region: "all",
      sauce: "marinara",
      cheese: true,
      toppings: extractToppings(lower),
    });
  }

  return { requirements, dough, complexity: "complex" };
}

function extractToppings(text: string): ToppingId[] {
  const map: Record<string, ToppingId> = {
    pepperoni: "pepperoni",
    sausage: "sausage",
    mushroom: "mushroom",
    onion: "onion",
    olive: "olive",
    "bell pepper": "bell-pepper",
    bacon: "bacon",
    ham: "ham",
  };

  const found: ToppingId[] = [];
  for (const [phrase, id] of Object.entries(map)) {
    if (text.includes(phrase)) {
      found.push(id);
    }
  }

  if (text.includes("cheese pizza") && found.length === 0) {
    return [];
  }

  return found.length > 0 ? found : ["pepperoni"];
}

export function generateOrder(day: number): PizzaOrder {
  const complexityRoll = Math.random();
  let complexity: OrderComplexity = "simple";

  if (day >= 5 && complexityRoll > 0.55) {
    complexity = "complex";
  } else if (day >= 2 && complexityRoll > 0.35) {
    complexity = "moderate";
  }

  const description = randomItem(ORDER_TEMPLATES[complexity]);
  const parsed = parseOrderDescription(description, day);
  const basePrice = 8 + parsed.requirements.length * 2 + day * 0.5;

  return {
    id: randomId("order"),
    description,
    dough: parsed.dough,
    requirements: parsed.requirements,
    basePrice: Math.round(basePrice * 100) / 100,
    complexity: parsed.complexity,
    specialRequests:
      parsed.complexity === "complex"
        ? ["Please follow the half-and-half layout carefully."]
        : [],
  };
}

export function generateCustomer(day: number, tick: number): Customer {
  const personality = randomItem(PERSONALITIES);
  const maxPatience = PERSONALITY_PATIENCE[personality];
  const order = generateOrder(day);

  return {
    id: randomId("customer"),
    name: randomItem(CUSTOMER_NAMES),
    personality,
    patience: maxPatience,
    maxPatience,
    order,
    dialogue: randomItem(GREETINGS[personality]),
    arrivedAt: tick,
    served: false,
    satisfaction: null,
    tip: null,
  };
}

export function tickCustomerPatience(
  customer: Customer,
  deltaSeconds: number,
): Customer {
  if (customer.served) {
    return customer;
  }

  const drain =
    customer.personality === "impatient"
      ? deltaSeconds * 1.5
      : customer.personality === "patient"
        ? deltaSeconds * 0.7
        : deltaSeconds;

  return {
    ...customer,
    patience: Math.max(0, customer.patience - drain),
  };
}

export function calculateSatisfaction(
  customer: Customer,
  validationScore: number,
): number {
  const patienceRatio = customer.patience / customer.maxPatience;
  const accuracyWeight = validationScore * 0.7;
  const patienceWeight = patienceRatio * 0.3;
  return Math.min(1, Math.max(0, accuracyWeight + patienceWeight));
}

export function calculateTip(
  customer: Customer,
  satisfaction: number,
  basePrice: number,
  tipBonus: number,
): number {
  const personalityMultiplier =
    customer.personality === "generous"
      ? 1.4
      : customer.personality === "impatient"
        ? 0.8
        : 1;

  const tip = basePrice * satisfaction * 0.25 * personalityMultiplier * (1 + tipBonus);
  return Math.round(tip * 100) / 100;
}

export function generateReview(
  customerName: string,
  satisfaction: number,
  day: number,
): { rating: number; comment: string } {
  let bucket: keyof typeof REVIEW_COMMENTS;
  let rating: number;

  if (satisfaction >= 0.9) {
    bucket = "great";
    rating = 5;
  } else if (satisfaction >= 0.7) {
    bucket = "good";
    rating = 4;
  } else if (satisfaction >= 0.45) {
    bucket = "okay";
    rating = 3;
  } else {
    bucket = "bad";
    rating = satisfaction > 0.2 ? 2 : 1;
  }

  return {
    rating,
    comment: `${randomItem(REVIEW_COMMENTS[bucket])} (Day ${day})`,
  };
}

export function getCustomersPerDay(day: number, customerBonus: number): number {
  return Math.min(20, 4 + Math.floor(day * 1.2) + customerBonus);
}

export function isSpecialEventDay(day: number): { active: boolean; name: string | null } {
  if (day % 7 === 0) {
    return { active: true, name: "Friday Night Rush" };
  }
  if (day % 5 === 0) {
    return { active: true, name: "Lunch Crowd" };
  }
  return { active: false, name: null };
}

/** Order generation engine — builds structured requirements from natural language. */
export function buildOrderFromText(text: string, day: number): PizzaOrder {
  const parsed = parseOrderDescription(text, day);
  return {
    id: randomId("order"),
    description: text,
    dough: parsed.dough,
    requirements: parsed.requirements,
    basePrice: 10 + day,
    complexity: parsed.complexity,
    specialRequests: [],
  };
}

export function getRequirementSlices(requirement: RegionRequirement) {
  return getSlicesForRegion(requirement.region);
}
