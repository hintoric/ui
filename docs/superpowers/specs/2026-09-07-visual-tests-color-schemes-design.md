# Colour schemes in the visual regression suite

**Date:** 2026-09-07
**Prompted by:** the suite has 63 component test files and 1248 committed baseline PNGs, and until 2026-09-07 not one of them rendered anything in dark mode — the whole `[data-color-scheme="dark"]` block (theme.css:210-345) was derived from `@mui/joy` source and never verified against the rendered package.

`DarkTokens.visual.test.tsx` (committed 2026-09-07 for the colour-scheme switcher family) closed part of that gap: it verifies the dark tokens against real Joy for the five primitives those forms are built from — `IconButton`, `ListItemButton`, `Switch`, `Select`, `Button`. This design generalises that from five primitives to every component, and folds the scheme axis into the per-component files rather than a separate one.

## Goal

Every component in `packages/ui/src/components/*` is covered in **both** colour schemes:

- components with an `@mui/joy` counterpart — computed-style parity against real Joy, in light **and** dark;
- our own components and blocks — self-baseline screenshots per scheme, plus one assertion that dark actually differs from light.

Scope for this design: all 63 existing test files, plus 19 new files for the components that have none (18 uncovered components and the new `ConfirmationDialog`). Every file touched also picks up the sizing assertion the 2026-09-06 audit recommended as P2 — see "Relationship to the 2026-09-06 coverage audit".

## Why dark parity is the valuable half

Light-mode parity is already asserted 1248 times. Dark mode is asserted zero times, and our dark tokens are a *reverse-engineered copy* of Joy's — the exact situation CLAUDE.md warns about under "Don't re-derive what's already been reverse-engineered". Expect real divergences to surface in Phase 2. That is the point of the exercise, not a risk to be managed.

The 2026-09-06 coverage audit is the precedent: adding assertions to one already-passing component (`Select`) turned up five real divergences.

## Mechanism: the mode is document state

`setColorScheme(mode)` sets **both** attributes on `document.documentElement`:

- `data-color-scheme` — ours (theme.css:210)
- `data-joy-color-scheme` — Joy's (`@mui/system` `createCssVarsProvider.js:199-201` generates `:root, [data-joy-color-scheme="light"] {…}` for the default scheme and `[data-joy-color-scheme="dark"] {…}` for the other)

Both selectors are attribute-based, so setting them on `<html>` puts the whole document, portals included, in one scheme. Light and dark therefore run **sequentially**, not as siblings in one document.

### Both mechanisms coexist, with a stated division of labour

`visual/darkMode.tsx` already exists (committed 2026-09-07 in `a956fb2`, alongside `DarkTokens`/`DarkVariant`/`DarkModeHarness`) and takes the *other* approach: wrapper `div`s carrying the attribute, via `renderJoyDark` / `renderHintoricDark`. Both approaches have a real argument, and neither subsumes the other:

- **Wrapper scopes** let a light and a dark element coexist in one test document. `defaultMode="dark"` cannot, because it writes onto the shared `<html>`. This is what a side-by-side token grid needs.
- **Document state** is the only thing portalled content inherits. `darkMode.tsx` says so itself: *"Portalled content (Menu, Select's listbox) mounts outside these wrappers and therefore does NOT inherit them."* `Menu`, `Modal`, `Drawer`, `Tooltip`, `Snackbar`, `Select` and `Autocomplete` all portal to `body`, and a wrapper scope would leave their popups light inside a dark test — silently, in exactly the components where a dark bug is hardest to spot.

Division of labour, to be documented in both files:

| Mechanism | Use for |
|---|---|
| `darkMode.tsx` wrapper scopes | tests that show light and dark together in one document — the `DarkTokens` grid and its kin |
| `setColorScheme()` document state | the 82-file retrofit, which necessarily includes every portalled component |

The retrofit does not need light-vs-dark coexistence: its pairing is Joy-vs-Hintoric, both in the *same* scheme, so serialising the modes costs nothing.

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

That audit's core finding still stands: **the pass/fail signal is a hand-written property list, and it is short.** This work multiplies coverage along a new axis (schemes) and adds two properties to every list (below), but the lists remain hand-written. A dark-mode bug in a property nobody thought to list stays invisible, and no amount of scheme coverage changes that.

**P2 is folded into this work** (decided 2026-09-07). Every file this migration touches also gains the audit's missing sizing assertion — `display` and `width` compared inside a fixed-width parent — because the migration opens all 82 files exactly once and doing it later means a second full pass over the same files. It is the assertion that would have caught all four P1 bugs.

**P1 and P3 stay out of scope:**

- **P1** — `Input`, `Textarea` and `Autocomplete` shrink to content where Joy fills its container. These are component bugs, not test bugs; fixing them inside an 82-file test migration would mix two kinds of change in one diff.
- **P3** — uncovered hover / focus / disabled states across ~20 components. Needs per-component investigation, not a mechanical pass.

### Consequence of folding P2 in without fixing P1

Adding the sizing assertion to `Input`, `Textarea` and `Autocomplete` makes those three assertions fail, because the audit already measured the divergence (201px / 210px / 229px against Joy's 400px / 400px / 353.5px).

Those three get `it.fails()` with a comment pointing at P1 in the audit. This is deliberate: `it.fails()` asserts *that the assertion currently fails*, so the known bug is encoded in the suite rather than hidden by a `skip`, the suite stays green, and whoever fixes the component gets a red test telling them to drop the `it.fails()`. A plain `skip` would let the fix land unnoticed and the assertion rot.

The three affected assertions must be listed in the Phase 2 report so the P1 fix has a checklist.

## Phases

| Phase | Content | Gate |
|---|---|---|
| 0 | Helper, `setup.ts`, rename script; retrofit `Button` (A) and `LocaleSwitcher` (B) | `git status` shows **no modified** light PNGs — proves the migration is lossless. Dark PNGs exist and have been looked at. |
| 1 | CLAUDE.md rules | — |
| 2 | 58 remaining Flavour A retrofits, in batches: Buttons/Actions → Form controls → **Overlays/Portals** → Surfaces → Lists/Nav → Feedback/Data | `pnpm test:visual` green, no modified light PNGs, new dark PNGs listed for review, P2 `it.fails()` cases listed |
| 3 | 3 remaining Flavour B retrofits: `DataGrid`, `Grid`, `RelativeTime` | as above |
| 4 | 19 new files: the 18 uncovered components plus `ConfirmationDialog` | as above |

Overlays/Portals goes early in Phase 2 because that is where the residual risk of the document-state mechanism sits.

Phase 4 is genuinely new work per component — understand the API, set up the Joy counterpart correctly — not a retrofit, which is why it comes last, once the mechanism is proven.

### Execution note

Phase 2–4 batches suit subagents, but Vitest browser mode must not write screenshots concurrently. Agents write tests; the suite run per batch is serialised.

## Expected output

- ~2500 baseline PNGs, roughly double today's 1248.
- Rule 4 of CLAUDE.md's hard requirement asks that baselines be looked at by a human. Each batch reports its new PNGs so that review stays possible; producing them is automated, reviewing them is not.
