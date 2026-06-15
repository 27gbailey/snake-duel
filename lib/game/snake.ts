import type { Snake } from "@/types/game";

export function absorbVictimBody(killer: Snake, victim: Snake): Snake {
  const lengthGain = victim.body.length;
  const tail = killer.body[killer.body.length - 1] ?? killer.body[0];

  const extraSegments = Array.from({ length: lengthGain }, () => ({
    x: tail.x,
    y: tail.y,
  }));

  return {
    ...killer,
    body: [...killer.body, ...extraSegments],
    score: killer.score + lengthGain,
  };
}
