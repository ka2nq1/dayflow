---
id: T13
title: "Wire PWA offline shell"
layer: wiring
deps: ["T1", "T10"]
acs: ["AC-13"]
files_hint: ["vite.config.ts", "src/app/", "public/manifest.webmanifest"]
owner: Aleksandr
estimate: S
status: todo
---

# T13 — Wire PWA offline shell

## Why

[ADR-0001](../adr/0001-deliver-as-installable-pwa-spa.md) and [spec AC-13](../spec.md) require installable offline use. [sad.md §6 Install and use offline](../sad.md) describes service worker caching app shell and IndexedDB reads on offline open.

## What

- Configure `vite-plugin-pwa` workbox strategy: precache app shell (JS/CSS/HTML); network-first not required for API (none exists).
- Complete `manifest.webmanifest` — name, icons, `display: standalone`, theme colors matching tokens.
- Register service worker in `src/app/`; handle update prompt optionally (minimal — skip nagging in v1).
- Verify dashboard loads and quick-add write works with network disabled after install (AC-13).

## Definition of Done

- [ ] Production build is installable on mobile browser (manual AC-13 checklist: install → airplane mode → add task).
- [ ] Service worker serves cached shell on offline reload.
- [ ] IndexedDB operations unaffected by offline state (no fetch dependencies in core flows).
- [ ] Lint + typecheck clean.

## Notes

- Depends on T10 so the dashboard route exists to smoke-test offline read/write.
- Shares `src/app/` and `vite.config.ts` with T1 — extend, don't rewrite.
