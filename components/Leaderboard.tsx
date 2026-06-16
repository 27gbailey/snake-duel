import type { LeaderboardEntry, LeaderboardSnapshot } from "@/lib/game/leaderboard";

type LeaderboardProps = {
  leaderboard: LeaderboardSnapshot;
};

function LeaderboardColumn({
  title,
  entries,
  showRank = true,
}: {
  title: string;
  entries: LeaderboardEntry[];
  showRank?: boolean;
}) {
  return (
    <div className="leaderboard__column">
      <h3 className="leaderboard__title">{title}</h3>
      <ol className="leaderboard__list">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className={`leaderboard__row${entry.alive ? "" : " leaderboard__row--dead"}`}
          >
            {showRank && (
              <span className="leaderboard__rank">{index + 1}</span>
            )}
            <span
              className="leaderboard__dot"
              style={{ background: entry.color }}
            />
            <span className="leaderboard__name">{entry.label}</span>
            <span className="leaderboard__points">{entry.score}</span>
            <span className="leaderboard__meta">L{entry.length}</span>
            {!entry.alive && (
              <span className="leaderboard__status">out</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const aiTotal = leaderboard.ais.reduce((sum, entry) => sum + entry.score, 0);
  const humanTotal = leaderboard.humans.reduce(
    (sum, entry) => sum + entry.score,
    0,
  );

  return (
    <section className="leaderboard" aria-label="Score leaderboard">
      <div className="leaderboard__summary">
        <span className="leaderboard__summary-item">
          Humans <strong>{humanTotal}</strong>
        </span>
        <span className="leaderboard__summary-item">
          AI total <strong>{aiTotal}</strong>
        </span>
      </div>

      <div className="leaderboard__columns">
        <LeaderboardColumn
          title="Human snakes"
          entries={leaderboard.humans}
          showRank={leaderboard.humans.length > 1}
        />
        <LeaderboardColumn title="AI snakes" entries={leaderboard.ais} />
      </div>
    </section>
  );
}
