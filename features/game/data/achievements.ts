import type { Achievement } from "@/features/game/types";

export const ACHIEVEMENT_CATALOG: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  {
    id: "first-pizza",
    label: "First Slice",
    description: "Serve your first pizza.",
  },
  {
    id: "perfect-day",
    label: "Flawless Service",
    description: "Complete a day with 100% order accuracy.",
  },
  {
    id: "big-tips",
    label: "Generous Crowd",
    description: "Earn $50 in tips in a single day.",
  },
  {
    id: "complex-order",
    label: "Half & Half Hero",
    description: "Perfectly fulfill a complex half-and-half order.",
  },
  {
    id: "week-survivor",
    label: "Week One",
    description: "Reach day 7.",
  },
  {
    id: "five-star",
    label: "Five Stars",
    description: "Reach a 4.8 average rating.",
  },
];
