"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TICK_MS, TURN_KEYS } from "@/lib/game/constants";
import { getCamera } from "@/lib/game/camera";
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
    syncState(createInitialGameState());
  }, [syncState]);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const size = getCellSize(
        clientWidth,
        clientHeight,
        gameStateRef.current.viewportCells,
      );
      setCellSize(size > 0 ? size : 16);
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
      const nextState = setPlayerTurn(gameStateRef.current, turn);

      if (nextState !== gameStateRef.current) {
        syncState(nextState);
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

    const camera = getCamera(gameState, cellSize);
    drawGame(ctx, gameState, cellSize, camera);
  }, [gameState, cellSize]);

  const { width, height } = getCanvasSize(cellSize, gameState.viewportCells);
  const rivalsAlive = gameState.opponents.filter((opponent) => opponent.alive).length;

  return (
    <div className="game">
      <Scoreboard
        gameState={gameState}
        rivalsAlive={rivalsAlive}
        onRestart={handleRestart}
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
        Steer with <kbd>←</kbd> <kbd>→</kbd> (8 directions). Cross your own trail safely — trap rivals to absorb their full length.
      </p>
    </div>
  );
}
