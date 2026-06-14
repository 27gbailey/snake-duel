import { PLAYER_COLORS } from "@/lib/game/constants";
import type { GameState } from "@/types/game";

type ScoreboardProps = {
  gameState: GameState;
  onRestart: () => void;
};

export default function Scoreboard({ gameState, onRestart }: ScoreboardProps) {
  const { players, status, message } = gameState;

  return (
    <header className="scoreboard">
      <div className="scoreboard__players">
        <div className="scoreboard__player">
          <span
            className="scoreboard__dot"
            style={{ backgroundColor: PLAYER_COLORS[1].head }}
          />
          <span className="scoreboard__label">Player 1</span>
          <span className="scoreboard__score">{players[1].score}</span>
          {!players[1].alive && status === "ended" && (
            <span className="scoreboard__status">Out</span>
          )}
        </div>

        <div className="scoreboard__divider">vs</div>

        <div className="scoreboard__player">
          <span
            className="scoreboard__dot"
            style={{ backgroundColor: PLAYER_COLORS[2].head }}
          />
          <span className="scoreboard__label">Player 2</span>
          <span className="scoreboard__score">{players[2].score}</span>
          {!players[2].alive && status === "ended" && (
            <span className="scoreboard__status">Out</span>
          )}
        </div>
      </div>

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
