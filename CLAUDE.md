# @hintoric/ui

Joy UI's look and API, built on Base UI (behavior) and Tailwind CSS (styling). See `docs/superpowers/specs/2026-09-02-hintoric-ui-design.md` for the design and `docs/superpowers/plans/2026-09-02-hintoric-ui-phase-1.md` for the implementation history and every "discovered during implementation" correction made against the real `@mui/joy` package.

## Hard requirement: every component needs full visual regression coverage

Every component in `packages/ui/src/components/*` — new or modified — **must** have a matching `packages/ui/src/visual/<Component>.visual.test.tsx` that:

1. Renders the real `@mui/joy` component and our own component side by side, for **every variant the component supports** (`solid`/`soft`/`outlined`/`plain` where applicable) **crossed with every color** (`primary`/`neutral`/`danger`/`success`/`warning` where applicable) — not a representative subset. If a component has no `variant`/`color` axis (e.g. Card's default), test its actual supported states instead.
2. Covers **interactive/focus states** where the component has them (`:focus-within` ring, `:hover`, `:disabled`) — not just the resting state. Input's focus ring is the reason this rule exists: it was the kind of bug a resting-state-only screenshot would never catch.
3. Asserts pass/fail via `getComputedStyle()` equality on the properties that define the component's look (`backgroundColor`, `color`, `borderColor`, `borderRadius`, `boxShadow`, `minHeight`/`width`/`height`, padding, `cursor` — whichever apply). This is the actual test signal.
4. Also calls Vitest's real `toMatchScreenshot()` on both the Joy and the Hintoric element, committing the resulting PNGs under `__screenshots__/`. These are for humans to review, not the pass/fail logic — two independently-rendered elements can differ by a stray anti-aliased pixel even when every computed style is identical, so a raw image-diff between them would be noisy. (`toMatchScreenshot()` only supports comparing a live screenshot against its own stored baseline anyway — see the Vitest docs — it can't directly diff two live elements against each other.)

Run these with `pnpm --filter @hintoric/ui test:visual` (separate from the jsdom `pnpm test`, since jsdom can't lay out real CSS well enough to compare computed styles — see `vitest.visual.config.ts`). First run of a new assertion creates its baseline screenshot and fails on purpose ("no existing reference screenshot found") — rerun once to confirm it now passes, and open the new PNG under `__screenshots__/` to actually look at it before trusting it.

Baselines are named per browser+platform (`*-chromium-darwin.png` on macOS) and are local-only for now — no CI wiring exists yet (would need a consistent, likely containerized, environment first).

## Everyday commands (from `packages/ui/`)

- `pnpm test` — jsdom unit tests (fast, no real CSS rendering)
- `pnpm test:visual` — real-browser visual regression tests against real `@mui/joy` (see above)
- `pnpm typecheck` — from repo root: `pnpm typecheck` builds the library first, then typechecks both packages (playground depends on the built `dist/`)
- `pnpm lint` — from repo root
- `pnpm build` — builds `dist/index.js` + `dist/style.css`

## Don't re-derive what's already been reverse-engineered

Every color/spacing/shadow/radius token in `packages/ui/src/styles/theme.css` and every per-variant class map in `packages/ui/src/utils/colorVariantClasses.ts` was copied from real `@mui/joy` source or measured against the real rendered package — not guessed. If something looks off, it's more likely a token this project hasn't reverse-engineered yet than a wrong assumption in the existing tokens. Check the Phase 1 plan's "Post-Phase-1" addenda first; if it's genuinely new, verify against the real package (a throwaway `@mui/joy` + `@emotion/react` + `@emotion/styled` sandbox, or the visual test suite above) before changing a token, and document what you found the same way those addenda do.
