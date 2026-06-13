# Architecture map — dayflow

> Greenfield scaffold established by T1 (dayflow-planner implement).
> `reflects_commit`: (pending first commit)

## Stack

- **Runtime:** TypeScript 5 + React 18 + Vite 5
- **PWA:** `vite-plugin-pwa` (installable SPA, service worker)
- **Persistence:** IndexedDB (ADR-0002) — wired in T2+
- **Routing:** React Router 6
- **Testing:** Vitest + Testing Library + fake-indexeddb

## Folder structure (FSD lite)

```
src/
  app/       → providers, global styles, App shell, layout
  pages/     → route-level screens (dashboard, long-term, settings)
  features/  → user interactions (quick-add, task-crud, rollover, backup)
  entities/  → domain types + repository ports
  shared/    → ui primitives, lib helpers, storage layer
```

**Import rule:** each layer imports only from layers below it.

`app → pages → features → entities → shared`

## Conventions

- Strict TypeScript, no `any`
- CSS Modules for component styles; design tokens in `src/app/styles/tokens.css`
- UUID v4 record ids; ISO calendar-day strings for `activeDate`
- List ordering: `createdAt` ascending (oldest first)
