export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type GameMode = "solo" | "duel";

export type Position = {
  x: number;
  y: number;
};

export type PlayerId = 1 | 2;

export type GameStatus = "countdown" | "playing" | "ended";

export type EndReason =
  | "wall"
  | "self"
  | "snake"
  | "head-to-head"
  | "bullet"
  | "enemy"
  | null;

export type EnemyKind = "hunter" | "patroller" | "striker" | "warden";

export type AttackKind = "shot" | "spread" | "burst" | "beam";

export type Enemy = {
  id: number;
  kind: EnemyKind;
  position: Position;
  direction: Direction;
  moveCooldown: number;
  attackCooldown: number;
};

export type Bullet = {
  id: number;
  position: Position;
  direction: Direction;
  kind: AttackKind;
  speed: number;
  ttl?: number;
};

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
  food: Position[];
  enemies: Enemy[];
  bullets: Bullet[];
  tick: number;
  nextBulletId: number;
  status: GameStatus;
  countdown: number;
  winner: PlayerId | "draw" | null;
  message: string;
};

export type KeyBindings = Record<string, Direction>;
