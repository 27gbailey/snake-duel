import type { GameState } from "@/types/game";

export type LeaderboardEntry = {
  id: string;
  label: string;
  score: number;
  length: number;
  color: string;
  alive: boolean;
  isHuman: boolean;
};

export type LeaderboardSnapshot = {
  humans: LeaderboardEntry[];
  ais: LeaderboardEntry[];
};

export function buildLeaderboard(state: GameState): LeaderboardSnapshot {
  const humans: LeaderboardEntry[] = [
    {
      id: "human-p1",
      label: "Player 1",
      score: state.player.score,
      length: state.player.body.length,
      color: state.player.color.head,
      alive: state.player.alive,
      isHuman: true,
    },
  ];

  if (state.player2) {
    humans.push({
      id: "human-p2",
      label: "Player 2",
      score: state.player2.score,
      length: state.player2.body.length,
      color: state.player2.color.head,
      alive: state.player2.alive,
      isHuman: true,
    });
  }

  const ais = state.opponents
    .map((opponent, index) => ({
      id: `ai-${opponent.id}`,
      label: `Rival ${index + 1}`,
      score: opponent.score,
      length: opponent.body.length,
      color: opponent.color.head,
      alive: opponent.alive,
      isHuman: false,
    }))
    .sort((a, b) => b.score - a.score);

  humans.sort((a, b) => b.score - a.score);

  return { humans, ais };
}

export function leaderboardChanged(
  a: LeaderboardSnapshot,
  b: LeaderboardSnapshot,
): boolean {
  if (a.humans.length !== b.humans.length || a.ais.length !== b.ais.length) {
    return true;
  }

  for (let i = 0; i < a.humans.length; i += 1) {
    const left = a.humans[i];
    const right = b.humans[i];
    if (
      left.score !== right.score ||
      left.length !== right.length ||
      left.alive !== right.alive
    ) {
      return true;
    }
  }

  for (let i = 0; i < a.ais.length; i += 1) {
    const left = a.ais[i];
    const right = b.ais[i];
    if (
      left.score !== right.score ||
      left.length !== right.length ||
      left.alive !== right.alive ||
      left.id !== right.id
    ) {
      return true;
    }
  }

  return false;
}
