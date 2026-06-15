import type { Snake } from "@/types/game";

export function absorbVictimBody(killer: Snake, victim: Snake): Snake {
  const absorbedSegments = victim.body.slice(1);

  return {
    ...killer,
    body:
      absorbedSegments.length > 0
        ? [...killer.body, ...absorbedSegments]
        : killer.body,
    score: killer.score + victim.body.length,
  };
}
