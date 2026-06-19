# Slice & Serve — Pizza Restaurant Simulator

A day-based pizza restaurant management game built with **Next.js 15**, **TypeScript**, **React**, **Tailwind CSS**, and **Zustand**.

## Gameplay

- Customers arrive one at a time and place orders in natural language
- Build pizzas with dough, sauce, cheese, and toppings across halves and quarters
- Bake, cut, and serve — customer patience and order accuracy affect tips and reputation
- Manage inventory, buy upgrades, and track daily profit
- Progress through days with increasing difficulty and special events

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| State | Zustand + LocalStorage persistence |
| Deploy | Vercel-ready |

## Architecture

```
features/game/
  types/          — shared TypeScript types
  data/           — configurable toppings, upgrades, dialogue
  engines/        — game, customer, order, validation, economy, inventory
                    save/load, achievements, upgrades
  store/          — Zustand game store
components/
  screens/        — all UI screens
  pizza/          — pizza construction UI
  ui/             — reusable components
lib/persistence/  — repository abstraction (PostgreSQL-ready)
```

### Engines

- **Game engine** — day loop, pizza lifecycle, starting state
- **Customer engine** — procedural customers, patience, satisfaction, tips
- **Order engine** — natural language → structured pizza requirements
- **Pizza validation engine** — scores built pizzas against orders
- **Economy engine** — revenue, costs, restocking, upgrades
- **Inventory engine** — stock tracking and low-stock warnings
- **Save/load system** — `LocalSaveRepository` / `IndexedDbSaveRepository`
- **Achievement system** — unlock tracking
- **Upgrade system** — purchasable restaurant improvements

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

### Vercel (recommended)

**Dashboard (easiest)**

1. Open [Import `snake-duel` on Vercel](https://vercel.com/new/import?s=https://github.com/27gbailey/snake-duel)
2. Sign in with GitHub as **27gbailey**
3. Import **snake-duel**
4. Use these settings (defaults are usually correct):

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | *(leave empty)* |
| Root Directory | *(leave empty)* |

5. **Do not** set `GITHUB_PAGES=true` — that env var is only for the GitHub Pages static export.
6. Click **Deploy**

Pushes to `main` will trigger automatic production deploys.

**CLI**

```bash
npm install
bash scripts/setup-vercel.sh   # opens import page + prints steps
npx vercel login
npx vercel link
npm run vercel:preview   # preview deployment
npm run vercel:deploy    # production
```

**Production URL**

After deploy, Vercel assigns a URL like:

`https://snake-duel-<hash>.vercel.app`

You can add a custom domain in **Project → Settings → Domains**.

### GitHub Pages

Pushes to `main` run `.github/workflows/deploy.yml` automatically.

Live URL: https://27gbailey.github.io/snake-duel/

Local static build:

```bash
npm run build:pages
```

## Adding Toppings

Edit `features/game/data/toppings.ts` to add new toppings without changing game logic.

## Persistence

Saves are stored in LocalStorage via Zustand persist. The `SaveRepository` interface in `features/game/engines/saveLoadSystem.ts` is ready to swap for PostgreSQL later.

## Screens

- Main menu
- Restaurant (customer queue)
- Pizza prep station
- Oven
- Cutting station
- Shop
- Upgrades
- Inventory
- Daily summary
- Statistics
- Settings

## License

MIT
