import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkAchievements, createInitialAchievements } from "@/features/game/engines/achievementSystem";
import {
  calculateSatisfaction,
  calculateTip,
  generateCustomer,
  generateReview,
  getCustomersPerDay,
  isSpecialEventDay,
  tickCustomerPatience,
} from "@/features/game/engines/customerEngine";
import {
  applyDoughDiscount,
  finalizeDayProfit,
  getCustomerBonus,
  getDoughDiscount,
  getRestockPrice,
  getTipBonus,
  recordRestock,
  recordSale,
  recordUpgradePurchase,
  restockIngredient,
} from "@/features/game/engines/economyEngine";
import {
  createEmptyPizza,
  createStarterInventory,
  deductPizzaIngredients,
  estimateIngredientCost,
  GAME_VERSION,
  getBakeTarget,
  hasIngredientsForPizza,
  STARTING_CASH,
  STARTING_RATING,
  STARTING_REPUTATION,
} from "@/features/game/engines/gameEngine";
import { unlockToppingsForDay } from "@/features/game/engines/inventoryEngine";
import {
  applyCheeseToRegion,
  applySauceToRegion,
  toggleToppingOnRegion,
  validatePizzaAgainstOrder,
} from "@/features/game/engines/pizzaValidationEngine";
import { createInitialUpgrades, purchaseUpgrade } from "@/features/game/engines/upgradeSystem";
import type {
  DailyFinances,
  DailyObjective,
  DoughId,
  GameScreen,
  GameState,
  PizzaBuild,
  PizzaRegion,
  Review,
  SauceId,
  ToppingId,
} from "@/features/game/types";

function createDailyObjectives(day: number): DailyObjective[] {
  const customers = getCustomersPerDay(day, 0);
  return [
    {
      id: "serve-customers",
      label: `Serve ${customers} customers`,
      target: customers,
      progress: 0,
      reward: 25 + day * 5,
      completed: false,
    },
    {
      id: "earn-profit",
      label: "Earn $30 profit today",
      target: 30,
      progress: 0,
      reward: 20,
      completed: false,
    },
    {
      id: "high-rating",
      label: "Keep average rating above 4.0",
      target: 4,
      progress: 0,
      reward: 15,
      completed: false,
    },
  ];
}

function createEmptyFinances(): DailyFinances {
  return {
    revenue: 0,
    tips: 0,
    ingredientCosts: 0,
    upgradeCosts: 0,
    restockCosts: 0,
    profit: 0,
  };
}

export function createInitialState(): GameState {
  const event = isSpecialEventDay(1);
  const customerBonus = 0;
  const customersTarget = getCustomersPerDay(1, customerBonus);

  return {
    version: GAME_VERSION,
    cash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    rating: STARTING_RATING,
    inventory: createStarterInventory(),
    upgrades: createInitialUpgrades(),
    achievements: createInitialAchievements(),
    unlockedToppings: ["pepperoni", "sausage", "mushroom", "onion"],
    unlockedDecorations: [],
    currentScreen: "menu",
    activePizza: null,
    stats: {
      totalRevenue: 0,
      totalProfit: 0,
      totalCustomersServed: 0,
      averageRating: STARTING_RATING,
      bestDayProfit: 0,
      daysPlayed: 0,
      perfectOrders: 0,
    },
    reviews: [],
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      reducedMotion: false,
    },
    lastSavedAt: null,
    day: {
      day: 1,
      phase: "serving",
      customersServed: 0,
      customersTarget,
      customers: [],
      activeCustomerId: null,
      finances: createEmptyFinances(),
      objectives: createDailyObjectives(1),
      isSpecialEvent: event.active,
      specialEventName: event.name,
    },
  };
}

function spawnNextCustomer(state: GameState): GameState {
  const { day } = state.day;
  const customer = generateCustomer(day, Date.now());

  return {
    ...state,
    day: {
      ...state.day,
      customers: [...state.day.customers, customer],
      activeCustomerId: state.day.activeCustomerId ?? customer.id,
    },
  };
}

function updateObjectives(
  objectives: DailyObjective[],
  finances: DailyFinances,
  customersServed: number,
  rating: number,
): DailyObjective[] {
  return objectives.map((obj) => {
    if (obj.id === "serve-customers") {
      const progress = customersServed;
      return { ...obj, progress, completed: progress >= obj.target };
    }
    if (obj.id === "earn-profit") {
      const progress = Math.max(0, finalizeDayProfit(finances));
      return { ...obj, progress, completed: progress >= obj.target };
    }
    if (obj.id === "high-rating") {
      return { ...obj, progress: rating, completed: rating >= obj.target };
    }
    return obj;
  });
}

interface GameActions {
  navigate: (screen: GameScreen) => void;
  startNewGame: () => void;
  startDay: () => void;
  tick: (deltaSeconds: number) => void;
  beginPrep: () => void;
  setDough: (dough: DoughId) => void;
  applySauce: (region: PizzaRegion, sauce: SauceId | null) => void;
  applyCheese: (region: PizzaRegion, cheese: boolean) => void;
  toggleTopping: (region: PizzaRegion, topping: ToppingId) => void;
  sendToOven: () => void;
  advanceBake: (amount: number) => void;
  finishBaking: () => void;
  cutPizza: () => void;
  servePizza: () => void;
  endDay: () => void;
  nextDay: () => void;
  buyUpgrade: (id: string) => void;
  restock: (category: "dough" | "sauce" | "cheese" | "topping", id: string) => void;
  updateSettings: (settings: Partial<GameState["settings"]>) => void;
  resetSave: () => void;
}

type GameStore = GameState & GameActions;

function extractGameState(store: GameStore): GameState {
  const {
    navigate,
    startNewGame,
    startDay,
    tick,
    beginPrep,
    setDough,
    applySauce,
    applyCheese,
    toggleTopping,
    sendToOven,
    advanceBake,
    finishBaking,
    cutPizza,
    servePizza,
    endDay,
    nextDay,
    buyUpgrade,
    restock,
    updateSettings,
    resetSave,
    ...gameState
  } = store;
  void navigate;
  void startNewGame;
  void startDay;
  void tick;
  void beginPrep;
  void setDough;
  void applySauce;
  void applyCheese;
  void toggleTopping;
  void sendToOven;
  void advanceBake;
  void finishBaking;
  void cutPizza;
  void servePizza;
  void endDay;
  void nextDay;
  void buyUpgrade;
  void restock;
  void updateSettings;
  void resetSave;
  return gameState;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      navigate: (screen) => set({ currentScreen: screen }),

      startNewGame: () => set(createInitialState()),

      startDay: () => {
        const state = get();
        let gameState = extractGameState(state);
        gameState = {
          ...gameState,
          currentScreen: "restaurant",
          day: { ...gameState.day, phase: "serving" },
        };

        if (gameState.day.customers.length === 0) {
          gameState = spawnNextCustomer(gameState);
        }

        set(gameState);
      },

      tick: (deltaSeconds) => {
        const state = get();
        if (state.currentScreen !== "restaurant" || state.day.phase !== "serving") {
          return;
        }

        const customers = state.day.customers.map((c) =>
          tickCustomerPatience(c, deltaSeconds),
        );

        set({
          day: { ...state.day, customers },
        });
      },

      beginPrep: () => {
        const state = get();
        const customer = state.day.customers.find(
          (c) => c.id === state.day.activeCustomerId && !c.served,
        );
        if (!customer) return;

        if (!hasIngredientsForPizza(state.inventory, customer.order.dough)) {
          return;
        }

        const pizza = createEmptyPizza();
        pizza.dough = customer.order.dough;
        pizza.bakeTarget = getBakeTarget(state);

        set({
          activePizza: pizza,
          currentScreen: "prep",
        });
      },

      setDough: (dough) => {
        const pizza = get().activePizza;
        if (!pizza) return;
        set({ activePizza: { ...pizza, dough } });
      },

      applySauce: (region, sauce) => {
        const pizza = get().activePizza;
        if (!pizza) return;
        set({ activePizza: applySauceToRegion(pizza, region, sauce) });
      },

      applyCheese: (region, cheese) => {
        const pizza = get().activePizza;
        if (!pizza) return;
        set({ activePizza: applyCheeseToRegion(pizza, region, cheese) });
      },

      toggleTopping: (region, topping) => {
        const pizza = get().activePizza;
        if (!pizza) return;
        set({ activePizza: toggleToppingOnRegion(pizza, region, topping) });
      },

      sendToOven: () => {
        const pizza = get().activePizza;
        if (!pizza?.dough) return;
        set({
          activePizza: { ...pizza, stage: "baking", bakeProgress: 0 },
          currentScreen: "oven",
        });
      },

      advanceBake: (amount) => {
        const state = get();
        const pizza = state.activePizza;
        if (!pizza || pizza.stage !== "baking") return;

        const bakeProgress = pizza.bakeProgress + amount;
        if (bakeProgress >= pizza.bakeTarget) {
          set({
            activePizza: {
              ...pizza,
              bakeProgress: pizza.bakeTarget,
              stage: "cutting",
            },
            currentScreen: "cut",
          });
        } else {
          set({ activePizza: { ...pizza, bakeProgress } });
        }
      },

      finishBaking: () => {
        const pizza = get().activePizza;
        if (!pizza) return;
        set({
          activePizza: { ...pizza, stage: "cutting", bakeProgress: pizza.bakeTarget },
          currentScreen: "cut",
        });
      },

      cutPizza: () => {
        const pizza = get().activePizza;
        if (!pizza) return;
        set({
          activePizza: { ...pizza, cut: true, stage: "ready" },
        });
      },

      servePizza: () => {
        const state = get();
        const pizza = state.activePizza;
        const customer = state.day.customers.find(
          (c) => c.id === state.day.activeCustomerId && !c.served,
        );
        if (!pizza || !customer) return;

        const validation = validatePizzaAgainstOrder(pizza, customer.order);
        const satisfaction = calculateSatisfaction(customer, validation.score);
        const tipBonus = getTipBonus(state);
        const tip = calculateTip(customer, satisfaction, customer.order.basePrice, tipBonus);
        const ingredientCost = estimateIngredientCost(pizza);

        const servedCustomer = {
          ...customer,
          served: true,
          satisfaction,
          tip,
        };

        const customers = state.day.customers.map((c) =>
          c.id === customer.id ? servedCustomer : c,
        );

        const finances = recordSale(
          state.day.finances,
          customer.order.basePrice,
          tip,
          ingredientCost,
        );

        const reviewData = generateReview(customer.name, satisfaction, state.day.day);
        const review: Review = {
          id: `review-${Date.now()}`,
          customerName: customer.name,
          rating: reviewData.rating,
          comment: reviewData.comment,
          day: state.day.day,
        };

        const newRating =
          state.reviews.length === 0
            ? reviewData.rating
            : Math.round(
                ((state.rating * state.reviews.length + reviewData.rating) /
                  (state.reviews.length + 1)) *
                  100,
              ) / 100;

        const customersServed = state.day.customersServed + 1;
        const remaining = customers.filter((c) => !c.served);
        const nextActive = remaining[0]?.id ?? null;

        let nextState: GameState = {
          ...state,
          cash: Math.round((state.cash + customer.order.basePrice + tip) * 100) / 100,
          rating: newRating,
          reputation: Math.min(
            100,
            Math.round((state.reputation + satisfaction * 5) * 100) / 100,
          ),
          inventory: deductPizzaIngredients(state.inventory, pizza),
          activePizza: null,
          reviews: [review, ...state.reviews].slice(0, 50),
          stats: {
            ...state.stats,
            totalRevenue: state.stats.totalRevenue + customer.order.basePrice,
            totalCustomersServed: state.stats.totalCustomersServed + 1,
            perfectOrders:
              validation.score >= 0.95
                ? state.stats.perfectOrders + 1
                : state.stats.perfectOrders,
            averageRating: newRating,
          },
          day: {
            ...state.day,
            customers,
            customersServed,
            activeCustomerId: nextActive,
            finances,
            objectives: updateObjectives(
              state.day.objectives,
              finances,
              customersServed,
              newRating,
            ),
          },
          currentScreen: "restaurant",
        };

        if (customersServed < state.day.customersTarget && !nextActive) {
          nextState = spawnNextCustomer(nextState);
        }

        if (customersServed >= state.day.customersTarget) {
          nextState = {
            ...nextState,
            day: { ...nextState.day, phase: "summary" },
            currentScreen: "summary",
          };
        }

        nextState = checkAchievements(nextState, {
          validationScore: validation.score,
          orderComplexity: customer.order.complexity,
          dayTips: finances.tips,
        });

        set(nextState);
      },

      endDay: () => {
        const state = get();
        const profit = finalizeDayProfit(state.day.finances);
        set({
          day: { ...state.day, phase: "summary" },
          currentScreen: "summary",
          stats: {
            ...state.stats,
            bestDayProfit: Math.max(state.stats.bestDayProfit, profit),
          },
        });
      },

      nextDay: () => {
        const state = get();
        const nextDayNum = state.day.day + 1;
        const customerBonus = getCustomerBonus(state);
        const event = isSpecialEventDay(nextDayNum);
        const objectiveBonus = state.day.objectives
          .filter((o) => o.completed)
          .reduce((sum, o) => sum + o.reward, 0);

        set({
          ...state,
          cash: state.cash + objectiveBonus,
          unlockedToppings: unlockToppingsForDay(state.unlockedToppings, nextDayNum),
          currentScreen: "restaurant",
          day: {
            day: nextDayNum,
            phase: "serving",
            customersServed: 0,
            customersTarget: getCustomersPerDay(nextDayNum, customerBonus),
            customers: [],
            activeCustomerId: null,
            finances: createEmptyFinances(),
            objectives: createDailyObjectives(nextDayNum),
            isSpecialEvent: event.active,
            specialEventName: event.name,
          },
          stats: {
            ...state.stats,
            daysPlayed: state.stats.daysPlayed + 1,
            totalProfit: state.stats.totalProfit + finalizeDayProfit(state.day.finances),
          },
        });

        const after = get();
        set(spawnNextCustomer(extractGameState(after)));
      },

      buyUpgrade: (id) => {
        const updated = purchaseUpgrade(get(), id);
        if (updated) set(updated);
      },

      restock: (category, id) => {
        const state = get();
        const cost = getRestockPrice(category, id);
        const discount = getDoughDiscount(state);
        const finalCost =
          category === "dough" ? applyDoughDiscount(cost, discount) : cost;

        if (state.cash < finalCost) return;

        const quantity = category === "topping" ? 10 : category === "dough" ? 5 : 8;

        set({
          cash: Math.round((state.cash - finalCost) * 100) / 100,
          inventory: restockIngredient(state.inventory, category, id, quantity),
          day: {
            ...state.day,
            finances: recordRestock(state.day.finances, finalCost),
          },
        });
      },

      updateSettings: (settings) => {
        set({ settings: { ...get().settings, ...settings } });
      },

      resetSave: () => set(createInitialState()),
    }),
    {
      name: "pizza-restaurant-save",
      partialize: (state) => {
        const { navigate, startNewGame, startDay, tick, beginPrep, setDough, applySauce, applyCheese, toggleTopping, sendToOven, advanceBake, finishBaking, cutPizza, servePizza, endDay, nextDay, buyUpgrade, restock, updateSettings, resetSave, ...persisted } = state;
        void navigate; void startNewGame; void startDay; void tick; void beginPrep; void setDough; void applySauce; void applyCheese; void toggleTopping; void sendToOven; void advanceBake; void finishBaking; void cutPizza; void servePizza; void endDay; void nextDay; void buyUpgrade; void restock; void updateSettings; void resetSave;
        return persisted;
      },
    },
  ),
);

export function getActiveCustomer(state: GameState) {
  return state.day.customers.find(
    (c) => c.id === state.day.activeCustomerId && !c.served,
  );
}

export function getActiveOrder(state: GameState) {
  return getActiveCustomer(state)?.order ?? null;
}
