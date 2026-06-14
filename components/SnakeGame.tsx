"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PLAYER_1_KEYS,
  PLAYER_2_KEYS,
  TICK_MS,
} from "@/lib/game/constants";
import {
  advanceGame,
  createInitialGameState,
  setPlayerDirection,
} from "@/lib/game/gameEngine";
import {
  drawGame,
  getCanvasSize,
  getCellSize,
} from "@/lib/game/renderer";
import type { GameState } from "@/types/game";
import Scoreboard from "./Scoreboard";

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(createInitialGameState());
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [cellSize, setCellSize] = useState(16);

  const syncState = useCallback((state: GameState) => {
    gameStateRef.current = state;
    setGameState(state);
  }, []);

  const handleRestart = useCallback(() => {
    const fresh = createInitialGameState();
    syncState(fresh);
  }, [syncState]);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const size = getCellSize(clientWidth, clientHeight);
      setCellSize(size > 0 ? size : 16);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      let state = gameStateRef.current;

      if (PLAYER_1_KEYS[key]) {
        event.preventDefault();
        state = setPlayerDirection(state, 1, PLAYER_1_KEYS[key]);
      } else if (PLAYER_2_KEYS[key]) {
        event.preventDefault();
        state = setPlayerDirection(state, 2, PLAYER_2_KEYS[key]);
      }

      if (state !== gameStateRef.current) {
        syncState(state);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [syncState]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = gameStateRef.current;
      if (current.status !== "playing") return;

      const next = advanceGame(current);
      if (next !== current) {
        syncState(next);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [syncState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGame(ctx, gameState, cellSize);
  }, [gameState, cellSize]);

  const { width, height } = getCanvasSize(cellSize);

  return (
    <div className="game">
      <Scoreboard
        gameState={gameState}
        onRestart={handleRestart}
      />

      <div ref={containerRef} className="game__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="game__canvas"
          aria-label="Two-player snake game board"
        />
      </div>

      <p className="game__hint">
        Player 1: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
        · Player 2: Arrow keys
      </p>
    </div>
  );
}
