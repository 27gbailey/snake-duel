"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TICK_MS, TURN_KEYS, VIEWPORT_CELLS } from "@/lib/game/constants";
import {
  getCameraTarget,
  smoothCamera,
} from "@/lib/game/camera";
import {
  advanceGame,
  createInitialGameState,
  setPlayerTurn,
} from "@/lib/game/gameEngine";
import {
  drawGame,
  getCanvasSize,
  getCellSize,
} from "@/lib/game/renderer";
import type { Camera, GameState } from "@/types/game";
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

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(createInitialGameState());
  const cellSizeRef = useRef(16);
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const uiRef = useRef<UiSnapshot>(toUiSnapshot(gameStateRef.current));

  const [ui, setUi] = useState<UiSnapshot>(uiRef.current);
  const [cellSize, setCellSize] = useState(16);

  const syncUiIfNeeded = useCallback(() => {
    const next = toUiSnapshot(gameStateRef.current);
    if (uiChanged(uiRef.current, next)) {
      uiRef.current = next;
      setUi(next);
    }
  }, []);

  const handleRestart = useCallback(() => {
    const fresh = createInitialGameState();
    gameStateRef.current = fresh;
    uiRef.current = toUiSnapshot(fresh);
    setUi(uiRef.current);
    cameraRef.current = getCameraTarget(fresh, cellSizeRef.current);
  }, []);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const size = getCellSize(
        clientWidth,
        clientHeight,
        gameStateRef.current.viewportCells,
      );
      const nextSize = size > 0 ? size : 16;
      cellSizeRef.current = nextSize;
      setCellSize(nextSize);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const turn = TURN_KEYS[event.key];
      if (!turn) {
        return;
      }

      event.preventDefault();
      gameStateRef.current = setPlayerTurn(gameStateRef.current, turn);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let running = true;
    let lastFrame = performance.now();
    let tickAccumulator = 0;
    let uiFrame = 0;

    cameraRef.current = getCameraTarget(
      gameStateRef.current,
      cellSizeRef.current,
    );

    const frame = (now: number) => {
      if (!running) {
        return;
      }

      const delta = now - lastFrame;
      lastFrame = now;
      tickAccumulator += delta;

      while (tickAccumulator >= TICK_MS) {
        tickAccumulator -= TICK_MS;
        const current = gameStateRef.current;
        if (current.status === "playing") {
          gameStateRef.current = advanceGame(current);
        }
      }

      const state = gameStateRef.current;
      const size = cellSizeRef.current;
      const targetCamera = getCameraTarget(state, size);
      cameraRef.current = smoothCamera(cameraRef.current, targetCamera);

      drawGame(ctx, state, size, cameraRef.current);

      uiFrame += 1;
      if (uiFrame % 5 === 0) {
        syncUiIfNeeded();
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    return () => {
      running = false;
    };
  }, [syncUiIfNeeded]);

  const { width, height } = getCanvasSize(cellSize, VIEWPORT_CELLS);

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
        Steer with <kbd>←</kbd> <kbd>→</kbd> (8 directions). Cross your own trail safely — trap rivals to absorb their length.
      </p>
    </div>
  );
}
