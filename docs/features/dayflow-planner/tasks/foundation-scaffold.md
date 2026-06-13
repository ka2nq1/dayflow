---
id: T1
title: "Scaffold Vite React PWA + FSD skeleton"
layer: wiring
deps: []
acs: ["AC-13"]
files_hint: ["package.json", "vite.config.ts", "tsconfig.json", "src/app/", "index.html"]
owner: Aleksandr
estimate: M
status: todo
---

# T1 — Scaffold Vite React PWA + FSD skeleton

## Why

Greenfield repo needs the stack declared in [sad.md §2](../sad.md) and [ADR-0001](../adr/0001-deliver-as-installable-pwa-spa.md) before any feature work. `survey` should persist conventions in `docs/architecture-map.md` — this task materializes that scaffold.

## What

- Bootstrap Vite 5 + React 18 + TypeScript (strict, no `any`).
- Add `vite-plugin-pwa` with manifest stub and service-worker registration hook in `src/app/`.
- Create FSD-lite folder skeleton per [sad.md §5](../sad.md): `app/`, `pages/`, `features/`, `entities/`, `shared/`.
- Wire `App.tsx` with React Router shell (placeholder routes for dashboard and long-term).
- Add global CSS tokens stub in `src/app/styles/` (minimal — full design pass comes with UI tasks).
- Configure ESLint + Vitest; add an import-rule lint or path alias guard for FSD layer direction.

## Definition of Done

- [ ] `npm run dev` serves the app; `npm run build` produces static assets.
- [ ] Router renders placeholder dashboard and long-term routes.
- [ ] FSD folder skeleton exists with a documented import rule in `docs/architecture-map.md` (or README section if survey not yet run).
- [ ] PWA plugin registered; web manifest present (icons can be placeholders).
- [ ] Lint + typecheck clean.

## Notes

- Lane shares `src/app/` with T13 (PWA wiring) and T14 (routing) — T13/T14 extend, do not rewrite.
- No IndexedDB or feature logic in this task — shell only.
