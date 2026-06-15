import { ARENA_VERSION, BUILD_LABEL } from "@/lib/game/constants";

type UiSnapshot = {
  score: number;
  length: number;
  rivalsAlive: number;
  status: "playing" | "ended";
  message: string;
};

type ScoreboardProps = {
  ui: UiSnapshot;
  onRestart: () => void;
};

export default function Scoreboard({ ui, onRestart }: ScoreboardProps) {
  const { score, length, rivalsAlive, status, message } = ui;

  return (
    <header className="scoreboard">
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
