"use client";

import { Button, Panel, Stat } from "@/components/ui";
import { getAchievementProgress } from "@/features/game/engines/achievementSystem";
import { useGameStore } from "@/features/game/store/gameStore";

export default function StatisticsScreen() {
  const state = useGameStore();
  const { stats, reviews, achievements, rating, reputation, navigate } = state;
  const achievementProgress = getAchievementProgress(state);

  return (
    <div className="screen screen--statistics">
      <Panel title="Restaurant Statistics">
        <div className="summary-stats">
          <Stat label="Days Played" value={stats.daysPlayed} />
          <Stat label="Customers Served" value={stats.totalCustomersServed} />
          <Stat label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
          <Stat label="Total Profit" value={`$${stats.totalProfit.toFixed(2)}`} />
          <Stat label="Best Day Profit" value={`$${stats.bestDayProfit.toFixed(2)}`} />
          <Stat label="Perfect Orders" value={stats.perfectOrders} />
          <Stat label="Rating" value={rating.toFixed(1)} accent="#fbbf24" />
          <Stat label="Reputation" value={reputation} />
          <Stat
            label="Achievements"
            value={`${achievementProgress.unlocked}/${achievementProgress.total}`}
          />
        </div>

        <h4>Achievements</h4>
        <ul className="achievement-list">
          {achievements.map((a) => (
            <li key={a.id} className={a.unlocked ? "achievement-list__unlocked" : ""}>
              <strong>{a.label}</strong> — {a.description}
              {a.unlocked && <span> ✓</span>}
            </li>
          ))}
        </ul>

        <h4>Recent Reviews</h4>
        <ul className="review-list">
          {reviews.slice(0, 5).map((r) => (
            <li key={r.id}>
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)} {r.customerName}: {r.comment}
            </li>
          ))}
          {reviews.length === 0 && <li>No reviews yet.</li>}
        </ul>

        <Button variant="ghost" onClick={() => navigate("menu")}>
          Back to Menu
        </Button>
      </Panel>
    </div>
  );
}
