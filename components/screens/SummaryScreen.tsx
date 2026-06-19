"use client";

import { Button, Panel, Stat } from "@/components/ui";
import { finalizeDayProfit } from "@/features/game/engines/economyEngine";
import { useGameStore } from "@/features/game/store/gameStore";

export default function SummaryScreen() {
  const { day, cash, nextDay, navigate } = useGameStore();
  const { finances, objectives, customersServed, customersTarget } = day;
  const profit = finalizeDayProfit(finances);

  return (
    <div className="screen screen--summary">
      <Panel title={`Day ${day.day} Summary`}>
        <div className="summary-stats">
          <Stat label="Revenue" value={`$${finances.revenue.toFixed(2)}`} />
          <Stat label="Tips" value={`$${finances.tips.toFixed(2)}`} accent="#fbbf24" />
          <Stat label="Ingredient Costs" value={`-$${finances.ingredientCosts.toFixed(2)}`} />
          <Stat label="Restock Costs" value={`-$${finances.restockCosts.toFixed(2)}`} />
          <Stat label="Upgrade Costs" value={`-$${finances.upgradeCosts.toFixed(2)}`} />
          <Stat
            label="Net Profit"
            value={`$${profit.toFixed(2)}`}
            accent={profit >= 0 ? "#4ade80" : "#f87171"}
          />
        </div>

        <p className="summary-served">
          Served {customersServed} of {customersTarget} customers
        </p>

        <h4>Daily Objectives</h4>
        <ul className="objective-list">
          {objectives.map((obj) => (
            <li key={obj.id} className={obj.completed ? "objective-list__done" : ""}>
              {obj.label} — {obj.completed ? `✓ +$${obj.reward}` : `${obj.progress}/${obj.target}`}
            </li>
          ))}
        </ul>

        <p className="summary-cash">Cash on hand: ${cash.toFixed(2)}</p>

        <div className="screen__footer">
          <Button variant="ghost" onClick={() => navigate("statistics")}>
            View Statistics
          </Button>
          <Button onClick={nextDay}>Start Day {day.day + 1}</Button>
        </div>
      </Panel>
    </div>
  );
}
