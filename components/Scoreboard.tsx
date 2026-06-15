import type { GameState } from "@/types/game";

type ScoreboardProps = {
  gameState: GameState;
  rivalsAlive: number;
  onRestart: () => void;
};

export default function Scoreboard({
  gameState,
  rivalsAlive,
  onRestart,
}: ScoreboardProps) {
  const { player, status, message } = gameState;

  return (
    <header className="scoreboard">
      <div className="scoreboard__stats">
        <div className="scoreboard__stat">
          <span className="scoreboard__label">Score</span>
          <span className="scoreboard__score">{player.score}</span>
        </div>

        <div className="scoreboard__stat">
          <span className="scoreboard__label">Length</span>
          <span className="scoreboard__score">{player.body.length}</span>
        </div>

        <div className="scoreboard__stat">
          <span className="scoreboard__label">Rivals</span>
          <span className="scoreboard__score">{rivalsAlive}</span>
        </div>
      </div>

      {status === "playing" && (
        <p className="scoreboard__message scoreboard__message--hint">{message}</p>
      )}

      {status === "ended" && (
        <p className="scoreboard__message">{message}</p>
      )}

      <button
        type="button"
        className="scoreboard__restart"
        onClick={onRestart}
      >
        {status === "ended" ? "Play Again" : "Restart"}
      </button>
    </header>
  );
}
