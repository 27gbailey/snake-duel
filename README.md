# Snake Duel

A two-player Snake game built with Next.js, TypeScript, and HTML5 Canvas.

## Features

- **50×50 grid** with wall, self, and snake-to-snake collisions
- **Head-to-head draw** when both snakes collide at the same cell
- **Shared keyboard**: Player 1 uses WASD, Player 2 uses arrow keys
- **Scoreboard** with per-player scores and game-over messaging
- **Restart button** to reset the match
- **Responsive layout** — canvas scales to fit the viewport

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Controls

| Player   | Keys        |
|----------|-------------|
| Player 1 | W A S D     |
| Player 2 | Arrow keys  |

## Project Structure

```
types/game.ts           — Shared TypeScript types
lib/game/constants.ts   — Grid size, colors, key bindings
lib/game/direction.ts   — Movement and position helpers
lib/game/collision.ts   — Collision detection logic
lib/game/gameEngine.ts  — Game state and tick advancement
lib/game/renderer.ts    — Canvas drawing
components/SnakeGame.tsx — Main game component
components/Scoreboard.tsx — Score display and restart
```

## Deploy

The project is configured for static export and GitHub Pages.

### Option A: GitHub Pages (recommended)

1. Authenticate with GitHub (one-time):

```bash
gh auth login
```

2. Run the deploy script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Your game will be live at `https://<your-username>.github.io/snake-duel/` after the GitHub Actions workflow finishes.

### Option B: Vercel

```bash
npm install
npx vercel login
npx vercel --prod
```

Vercel does not require the `GITHUB_PAGES` base path. For Vercel deploys, build with:

```bash
npm run build
```

### Manual build

```bash
npm install
GITHUB_PAGES=true npm run build
```

Static files are written to `out/`.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
