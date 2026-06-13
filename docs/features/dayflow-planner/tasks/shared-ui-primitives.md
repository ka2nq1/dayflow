---
id: T5
title: "Build shared UI primitives"
layer: ui
deps: ["T1"]
acs: ["AC-07b", "AC-09e", "AC-12d", "AC-12f"]
files_hint: ["src/shared/ui/"]
owner: Aleksandr
estimate: M
status: todo
---

# T5 — Build shared UI primitives

## Why

[sad.md §5](../sad.md) lists shared UI components used across dashboard, long-term, and backup flows. Destructive-action ACs (AC-07b, AC-09e, AC-12d, AC-12f) require a reusable confirm dialog. No existing design system in repo (greenfield) — new primitives follow mobile-first minimalist styling from global tokens in T1.

## What

- Create CSS Modules components in `src/shared/ui/`:
  - `Input` — text field with label, error message slot, ref forwarding (quick-add + inline edit).
  - `Button` — primary/secondary/danger variants.
  - `Checkbox` — accessible toggle for task/step completion.
  - `ConfirmDialog` — modal with confirm/cancel; blocks action until explicit confirm.
  - `InlineError` — plain-language error banner for domain sentinel messages.
- Apply global tokens from `src/app/styles/tokens.css` (dark, mobile-first, touch targets ≥ 44px).
- Keyboard accessible: focus trap in dialog, Enter/Escape handling.

## Definition of Done

- [ ] Components render in Storybook or a minimal Vitest + Testing Library smoke test.
- [ ] ConfirmDialog withholds destructive callback until confirm clicked (maps to AC-07b pattern).
- [ ] No imports from `features/` or `pages/` — shared layer only.
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T2/T3 after T1.
- Page tasks (T10–T12) compose these primitives — do not duplicate markup.
