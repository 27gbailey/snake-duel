"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ARENA_VERSION,
  MAX_FRAME_DELTA_MS,
  MAX_TICKS_PER_FRAME,
  TICK_MS,
  TURN_KEYS,
  VIEWPORT_SIZE,
} from "@/lib/game/constants";
import { getCameraTarget, smoothCamera } from "@/lib/game/camera";
import {
  advanceGame,
  createInitialGameState,
} from "@/lib/game/gameEngine";
import {
  drawGame,
  getCanvasSize,
  getScale,
} from "@/lib/game/renderer";
import type { Camera, GameState, PlayerInput } from "@/types/game";
import Scoreboard from "./Scoreboard";

type UiSnapshot = {
  score: number;
  length: number;
  rivalsAlive: number;
  status: GameState["status"];
  message: string;
};

function toUiSnapshot(state: GameState): UiSnapshot {
  return {
    score: state.player.score,
    length: state.player.body.length,
    rivalsAlive: state.opponents.filter((opponent) => opponent.alive).length,
    status: state.status,
    message: state.message,
  };
}

function uiChanged(a: UiSnapshot, b: UiSnapshot): boolean {
  return (
    a.score !== b.score ||
    a.length !== b.length ||
    a.rivalsAlive !== b.rivalsAlive ||
    a.status !== b.status ||
    a.message !== b.message
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

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(createInitialGameState());
  const scaleRef = useRef(1);
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const uiRef = useRef<UiSnapshot>(toUiSnapshot(gameStateRef.current));
  const inputRef = useRef<PlayerInput>({ turnLeft: false, turnRight: false });

  const [ui, setUi] = useState<UiSnapshot>(uiRef.current);

  const syncUiIfNeeded = useCallback(() => {
    const next = toUiSnapshot(gameStateRef.current);
    if (uiChanged(uiRef.current, next)) {
      uiRef.current = next;
      setUi(next);
    }
  }, []);

  const resetCamera = useCallback((state: GameState) => {
    cameraRef.current = getCameraTarget(state, scaleRef.current);
  }, []);

  const handleRestart = useCallback(() => {
    const fresh = createInitialGameState();
    gameStateRef.current = fresh;
    uiRef.current = toUiSnapshot(fresh);
    setUi(uiRef.current);
    resetCamera(fresh);
  }, [resetCamera]);

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
      resetCamera(gameStateRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resetCamera]);

  useEffect(() => {
    const setTurn = (side: "left" | "right", active: boolean) => {
      if (side === "left") {
        inputRef.current.turnLeft = active;
      } else {
        inputRef.current.turnRight = active;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const turn = TURN_KEYS[event.key];
      if (!turn) {
        return;
      }

      event.preventDefault();
      setTurn(turn, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const turn = TURN_KEYS[event.key];
      if (!turn) {
        return;
      }

      setTurn(turn, false);
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

    resetCamera(gameStateRef.current);

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
          gameStateRef.current = advanceGame(current, {
            turnLeft: inputRef.current.turnLeft,
            turnRight: inputRef.current.turnRight,
          });
        }
      }

      const state = gameStateRef.current;
      const scale = scaleRef.current;
      const targetCamera = getCameraTarget(state, scale);
      cameraRef.current = smoothCamera(cameraRef.current, targetCamera, 0.35);

      ctx = resizeCanvas(canvas, scale, ctxRef) ?? ctx;
      if (ctx) {
        drawGame(ctx, state, scale, cameraRef.current);
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
  }, [resetCamera, syncUiIfNeeded]);

  const { width, height } = getCanvasSize(
    scaleRef.current,
    VIEWPORT_SIZE,
  );

  return (
    <div className="game">
      <Scoreboard ui={ui} onRestart={handleRestart} />

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
        Hold <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> to steer in
        any direction. Trap rivals — their body turns into pellets when they die.
      </p>
    </div>
  );
}
