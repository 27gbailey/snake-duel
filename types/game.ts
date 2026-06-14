export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type GameMode = "solo" | "duel";

export type Position = {
  x: number;
  y: number;
};

export type PlayerId = 1 | 2;

export type GameStatus = "playing" | "ended";

export type EndReason =
  | "wall"
  | "self"
  | "snake"
  | "head-to-head"
  | null;

export type PlayerState = {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  score: number;
  alive: boolean;
  endReason: EndReason;
};

export type GameState = {
  gridSize: number;
  mode: GameMode;
  players: Record<PlayerId, PlayerState>;
  food: Position;
  status: GameStatus;
  winner: PlayerId | "draw" | null;
  message: string;
};

export type KeyBindings = Record<string, Direction>;
