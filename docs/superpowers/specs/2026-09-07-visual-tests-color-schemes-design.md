# Colour schemes in the visual regression suite

**Date:** 2026-09-07
**Prompted by:** the suite has 63 test files, 1248 committed baseline PNGs and 0 assertions in dark mode. Every token in `[data-color-scheme="dark"]` (theme.css:210-345) was derived from `@mui/joy` source and has never been verified against the rendered package.

## Goal

Every component in `packages/ui/src/components/*` is covered in **both** colour schemes:

- components with an `@mui/joy` counterpart — computed-style parity against real Joy, in light **and** dark;
- our own components and blocks — self-baseline screenshots per scheme, plus one assertion that dark actually differs from light.

Scope for this design: all 63 existing test files, plus 19 new files for the components that have none (18 uncovered components and the new `ConfirmationDialog`).

## Why dark parity is the valuable half

Light-mode parity is already asserted 1248 times. Dark mode is asserted zero times, and our dark tokens are a *reverse-engineered copy* of Joy's — the exact situation CLAUDE.md warns about under "Don't re-derive what's already been reverse-engineered". Expect real divergences to surface in Phase 2. That is the point of the exercise, not a risk to be managed.

The 2026-09-06 coverage audit is the precedent: adding assertions to one already-passing component (`Select`) turned up five real divergences.

## Mechanism: the mode is document state

`setColorScheme(mode)` sets **both** attributes on `document.documentElement`:

- `data-color-scheme` — ours (theme.css:210)
- `data-joy-color-scheme` — Joy's (`@mui/system` `createCssVarsProvider.js:199-201` generates `:root, [data-joy-color-scheme="light"] {…}` for the default scheme and `[data-joy-color-scheme="dark"] {…}` for the other)

Both selectors are attribute-based, so setting them on `<html>` puts the whole document, portals included, in one scheme. Light and dark therefore run **sequentially**, not as siblings in one document.

### Why not wrapper-`div` scopes

A wrapper `div` carrying the attribute was the first design and is wrong: `Menu`, `Modal`, `Drawer`, `Tooltip`, `Snackbar`, `Select` and `Autocomplete` render their popup into a portal on `body`, outside the wrapper. Those popups would have no scheme ancestor and would render light inside a dark test — silently, and in exactly the components where a dark bug is hardest to notice.

The pairing the suite needs is Joy-vs-Hintoric, never light-vs-dark, so nothing is lost by serialising the modes.

### Helper API (`visual/helpers.ts`)

```ts
export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * Puts the whole document in `mode` — on <html>, not on a wrapper, so that
 * portalled popups (Menu/Modal/Drawer/Tooltip/Snackbar/Select/Autocomplete)
 * inherit it too. Awaits settleTransitions(): `transition-colors` is on every
 * interactive component, so a synchronous getComputedStyle() right after the
 * flip reads an intermediate value.
 */
export async function setColorScheme(mode: ColorScheme): Promise<void>;
```

Joy providers additionally get `defaultMode={scheme}` so Joy's JS-side mode matches its CSS-side mode.

### `visual/setup.ts` additions

- `beforeEach`: `localStorage.clear()`. Joy reads `joy-mode` and our `ColorSchemeProvider` reads `hintoric-color-scheme` **during init**, and a stored value overrides `defaultMode`. Without this, one dark test can tint every test after it.
- `afterEach`: reset the document to `light`, for the same reason.
- `body { background: var(--color-canvas) }`. Without a scheme-aware page background, dark-mode screenshots of `plain` and `outlined` variants show dark text on a white page and are useless to review. Light-mode output is unaffected — `--color-canvas` is white in light mode — so existing baselines stay pixel-identical.

### Known limitation, not fixed here

Our light tokens live in Tailwind's `@theme { }` block (theme.css:1-208), which compiles to `:root`. There is no `[data-color-scheme="light"]` block, so a light-mode island nested inside a dark region stays dark. Joy supports this (it emits `:root, [data-joy-color-scheme="light"]`); we do not. Fixing it means duplicating every light value into a second hand-maintained block, which is a poor trade for a case no consumer has asked for. Consequence for tests: **never nest scopes** — the mode is document state, and there is only one.

## Screenshot naming and the 1248 existing baselines

Convention: **the scheme suffix goes last in the screenshot id** — `button-solid-primary-joy-light`.

This makes the migration of existing baselines a single mechanical rule for all 1248 files:

```
<name>-chromium-darwin.png  →  <name>-light-chromium-darwin.png
```

Done with `git mv`; contents unchanged, so nothing is re-baselined and the rename is trivially reviewable. Had the suffix gone in the middle of the id (`…-primary-light-joy`), each of the 63 files would have needed its own rename rule.

Three `toMatchScreenshot()` calls currently pass no id and derive the filename from the test name. They get explicit ids, because their test names are about to gain the scheme.

## Two test flavours

### Flavour A — Joy parity

For the 59 files that compare against real `@mui/joy`, and for new files whose component has a Joy counterpart.

The raster becomes `scheme × variant × color`. Per cell: render Joy and ours in the same scheme, assert `getComputedStyle()` equality on the properties that define the component's look, screenshot both.

No "dark ≠ light" assertion here — Joy has real dark tokens and is the oracle.

### Flavour B — self-baseline

For `DataGrid`, `Grid`, `LocaleSwitcher`, `RelativeTime`, `ConfirmationDialog`, and the specced colour-scheme switcher family. These have no Joy counterpart, so there is nothing to compare against; a self-baseline PNG per scheme is the change-detection signal.

A committed PNG only regresses when a human looks at it, so each Flavour B test adds one assertion a screenshot cannot make: mount once, read computed styles in light, `setColorScheme('dark')`, read again, and assert that at least one of `backgroundColor` / `color` / `borderColor` changed. This catches a hardcoded light colour.

`LocaleSwitcher`'s existing test documents why a *composition* is exempt from Flavour A (its parts each carry full Joy-compared coverage). That reasoning is unchanged and still applies — the exemption is from the parity comparison, not from scheme coverage.

### The layout-only exception

Layout primitives paint nothing, so "dark ≠ light" is unsatisfiable for them. To keep this from being a per-component judgement call, the criterion is objective: **the component's own class list sets no `bg-*` / `text-*` / `border-*` colour utility.**

For those, the rule inverts: assert the layout properties are *identical* across both schemes — a mode switch must not move anything — with a comment stating why the difference assertion does not apply.

Note this exception only ever applies to **Flavour B**: Flavour A has no difference assertion to exempt, because Joy is the oracle. Of the components that are layout-only, only `Grid` is Flavour B today — `Box`, `Stack`, `Container` and `AspectRatio` all have Joy counterparts. Phase 4 may add more (a layout-only block with no Joy counterpart), which is why the criterion is stated as a rule rather than a list.

## Relationship to the 2026-09-06 coverage audit

That audit's finding stands and is not addressed here: **the pass/fail signal is a hand-written property list, and it is short.** This work multiplies coverage along a new axis (schemes) while leaving those lists as they are. A dark-mode bug in a property nobody listed stays invisible.

Its open recommendations are deliberately **out of scope**:

- **P1** — `Input`, `Textarea`, `Autocomplete` shrink to content where Joy fills its container. Component bugs, not test bugs. Fixing them here would mix a component fix into an 82-file test migration.
- **P2** — no test asserts `display` or `width` inside a fixed-width parent.
- **P3** — uncovered hover / focus / disabled states across ~20 components.

**One decision worth taking before Phase 2 starts:** P2 is one extra line per test, and this migration opens all 82 files exactly once anyway. Folding it in costs nearly nothing now and needs a second full pass over the suite later if skipped. P1 and P3 should stay out regardless — P1 is a component fix and P3 is per-component investigation. This is flagged for the reviewer, not decided here.

## Phases

| Phase | Content | Gate |
|---|---|---|
| 0 | Helper, `setup.ts`, rename script; retrofit `Button` (A) and `LocaleSwitcher` (B) | `git status` shows **no modified** light PNGs — proves the migration is lossless. Dark PNGs exist and have been looked at. |
| 1 | CLAUDE.md rules | — |
| 2 | 58 remaining Flavour A retrofits, in batches: Buttons/Actions → Form controls → **Overlays/Portals** → Surfaces → Lists/Nav → Feedback/Data | `pnpm test:visual` green, no modified light PNGs, new dark PNGs listed for review |
| 3 | 3 remaining Flavour B retrofits: `DataGrid`, `Grid`, `RelativeTime` | as above |
| 4 | 19 new files: the 18 uncovered components plus `ConfirmationDialog` | as above |

Overlays/Portals goes early in Phase 2 because that is where the residual risk of the document-state mechanism sits.

Phase 4 is genuinely new work per component — understand the API, set up the Joy counterpart correctly — not a retrofit, which is why it comes last, once the mechanism is proven.

### Execution note

Phase 2–4 batches suit subagents, but Vitest browser mode must not write screenshots concurrently. Agents write tests; the suite run per batch is serialised.

## Expected output

- ~2500 baseline PNGs, roughly double today's 1248.
- Rule 4 of CLAUDE.md's hard requirement asks that baselines be looked at by a human. Each batch reports its new PNGs so that review stays possible; producing them is automated, reviewing them is not.
