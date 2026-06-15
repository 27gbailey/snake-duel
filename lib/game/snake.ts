import { MAX_BODY_LENGTH } from "@/lib/game/constants";
import type { Snake } from "@/types/game";

export function absorbVictimBody(killer: Snake, victim: Snake): Snake {
  const scoreGain = victim.body.length;
  const absorbedSegments = victim.body.slice(1);
  const room = MAX_BODY_LENGTH - killer.body.length;
  const segmentsToAdd =
    room > 0 ? absorbedSegments.slice(0, room) : [];

  return {
    ...killer,
    body:
      segmentsToAdd.length > 0
        ? [...killer.body, ...segmentsToAdd]
        : killer.body,
    score: killer.score + scoreGain,
  };
}

export function trimSnakeBody(snake: Snake): Snake {
  if (snake.body.length <= MAX_BODY_LENGTH) {
    return snake;
  }

  return {
    ...snake,
    body: snake.body.slice(0, MAX_BODY_LENGTH),
  };
}
