/** Core identifiers — extend via data files without code changes. */
export type ToppingId =
  | "pepperoni"
  | "sausage"
  | "mushroom"
  | "onion"
  | "olive"
  | "bell-pepper"
  | "bacon"
  | "ham";

export type SauceId = "marinara" | "alfredo" | "pesto" | "bbq";
export type CheeseId = "mozzarella" | "cheddar" | "parmesan" | "vegan";
export type DoughId = "thin" | "regular" | "thick" | "gluten-free";

/** Eight slices clockwise from top (0 = 12 o'clock). */
export type SliceIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type PizzaRegion =
  | "all"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type CustomerPersonality =
  | "patient"
  | "impatient"
  | "picky"
  | "generous"
  | "quiet";

export type OrderComplexity = "simple" | "moderate" | "complex";

export type GameScreen =
  | "menu"
  | "restaurant"
  | "prep"
  | "oven"
  | "cut"
  | "shop"
  | "upgrades"
  | "inventory"
  | "summary"
  | "statistics"
  | "settings";

export type DayPhase = "serving" | "summary" | "closed";

export type PizzaStage = "prep" | "baking" | "cutting" | "ready" | "served";

export interface ToppingDefinition {
  id: ToppingId;
  name: string;
  cost: number;
  unlockDay: number;
  color: string;
}

export interface IngredientStock {
  dough: Record<DoughId, number>;
  sauce: Record<SauceId, number>;
  cheese: Record<CheeseId, number>;
  toppings: Record<ToppingId, number>;
}

export interface SliceState {
  sauce: SauceId | null;
  cheese: boolean;
  toppings: ToppingId[];
}

export interface PizzaBuild {
  dough: DoughId | null;
  slices: SliceState[];
  stage: PizzaStage;
  bakeProgress: number;
  bakeTarget: number;
  cut: boolean;
}

export interface RegionRequirement {
  region: PizzaRegion;
  sauce?: SauceId | null;
  cheese?: boolean;
  toppings?: ToppingId[];
  noCheese?: boolean;
}

export interface PizzaOrder {
  id: string;
  description: string;
  dough: DoughId;
  requirements: RegionRequirement[];
  basePrice: number;
  complexity: OrderComplexity;
  specialRequests: string[];
}

export interface Customer {
  id: string;
  name: string;
  personality: CustomerPersonality;
  patience: number;
  maxPatience: number;
  order: PizzaOrder;
  dialogue: string;
  arrivedAt: number;
  served: boolean;
  satisfaction: number | null;
  tip: number | null;
}

export interface DailyObjective {
  id: string;
  label: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  category: "equipment" | "restaurant" | "decoration";
  cost: number;
  unlockDay: number;
  effect: string;
  purchased: boolean;
}

export interface DailyFinances {
  revenue: number;
  tips: number;
  ingredientCosts: number;
  upgradeCosts: number;
  restockCosts: number;
  profit: number;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  day: number;
}

export interface DayState {
  day: number;
  phase: DayPhase;
  customersServed: number;
  customersTarget: number;
  customers: Customer[];
  activeCustomerId: string | null;
  finances: DailyFinances;
  objectives: DailyObjective[];
  isSpecialEvent: boolean;
  specialEventName: string | null;
}

export interface RestaurantStats {
  totalRevenue: number;
  totalProfit: number;
  totalCustomersServed: number;
  averageRating: number;
  bestDayProfit: number;
  daysPlayed: number;
  perfectOrders: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
}

export interface GameState {
  version: number;
  cash: number;
  reputation: number;
  rating: number;
  inventory: IngredientStock;
  upgrades: UpgradeDefinition[];
  achievements: Achievement[];
  unlockedToppings: ToppingId[];
  unlockedDecorations: string[];
  currentScreen: GameScreen;
  day: DayState;
  activePizza: PizzaBuild | null;
  stats: RestaurantStats;
  reviews: Review[];
  settings: GameSettings;
  lastSavedAt: number | null;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: string[];
  matchedRequirements: number;
  totalRequirements: number;
}

export interface SavePayload {
  state: GameState;
  savedAt: number;
}
