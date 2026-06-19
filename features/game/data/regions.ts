import type { PizzaRegion, SliceIndex } from "@/features/game/types";

/** Maps named regions to the slice indices they cover. */
export const REGION_SLICES: Record<PizzaRegion, SliceIndex[]> = {
  all: [0, 1, 2, 3, 4, 5, 6, 7],
  left: [2, 3, 4, 5],
  right: [0, 1, 6, 7],
  top: [0, 1, 2, 3],
  bottom: [4, 5, 6, 7],
  "top-left": [2, 3],
  "top-right": [0, 1],
  "bottom-left": [4, 5],
  "bottom-right": [6, 7],
};

export function getSlicesForRegion(region: PizzaRegion): SliceIndex[] {
  return REGION_SLICES[region];
}
