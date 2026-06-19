"use client";

import { Button, Panel } from "@/components/ui";
import { useGameStore } from "@/features/game/store/gameStore";

export default function MainMenuScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const startDay = useGameStore((s) => s.startDay);
  const navigate = useGameStore((s) => s.navigate);
  const stats = useGameStore((s) => s.stats);
  const day = useGameStore((s) => s.day.day);
  const cash = useGameStore((s) => s.cash);

  const handleContinue = () => {
    if (stats.daysPlayed > 0 || day > 1 || cash !== 120) {
      startDay();
    } else {
      startNewGame();
      startDay();
    }
  };

  return (
    <div className="screen screen--menu">
      <div className="menu-hero">
        <span className="menu-hero__emoji">🍕</span>
        <h1 className="menu-hero__title">Slice &amp; Serve</h1>
        <p className="menu-hero__subtitle">
          Run your pizza restaurant. Take natural-language orders, build custom
          pies, and grow your reputation day by day.
        </p>
      </div>

      <Panel className="menu-actions">
        <Button onClick={handleContinue} className="menu-actions__primary">
          {stats.daysPlayed > 0 ? "Continue Restaurant" : "Open Restaurant"}
        </Button>
        <Button variant="secondary" onClick={() => { startNewGame(); }}>
          New Game
        </Button>
        <div className="menu-actions__row">
          <Button variant="ghost" onClick={() => navigate("statistics")}>
            Statistics
          </Button>
          <Button variant="ghost" onClick={() => navigate("settings")}>
            Settings
          </Button>
        </div>
        <p className="menu-actions__version">Slice &amp; Serve · v1</p>
      </Panel>
    </div>
  );
}
