---
'@hintoric/ui': major
'@hintoric/email': major
---

A new look. Components are rounder (buttons and fields 12px, cards 24px), flatter (no resting shadow on inputs and cards) and outlined at 1.5px. In light mode, neutrals move from cool blue-grey to warm stone, the page background (`bg-canvas`) is a warm beige with white cards on it, and danger, success and warning use new, more vivid fills with darker text that meets WCAG AA in every state. Dark mode keeps its colours and only changes shape; cards keep their outline there. Primary blue, typography and every prop are unchanged.

To migrate, put `bg-canvas` on your page root if you haven't already: light cards are white with no border and need the canvas behind them to stand out (a Card on another white surface needs a border of its own). Token names are unchanged; token values are not, so anything you built from `--color-neutral-*`, `--color-surface*`, `--radius-*` or `--shadow-xs` changes with it. Emails follow the same palette and radii, and `emailPalettes` and `emailOutlineWidth` are new exports. `@hintoric/icons` illustrations still use the cool greys and will be updated separately.
