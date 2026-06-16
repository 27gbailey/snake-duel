"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ARENA_VERSION,
  MAX_FRAME_DELTA_MS,
  MAX_TICKS_PER_FRAME,
  PLAYER1_TURN_KEYS,
  PLAYER2_TURN_KEYS,
  PLAYER2_ID,
  PLAYER_ID,
  TICK_MS,
  VIEWPORT_SIZE,
} from "@/lib/game/constants";
import {
  getCameraTargetForHead,
  getMergedTwoPlayerCamera,
  getViewMergeFactor,
  smoothCamera,
} from "@/lib/game/camera";
import {
  advanceGame,
  createInitialGameState,
} from "@/lib/game/gameEngine";
import {
  drawGame,
  drawSplitTwoPlayerView,
  getCanvasSize,
  getScale,
} from "@/lib/game/renderer";
import {
  buildLeaderboard,
  leaderboardChanged,
  type LeaderboardSnapshot,
} from "@/lib/game/leaderboard";
import type { Camera, GameInputs, GameMode, GameState } from "@/types/game";
import Scoreboard from "./Scoreboard";

type UiSnapshot = {
  mode: GameMode;
  score: number;
  length: number;
  player2Score: number;
  player2Length: number;
  rivalsAlive: number;
  status: GameState["status"];
  message: string;
  leaderboard: LeaderboardSnapshot;
};

function toUiSnapshot(state: GameState): UiSnapshot {
  return {
    mode: state.mode,
    score: state.player.score,
    length: state.player.body.length,
    player2Score: state.player2?.score ?? 0,
    player2Length: state.player2?.body.length ?? 0,
    rivalsAlive: state.opponents.filter((opponent) => opponent.alive).length,
    status: state.status,
    message: state.message,
    leaderboard: buildLeaderboard(state),
  };
}

function uiChanged(a: UiSnapshot, b: UiSnapshot): boolean {
  return (
    a.mode !== b.mode ||
    a.score !== b.score ||
    a.length !== b.length ||
    a.player2Score !== b.player2Score ||
    a.player2Length !== b.player2Length ||
    a.rivalsAlive !== b.rivalsAlive ||
    a.status !== b.status ||
    a.message !== b.message ||
    leaderboardChanged(a.leaderboard, b.leaderboard)
  );
}

function resizeCanvas(
  canvas: HTMLCanvasElement,
  scale: number,
  ctxRef: { current: CanvasRenderingContext2D | null },
): CanvasRenderingContext2D | null {
  const { width, height } = getCanvasSize(scale, VIEWPORT_SIZE);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctxRef.current = canvas.getContext("2d", { alpha: false });
  }

  return ctxRef.current;
}

const EMPTY_INPUT = { turnLeft: false, turnRight: false };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(createInitialGameState("single"));
  const scaleRef = useRef(1);
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const camera2Ref = useRef<Camera>({ x: 0, y: 0 });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const uiRef = useRef<UiSnapshot>(toUiSnapshot(gameStateRef.current));
  const inputRef = useRef<GameInputs>({
    player1: { ...EMPTY_INPUT },
    player2: { ...EMPTY_INPUT },
  });

  const [ui, setUi] = useState<UiSnapshot>(uiRef.current);

  const syncUiIfNeeded = useCallback(() => {
    const next = toUiSnapshot(gameStateRef.current);
    if (uiChanged(uiRef.current, next)) {
      uiRef.current = next;
      setUi(next);
    }
  }, []);

  const resetCameras = useCallback((state: GameState) => {
    cameraRef.current = getCameraTargetForHead(
      state.player.body[0],
      state.worldSize,
      state.viewportSize,
    );

    if (state.player2) {
      camera2Ref.current = getCameraTargetForHead(
        state.player2.body[0],
        state.worldSize,
        state.viewportSize,
      );
    }
  }, []);

  const startGame = useCallback(
    (mode: GameMode) => {
      const fresh = createInitialGameState(mode);
      gameStateRef.current = fresh;
      uiRef.current = toUiSnapshot(fresh);
      setUi(uiRef.current);
      resetCameras(fresh);
    },
    [resetCameras],
  );

  const handleRestart = useCallback(() => {
    startGame(gameStateRef.current.mode);
  }, [startGame]);

  const handleModeChange = useCallback(
    (mode: GameMode) => {
      if (gameStateRef.current.status === "playing") {
        return;
      }
      startGame(mode);
    },
    [startGame],
  );

  useEffect(() => {
    const basePath = window.location.pathname.includes("/snake-duel")
      ? "/snake-duel"
      : "";

    fetch(`${basePath}/version.json?ts=${Date.now()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((remote) => {
        if (remote?.arena && remote.arena !== ARENA_VERSION) {
          window.location.reload();
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;
      const nextScale = getScale(
        clientWidth,
        clientHeight,
        VIEWPORT_SIZE,
      );

      scaleRef.current = nextScale > 0 ? nextScale : 1;
      resizeCanvas(canvas, scaleRef.current, ctxRef);
      resetCameras(gameStateRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resetCameras]);

  useEffect(() => {
    const setTurn = (
      player: "player1" | "player2",
      side: "left" | "right",
      active: boolean,
    ) => {
      if (side === "left") {
        inputRef.current[player].turnLeft = active;
      } else {
        inputRef.current[player].turnRight = active;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const mode = gameStateRef.current.mode;
      let p1Turn = PLAYER1_TURN_KEYS[event.key];
      let p2Turn: "left" | "right" | undefined = PLAYER2_TURN_KEYS[event.key];

      if (mode === "single" && !p1Turn && p2Turn) {
        p1Turn = p2Turn;
        p2Turn = undefined;
      }

      if (!p1Turn && !p2Turn) {
        return;
      }

      event.preventDefault();

      if (p1Turn) {
        setTurn("player1", p1Turn, true);
      }

      if (p2Turn) {
        setTurn("player2", p2Turn, true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mode = gameStateRef.current.mode;
      let p1Turn = PLAYER1_TURN_KEYS[event.key];
      let p2Turn: "left" | "right" | undefined = PLAYER2_TURN_KEYS[event.key];

      if (mode === "single" && !p1Turn && p2Turn) {
        p1Turn = p2Turn;
        p2Turn = undefined;
      }

      if (p1Turn) {
        setTurn("player1", p1Turn, false);
      }

      if (p2Turn) {
        setTurn("player2", p2Turn, false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = resizeCanvas(canvas, scaleRef.current, ctxRef);
    if (!ctx) return;

    let running = true;
    let lastFrame = performance.now();
    let tickAccumulator = 0;
    let uiFrame = 0;

    resetCameras(gameStateRef.current);

    const frame = (now: number) => {
      if (!running) {
        return;
      }

      const rawDelta = now - lastFrame;
      lastFrame = now;
      const delta = Math.min(rawDelta, MAX_FRAME_DELTA_MS);
      tickAccumulator = Math.min(
        tickAccumulator + delta,
        TICK_MS * MAX_TICKS_PER_FRAME,
      );

      let ticksThisFrame = 0;
      while (
        tickAccumulator >= TICK_MS &&
        ticksThisFrame < MAX_TICKS_PER_FRAME
      ) {
        tickAccumulator -= TICK_MS;
        ticksThisFrame += 1;

        const current = gameStateRef.current;
        if (current.status === "playing") {
          gameStateRef.current = advanceGame(current, inputRef.current);
        }
      }

      const state = gameStateRef.current;
      const scale = scaleRef.current;
      const canvasWidth = state.viewportSize * scale;
      const canvasHeight = state.viewportSize * scale;
      const mergeFactor = getViewMergeFactor(state);

      if (state.mode === "two-player" && state.player2) {
        const targetCamera1 = getCameraTargetForHead(
          state.player.body[0],
          state.worldSize,
          state.viewportSize,
        );
        const targetCamera2 = getCameraTargetForHead(
          state.player2.body[0],
          state.worldSize,
          state.viewportSize,
        );
        const mergedTarget = getMergedTwoPlayerCamera(
          state,
          state.viewportSize,
        );

        cameraRef.current = smoothCamera(cameraRef.current, targetCamera1, 0.35);
        camera2Ref.current = smoothCamera(
          camera2Ref.current,
          targetCamera2,
          0.35,
        );

        ctx = resizeCanvas(canvas, scale, ctxRef) ?? ctx;

        if (ctx) {
          if (mergeFactor >= 0.98) {
            const mergedCamera = smoothCamera(
              cameraRef.current,
              mergedTarget,
              0.35,
            );
            drawGame(ctx, state, scale, mergedCamera, {
              humanPlayerIds: [PLAYER_ID, PLAYER2_ID],
            });
          } else if (mergeFactor <= 0.02) {
            drawSplitTwoPlayerView(
              ctx,
              state,
              cameraRef.current,
              camera2Ref.current,
              canvasWidth,
              canvasHeight,
            );
          } else {
            ctx.save();
            ctx.globalAlpha = 1 - mergeFactor;
            drawSplitTwoPlayerView(
              ctx,
              state,
              cameraRef.current,
              camera2Ref.current,
              canvasWidth,
              canvasHeight,
            );
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = mergeFactor;
            const mergedCamera = smoothCamera(
              cameraRef.current,
              mergedTarget,
              0.35,
            );
            drawGame(ctx, state, scale, mergedCamera, {
              humanPlayerIds: [PLAYER_ID, PLAYER2_ID],
            });
            ctx.restore();
          }
        }
      } else {
        const targetCamera = getCameraTargetForHead(
          state.player.body[0],
          state.worldSize,
          state.viewportSize,
        );
        cameraRef.current = smoothCamera(cameraRef.current, targetCamera, 0.35);

        ctx = resizeCanvas(canvas, scale, ctxRef) ?? ctx;
        if (ctx) {
          drawGame(ctx, state, scale, cameraRef.current, {
            humanPlayerIds: [PLAYER_ID],
          });
        }
      }

      uiFrame += 1;
      if (uiFrame % 4 === 0) {
        syncUiIfNeeded();
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    return () => {
      running = false;
    };
  }, [resetCameras, syncUiIfNeeded]);

  const { width, height } = getCanvasSize(
    scaleRef.current,
    VIEWPORT_SIZE,
  );

  return (
    <div className="game">
      <Scoreboard
        ui={ui}
        onRestart={handleRestart}
        onModeChange={handleModeChange}
      />

      <div ref={containerRef} className="game__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="game__canvas"
          aria-label="Snake.IO style arena"
        />
      </div>

      <p className="game__hint">
        {ui.mode === "two-player"
          ? "Two player: P1 steers with A/D, P2 with arrow keys. Split views merge when you meet."
          : "Hold arrow keys or A/D to steer. Dead snakes scatter pellets across the area."}
      </p>
    </div>
  );
}
