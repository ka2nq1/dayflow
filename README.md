# DayFlow

Offline-first installable daily planner PWA — prefix capture, rollover, long-term goals, manual backup.

## Requirements

- Node.js 20+ (`nvm use` reads `.nvmrc`)

## Commands

```bash
npm install
npm run dev      # local dev server → http://127.0.0.1:5173
npm run build    # production + PWA service worker
npm run build:pages  # production build for GitHub Pages (/dayflow/)
npm run preview  # serve dist locally
npm run test     # unit + integration tests
npm run lint
```

## Deploy to GitHub Pages

Live URL after deploy: **https://ka2nq1.github.io/dayflow/**

1. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and deploys automatically.
3. On your phone: open the URL → browser menu → **Add to Home Screen** for the PWA icon.

Manual build (same as CI):

```bash
npm run build:pages
```

## Architecture

Feature-Sliced Design lite — see `docs/architecture-map.md`.

Feature spec and tasks: `docs/features/dayflow-planner/`.
