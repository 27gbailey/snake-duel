"use client";

import { useEffect } from "react";
import { Button, NavBar, Panel, Stat } from "@/components/ui";
import { getActiveCustomer, useGameStore } from "@/features/game/store/gameStore";

export default function RestaurantScreen() {
  const state = useGameStore();
  const { day, cash, reputation, rating, navigate, beginPrep, tick, endDay } = state;
  const customer = getActiveCustomer(state);

  useEffect(() => {
    const interval = setInterval(() => tick(1), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const patiencePct = customer
    ? Math.round((customer.patience / customer.maxPatience) * 100)
    : 0;

  return (
    <div className="screen screen--restaurant">
      <header className="hud">
        <div className="hud__stats">
          <Stat label="Day" value={day.day} />
          <Stat label="Cash" value={`$${cash.toFixed(2)}`} accent="#4ade80" />
          <Stat label="Rep" value={reputation} />
          <Stat label="Rating" value={rating.toFixed(1)} accent="#fbbf24" />
        </div>
        <NavBar
          items={[
            { label: "Shop", screen: "shop", onClick: () => navigate("shop") },
            { label: "Upgrades", screen: "upgrades", onClick: () => navigate("upgrades") },
            { label: "Inventory", screen: "inventory", onClick: () => navigate("inventory") },
            { label: "Stats", screen: "statistics", onClick: () => navigate("statistics") },
          ]}
        />
      </header>

      {day.isSpecialEvent && day.specialEventName && (
        <div className="event-banner">Special Event: {day.specialEventName}</div>
      )}

      <Panel title="Dining Room" className="restaurant-floor">
        <div className="restaurant-floor__progress">
          <span>
            Customers: {day.customersServed} / {day.customersTarget}
          </span>
        </div>

        {customer ? (
          <div className="customer-card">
            <div className="customer-card__header">
              <span className="customer-card__avatar">👤</span>
              <div>
                <h3>{customer.name}</h3>
                <p className="customer-card__personality">{customer.personality}</p>
              </div>
              <div className="customer-card__patience">
                <div className="patience-bar">
                  <div
                    className="patience-bar__fill"
                    style={{ width: `${patiencePct}%` }}
                  />
                </div>
                <span>{patiencePct}% patience</span>
              </div>
            </div>

            <blockquote className="customer-card__dialogue">
              &ldquo;{customer.dialogue}&rdquo;
            </blockquote>

            <div className="customer-card__order">
              <h4>Order</h4>
              <p className="customer-card__order-text">{customer.order.description}</p>
              {customer.order.specialRequests.length > 0 && (
                <ul className="customer-card__requests">
                  {customer.order.specialRequests.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
              <p className="customer-card__price">${customer.order.basePrice.toFixed(2)}</p>
            </div>

            <Button onClick={beginPrep}>Start Preparing Pizza</Button>
          </div>
        ) : (
          <p className="restaurant-floor__empty">Waiting for next customer...</p>
        )}
      </Panel>

      <div className="screen__footer">
        <Button variant="ghost" onClick={() => navigate("menu")}>
          Main Menu
        </Button>
        <Button variant="secondary" onClick={endDay}>
          End Day Early
        </Button>
      </div>
    </div>
  );
}
