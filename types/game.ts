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
  angle: number;
  score: number;
  alive: boolean;
  isPlayer: boolean;
  color: SnakeColor;
  moveAccumulator: number;
  speed: number;
  sizeScale: number;
  aiTargetAngle: number;
  aiTargetUntilTick: number;
};

export type GameStatus = "playing" | "ended";

export type EndReason = "wall" | "snake" | "head-to-head" | null;

export type Camera = {
  x: number;
  y: number;
};

export type PlayerInput = {
  turnLeft: boolean;
  turnRight: boolean;
};

export type GameState = {
  worldSize: number;
  viewportSize: number;
  player: Snake;
  opponents: Snake[];
  pellets: Position[];
  status: GameStatus;
  message: string;
  tick: number;
  nextSnakeId: number;
};
