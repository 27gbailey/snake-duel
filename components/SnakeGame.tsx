"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PLAYER_1_KEYS,
  PLAYER_2_KEYS,
  TICK_MS,
} from "@/lib/game/constants";
import {
  advanceGame,
  beginPlaying,
  createInitialGameState,
  setPlayerDirection,
} from "@/lib/game/gameEngine";
import {
  drawGame,
  getCanvasSize,
  getCellSize,
} from "@/lib/game/renderer";
import type { GameMode, GameState } from "@/types/game";
import Scoreboard from "./Scoreboard";

export default function SnakeGame() {
  const [mode, setMode] = useState<GameMode>("duel");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(createInitialGameState("duel"));
  const [gameState, setGameState] = useState<GameState>(createInitialGameState("duel"));
  const [cellSize, setCellSize] = useState(16);

  const syncState = useCallback((state: GameState) => {
    gameStateRef.current = state;
    setGameState(state);
  }, []);

  const handleRestart = useCallback(() => {
    syncState(createInitialGameState(mode));
  }, [mode, syncState]);

  const handleModeChange = useCallback(
    (nextMode: GameMode) => {
      setMode(nextMode);
      syncState(createInitialGameState(nextMode));
    },
    [syncState],
  );

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
      const state = gameStateRef.current;
      let nextState = state;

      if (PLAYER_1_KEYS[key]) {
        event.preventDefault();
        nextState = setPlayerDirection(state, 1, PLAYER_1_KEYS[key]);
      } else if (state.mode === "duel" && PLAYER_2_KEYS[key]) {
        event.preventDefault();
        nextState = setPlayerDirection(state, 2, PLAYER_2_KEYS[key]);
      } else if (state.mode === "solo" && PLAYER_2_KEYS[key]) {
        event.preventDefault();
        nextState = setPlayerDirection(state, 1, PLAYER_2_KEYS[key]);
      }

      if (nextState !== state) {
        syncState(nextState);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [syncState]);

  useEffect(() => {
    if (gameState.status !== "countdown") {
      return;
    }

    const timer = window.setInterval(() => {
      const current = gameStateRef.current;
      if (current.status !== "countdown") {
        return;
      }

      if (current.countdown <= 1) {
        syncState(beginPlaying(current));
        return;
      }

      syncState({
        ...current,
        countdown: current.countdown - 1,
        message: `Starting in ${current.countdown - 1}...`,
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState.status, syncState]);

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
        onModeChange={handleModeChange}
      />

      <div ref={containerRef} className="game__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="game__canvas"
          aria-label={
            gameState.mode === "solo"
              ? "Single-player snake game board"
              : "Two-player snake game board"
          }
        />
        {gameState.status === "countdown" && gameState.countdown > 0 && (
          <div className="game__countdown" aria-live="polite">
            {gameState.countdown}
          </div>
        )}
      </div>

      <p className="game__hint">
        {gameState.mode === "solo" ? (
          <>
            Controls: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or Arrow keys
            · Enemies move and use 4 attack types
          </>
        ) : (
          <>
            Player 1: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
            · Player 2: Arrow keys · Dodge moving enemies
          </>
        )}
      </p>
    </div>
  );
}
