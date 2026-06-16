import { ARENA_VERSION, BUILD_LABEL } from "@/lib/game/constants";
import type { LeaderboardSnapshot } from "@/lib/game/leaderboard";
import Leaderboard from "./Leaderboard";

type UiSnapshot = {
  mode: "single" | "two-player";
  score: number;
  length: number;
  player2Score: number;
  player2Length: number;
  rivalsAlive: number;
  status: "playing" | "ended";
  message: string;
  leaderboard: LeaderboardSnapshot;
};

type ScoreboardProps = {
  ui: UiSnapshot;
  onRestart: () => void;
  onModeChange: (mode: "single" | "two-player") => void;
};

export default function Scoreboard({
  ui,
  onRestart,
  onModeChange,
}: ScoreboardProps) {
  const {
    mode,
    score,
    length,
    player2Score,
    player2Length,
    rivalsAlive,
    status,
    message,
  } = ui;

  return (
    <header className="scoreboard">
      <div className="game__mode-toggle">
        <button
          type="button"
          className={`game__mode-btn${mode === "single" ? " game__mode-btn--active" : ""}`}
          onClick={() => onModeChange("single")}
          disabled={status === "playing"}
        >
          Single Player
        </button>
        <button
          type="button"
          className={`game__mode-btn${mode === "two-player" ? " game__mode-btn--active" : ""}`}
          onClick={() => onModeChange("two-player")}
          disabled={status === "playing"}
        >
          Two Player
        </button>
      </div>

      {mode === "two-player" ? (
        <div className="scoreboard__stats scoreboard__players">
          <div className="scoreboard__player">
            <span
              className="scoreboard__dot"
              style={{ background: "#4ade80" }}
            />
            <span className="scoreboard__label">P1</span>
            <span className="scoreboard__score">{score}</span>
            <span className="scoreboard__label">Len {length}</span>
          </div>
          <span className="scoreboard__divider">vs</span>
          <div className="scoreboard__player">
            <span
              className="scoreboard__dot"
              style={{ background: "#60a5fa" }}
            />
            <span className="scoreboard__label">P2</span>
            <span className="scoreboard__score">{player2Score}</span>
            <span className="scoreboard__label">Len {player2Length}</span>
          </div>
          <div className="scoreboard__stat">
            <span className="scoreboard__label">Rivals</span>
            <span className="scoreboard__score">{rivalsAlive}</span>
          </div>
        </div>
      ) : (
        <div className="scoreboard__stats">
          <div className="scoreboard__stat">
            <span className="scoreboard__label">Score</span>
            <span className="scoreboard__score">{score}</span>
          </div>
          <div className="scoreboard__stat">
            <span className="scoreboard__label">Length</span>
            <span className="scoreboard__score">{length}</span>
          </div>
          <div className="scoreboard__stat">
            <span className="scoreboard__label">Rivals</span>
            <span className="scoreboard__score">{rivalsAlive}</span>
          </div>
        </div>
      )}

      <Leaderboard leaderboard={ui.leaderboard} />

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

      <p className="scoreboard__build">
        Free arena · {ARENA_VERSION} · build {BUILD_LABEL}
      </p>
    </header>
  );
}
