export type Direction =
  | "UP"
  | "DOWN"
  | "LEFT"
  | "RIGHT"
  | "UP_LEFT"
  | "UP_RIGHT"
  | "DOWN_LEFT"
  | "DOWN_RIGHT";

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

export type EndReason = "wall" | "snake" | "head-to-head" | null;

export type Camera = {
  x: number;
  y: number;
};

export type GameState = {
  gridSize: number;
  viewportCells: number;
  player: Snake;
  opponents: Snake[];
  pellets: Position[];
  status: GameStatus;
  message: string;
  tick: number;
  nextSnakeId: number;
};
