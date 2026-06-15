export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type Turn = "left" | "right";

export type Position = {
  x: number;
  y: number;
};

export type SnakeColor = {
  head: string;
  body: string;
  glow: string;
};

export type Snake = {
  id: number;
  body: Position[];
  direction: Direction;
  score: number;
  alive: boolean;
  isPlayer: boolean;
  color: SnakeColor;
  pendingTurn: Turn | null;
};

export type GameStatus = "playing" | "ended";

export type EndReason = "wall" | "self" | "snake" | "head-to-head" | null;

export type GameState = {
  gridSize: number;
  player: Snake;
  opponents: Snake[];
  pellets: Position[];
  status: GameStatus;
  message: string;
  tick: number;
  nextSnakeId: number;
};
