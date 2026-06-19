"use client";

import CutScreen from "@/components/screens/CutScreen";
import InventoryScreen from "@/components/screens/InventoryScreen";
import MainMenuScreen from "@/components/screens/MainMenuScreen";
import OvenScreen from "@/components/screens/OvenScreen";
import PrepScreen from "@/components/screens/PrepScreen";
import RestaurantScreen from "@/components/screens/RestaurantScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import ShopScreen from "@/components/screens/ShopScreen";
import StatisticsScreen from "@/components/screens/StatisticsScreen";
import SummaryScreen from "@/components/screens/SummaryScreen";
import UpgradesScreen from "@/components/screens/UpgradesScreen";
import { useGameStore } from "@/features/game/store/gameStore";

const SCREENS = {
  menu: MainMenuScreen,
  restaurant: RestaurantScreen,
  prep: PrepScreen,
  oven: OvenScreen,
  cut: CutScreen,
  shop: ShopScreen,
  upgrades: UpgradesScreen,
  inventory: InventoryScreen,
  summary: SummaryScreen,
  statistics: StatisticsScreen,
  settings: SettingsScreen,
} as const;

export default function GameShell() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const Screen = SCREENS[currentScreen] ?? MainMenuScreen;

  return (
    <main className="game-shell">
      <Screen />
    </main>
  );
}
