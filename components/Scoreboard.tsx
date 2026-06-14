import { PLAYER_COLORS } from "@/lib/game/constants";
import type { GameMode, GameState } from "@/types/game";

type ScoreboardProps = {
  gameState: GameState;
  onRestart: () => void;
  onModeChange: (mode: GameMode) => void;
};

export default function Scoreboard({
  gameState,
  onRestart,
  onModeChange,
}: ScoreboardProps) {
  const { players, status, message, mode } = gameState;

  return (
    <header className="scoreboard">
      <div className="scoreboard__mode">
        <button
          type="button"
          className={`scoreboard__mode-btn${mode === "solo" ? " scoreboard__mode-btn--active" : ""}`}
          onClick={() => onModeChange("solo")}
          aria-pressed={mode === "solo"}
        >
          1 Player
        </button>
        <button
          type="button"
          className={`scoreboard__mode-btn${mode === "duel" ? " scoreboard__mode-btn--active" : ""}`}
          onClick={() => onModeChange("duel")}
          aria-pressed={mode === "duel"}
        >
          2 Players
        </button>
      </div>

      {mode === "solo" ? (
        <div className="scoreboard__solo">
          <span
            className="scoreboard__dot"
            style={{ backgroundColor: PLAYER_COLORS[1].head }}
          />
          <span className="scoreboard__label">Score</span>
          <span className="scoreboard__score">{players[1].score}</span>
        </div>
      ) : (
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
      )}

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
