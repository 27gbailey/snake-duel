import { UPGRADE_CATALOG } from "@/features/game/data/upgrades";
import type { GameState, UpgradeDefinition } from "@/features/game/types";

export function createInitialUpgrades(): UpgradeDefinition[] {
  return UPGRADE_CATALOG.map((u) => ({ ...u, purchased: false }));
}

export function getAvailableUpgrades(
  upgrades: UpgradeDefinition[],
  day: number,
  cash: number,
): UpgradeDefinition[] {
  return upgrades.filter(
    (u) => !u.purchased && u.unlockDay <= day && u.cost <= cash,
  );
}

export function purchaseUpgrade(
  state: GameState,
  upgradeId: string,
): GameState | null {
  const upgrade = state.upgrades.find((u) => u.id === upgradeId);
  if (!upgrade || upgrade.purchased || state.cash < upgrade.cost) {
    return null;
  }

  if (upgrade.unlockDay > state.day.day) {
    return null;
  }

  const upgrades = state.upgrades.map((u) =>
    u.id === upgradeId ? { ...u, purchased: true } : u,
  );

  const decorations =
    upgrade.category === "decoration"
      ? [...state.unlockedDecorations, upgrade.id]
      : state.unlockedDecorations;

  return {
    ...state,
    cash: Math.round((state.cash - upgrade.cost) * 100) / 100,
    upgrades,
    unlockedDecorations: decorations,
    day: {
      ...state.day,
      finances: {
        ...state.day.finances,
        upgradeCosts:
          Math.round((state.day.finances.upgradeCosts + upgrade.cost) * 100) /
          100,
      },
    },
  };
}

export function hasUpgrade(state: GameState, id: string): boolean {
  return state.upgrades.some((u) => u.id === id && u.purchased);
}

export function getUpgradeEffect(state: GameState, effectKey: string): number {
  for (const upgrade of state.upgrades) {
    if (!upgrade.purchased) continue;
    const [key, value] = upgrade.effect.split(":");
    if (key === effectKey) {
      return Number(value);
    }
  }
  return 0;
}
