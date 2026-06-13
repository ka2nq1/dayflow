# DayFlow

Offline-first installable daily planner PWA — prefix capture, rollover, long-term goals, manual backup.

## Requirements

- Node.js 20+ (`nvm use` reads `.nvmrc`)

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production + PWA service worker
npm run test     # unit + integration tests
npm run lint
```

## Architecture

Feature-Sliced Design lite — see `docs/architecture-map.md`.

Feature spec and tasks: `docs/features/dayflow-planner/`.
