# Byte Runner — Ultimate Edition

A neon-arcade Canvas platformer with a switchable 2D side-view and a first-person 3D view, local co-op, five levels, powerups, boss-free but hazard-packed gameplay, combo scoring, and a local leaderboard. Runs entirely client-side — no build step, no backend.

## Play locally

Any static file server works, since the game only uses `fetch`-free vanilla JS, Canvas 2D, and the Web Audio API.

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed local URL in your browser.

## Deploy to Vercel

**Option A — Vercel dashboard (no CLI):**
1. Push this folder to a GitHub repo (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other** (it's a static site — no build command needed).
4. Click **Deploy**.

**Option B — Vercel CLI:**
```bash
npm i -g vercel
cd byte-runner
vercel
```

## Push to GitHub

```bash
cd byte-runner
git init
git add .
git commit -m "Byte Runner: initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/byte-runner.git
git push -u origin main
```

## Project structure

```
byte-runner/
├── index.html       # entry point, canvas + UI chrome
├── css/style.css     # layout, buttons, touch controls
├── js/game.js        # all game logic (physics, rendering, levels, audio)
├── vercel.json        # static hosting headers/caching config
└── package.json       # optional local dev script (npm run dev)
```

## Controls

| Action | Key |
|---|---|
| Move | Arrow Left/Right (P1), A/D (P2 in co-op) |
| Jump / Double jump | Arrow Up or Space (P1), W (P2) |
| Toggle 2D/3D view | V |
| Restart level | R |
| Pause | P |
| Mute | M |
| Fullscreen | F |

Touch controls appear automatically on mobile/tablet.

## What's new in this edition

- **Coyote time + jump buffering** — jump inputs near a ledge or landing feel forgiving instead of frame-perfect.
- **Magnet powerup** — pulls nearby coins toward you for a limited time.
- **Combo scoring** — chain enemy stomps within ~1.5s for up to a 5x score multiplier.
- **Local leaderboard** — top 5 scores persist in `localStorage` and are viewable from the main menu.
- **Two new levels** (4 and 5) with denser hazards and platforming.
- **Redesigned HUD** — heart-based lives, combo/level progress indicators, powerup fuel bars.
- **Optional screen shake** on hits and stomps (toggle in Settings).
- **Level select** now scales to any number of levels and shows a difficulty rating.

## Notes

- All game state (XP, level, high scores, mute/shake settings) is stored in the browser's `localStorage`, so progress is per-browser, not synced across devices.
- The game is a single dependency-free bundle — no npm packages are required to run it, only to serve the static files locally if you don't already have a preferred method.
