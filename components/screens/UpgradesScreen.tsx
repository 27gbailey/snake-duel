"use client";

import { Button, Panel } from "@/components/ui";
import { useGameStore } from "@/features/game/store/gameStore";

export default function UpgradesScreen() {
  const { upgrades, cash, day, buyUpgrade, navigate } = useGameStore();

  return (
    <div className="screen screen--upgrades">
      <Panel title="Restaurant Upgrades">
        <p className="shop-balance">Balance: ${cash.toFixed(2)}</p>
        <ul className="upgrade-list">
          {upgrades.map((u) => (
            <li key={u.id} className="upgrade-list__item">
              <div>
                <h4>{u.name}</h4>
                <p>{u.description}</p>
                <span className="upgrade-list__meta">
                  {u.category} · unlocks day {u.unlockDay}
                </span>
              </div>
              {u.purchased ? (
                <span className="upgrade-list__owned">Owned</span>
              ) : (
                <Button
                  variant="secondary"
                  disabled={cash < u.cost || day.day < u.unlockDay}
                  onClick={() => buyUpgrade(u.id)}
                >
                  ${u.cost}
                </Button>
              )}
            </li>
          ))}
        </ul>
        <Button variant="ghost" onClick={() => navigate("restaurant")}>
          Back
        </Button>
      </Panel>
    </div>
  );
}
