# Snake.IO

A single-player Snake.IO-style arena built with Next.js, TypeScript, and HTML5 Canvas.

## Features

- **Always forward** — your snake never stops; you only steer
- **Arrow key turning** — `←` and `→` rotate your head left or right
- **Rival snakes** — AI opponents roam the arena
- **Trap to score** — force rivals into your body (or walls) to steal their points
- **Pellets** — eat glowing pellets to grow; dead snakes drop mass you can absorb
- **50×50 arena** with responsive canvas scaling

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Controls

| Key | Action |
|-----|--------|
| `←` | Turn left |
| `→` | Turn right |

## Project Structure

```
types/game.ts           — Shared TypeScript types
lib/game/constants.ts   — Grid size, colors, tuning
lib/game/direction.ts   — Movement and turning helpers
lib/game/collision.ts   — Collision and head-to-head logic
lib/game/ai.ts          — Rival snake steering
lib/game/gameEngine.ts  — Game state and tick advancement
lib/game/renderer.ts    — Canvas drawing
components/SnakeGame.tsx — Main game component
components/Scoreboard.tsx — Score display and restart
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
