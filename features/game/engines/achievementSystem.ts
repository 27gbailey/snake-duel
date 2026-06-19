import { ACHIEVEMENT_CATALOG } from "@/features/game/data/achievements";
import type { Achievement, GameState } from "@/features/game/types";

export function createInitialAchievements(): Achievement[] {
  return ACHIEVEMENT_CATALOG.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: null,
  }));
}

export function unlockAchievement(
  achievements: Achievement[],
  id: string,
): Achievement[] {
  const now = Date.now();
  return achievements.map((a) =>
    a.id === id && !a.unlocked
      ? { ...a, unlocked: true, unlockedAt: now }
      : a,
  );
}

export function checkAchievements(
  state: GameState,
  context: {
    validationScore?: number;
    orderComplexity?: string;
    dayTips?: number;
    dayAccuracy?: number;
  },
): GameState {
  let achievements = state.achievements;

  if (state.stats.totalCustomersServed >= 1) {
    achievements = unlockAchievement(achievements, "first-pizza");
  }

  if (context.orderComplexity === "complex" && (context.validationScore ?? 0) >= 0.95) {
    achievements = unlockAchievement(achievements, "complex-order");
  }

  if ((context.dayTips ?? 0) >= 50) {
    achievements = unlockAchievement(achievements, "big-tips");
  }

  if (context.dayAccuracy === 1) {
    achievements = unlockAchievement(achievements, "perfect-day");
  }

  if (state.day.day >= 7) {
    achievements = unlockAchievement(achievements, "week-survivor");
  }

  if (state.rating >= 4.8) {
    achievements = unlockAchievement(achievements, "five-star");
  }

  return { ...state, achievements };
}

export function getAchievementProgress(state: GameState): {
  unlocked: number;
  total: number;
} {
  return {
    unlocked: state.achievements.filter((a) => a.unlocked).length,
    total: state.achievements.length,
  };
}
