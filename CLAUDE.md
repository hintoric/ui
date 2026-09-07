# @hintoric/ui

Joy UI's look and API, built on Base UI (behavior) and Tailwind CSS (styling). See `docs/superpowers/specs/2026-09-02-hintoric-ui-design.md` for the design and `docs/superpowers/plans/2026-09-02-hintoric-ui-phase-1.md` for the implementation history and every "discovered during implementation" correction made against the real `@mui/joy` package.

## Hard requirement: every component needs full visual regression coverage

Every component in `packages/ui/src/components/*` — new or modified — **must** have a matching `packages/ui/src/visual/<Component>.visual.test.tsx` that:

1. Renders the real `@mui/joy` component and our own component side by side, for **every variant the component supports** (`solid`/`soft`/`outlined`/`plain` where applicable) **crossed with every color** (`primary`/`neutral`/`danger`/`success`/`warning` where applicable) **crossed with both color schemes** (`light`/`dark`) — not a representative subset. If a component has no `variant`/`color` axis (e.g. Card's default), test its actual supported states instead. The scheme axis has no exceptions: every component renders in both.
2. Covers **interactive/focus states** where the component has them (`:focus-within` ring, `:hover`, `:disabled`) — not just the resting state. Input's focus ring is the reason this rule exists: it was the kind of bug a resting-state-only screenshot would never catch.
3. Asserts pass/fail via `getComputedStyle()` equality on the properties that define the component's look (`backgroundColor`, `color`, `borderColor`, `borderRadius`, `boxShadow`, `minHeight`/`width`/`height`, padding, `cursor` — whichever apply), **including `fontSize`, `fontWeight` and `lineHeight`, and `display` plus `width` inside a fixed-width parent**. This is the actual test signal, and it is only as good as the list: `Button` rendered at 16px/500 where Joy uses 14px/600 through 852 green tests, because nothing compared a font property. Sizing has the same history — see P1/P2 in `docs/superpowers/specs/2026-09-06-visual-test-coverage-audit.md`.
4. Also calls Vitest's real `toMatchScreenshot()` on both the Joy and the Hintoric element, committing the resulting PNGs under `__screenshots__/`. These are for humans to review, not the pass/fail logic — two independently-rendered elements can differ by a stray anti-aliased pixel even when every computed style is identical, so a raw image-diff between them would be noisy. (`toMatchScreenshot()` only supports comparing a live screenshot against its own stored baseline anyway — see the Vitest docs — it can't directly diff two live elements against each other.)
5. Sets the scheme with `setColorScheme(scheme)` from `visual/helpers.ts`, which writes `data-color-scheme` and `data-joy-color-scheme` onto `<html>`. It has to be the document, not a wrapper element: `Menu`, `Modal`, `Drawer`, `Tooltip`, `Snackbar`, `Select` and `Autocomplete` portal their popup to `body`, where a wrapper scope never reaches — such a popup renders light inside a dark test, silently, and the test stays green. Joy providers additionally take `defaultMode={scheme}` so Joy's JS-side mode matches its CSS.

   `visual/darkMode.tsx`'s wrapper-scope helpers (`renderJoyDark` and friends) are the deliberate exception, for tests that need a light and a dark element in one document — the `DarkTokens` grid. Don't reach for them in a per-component test.

### Components without an `@mui/joy` counterpart

`DataGrid`, `Grid`, `RelativeTime`, `LocaleSwitcher`, `ConfirmationDialog` and the colour-scheme switcher family have nothing to compare against, so points 1 and 3 don't apply to them. They are exempt from the parity comparison — **not** from scheme coverage. Their tests instead:

- take a self-baseline screenshot per scheme (`…-light` / `…-dark`);
- assert that the component's `backgroundColor` / `color` / `borderColor` actually *change* between light and dark. A committed PNG only catches a regression once a human looks at it; this catches a hardcoded light colour on the next test run.

A composition whose parts already carry full Joy-compared coverage (`LocaleSwitcher` is `Dropdown` + `MenuButton` + `Menu` + `MenuItem`) is exempt from parity for that reason, documented in the test file itself. Scheme coverage still applies — a composition can override a token its parts got right.

**Layout-only exception.** A component that sets no `bg-*` / `text-*` / `border-*` colour utility of its own paints nothing, so the "must differ" assertion is unsatisfiable. For those, assert the layout properties are *identical* across both schemes — a scheme flip must not move anything — with a comment saying why. `Grid` is the only current case.

### Running them, and the baselines

Run these with `pnpm --filter @hintoric/ui test:visual` (separate from the jsdom `pnpm test`, since jsdom can't lay out real CSS well enough to compare computed styles — see `vitest.visual.config.ts`). To filter, pass the pattern directly — `pnpm test:visual Button` — **not** after a `--`, which silently runs the whole suite.

A new assertion's first run creates its baseline and fails on purpose ("no existing reference screenshot found"). Rerun to confirm it passes, and open the new PNG to actually look at it before trusting it. Note that a test taking *two* screenshots needs *three* runs: `toMatchScreenshot` throws on the first missing baseline, so the second one isn't reached until the next run.

Screenshot ids end with the scheme: `button-solid-primary-joy-light`. The suffix is last so that adding a scheme to an existing test is a single mechanical rename of its baselines. Always pass an explicit id — never bare `toMatchScreenshot()`, whose filename follows the test title and moves when the title does.

Baselines are named per browser+platform (`*-chromium-darwin.png` on macOS) and are local-only for now — no CI wiring exists yet (would need a consistent, likely containerized, environment first).

**Changing a component means retaking its baselines — and its dependents'.** When `Button`'s type scale was fixed, retaking Button's own 40 images left four other files red: `Menu`, `LocaleSwitcher`, `ToggleButtonGroup` and `DarkTokens`, because `MenuButton` and `ToggleButtonGroup` build on `buttonVariants`. Twenty of those were Joy's *own* images even though Joy was untouched — `Menu`'s test renders both popups into one document, both portalled to `body`, and an element screenshot captures the real page, so our popup shifting by a pixel bleeds into Joy's captured region. Collect what actually needs retaking from the run output rather than guessing:

```bash
pnpm test:visual 2>&1 | grep -oE "src/visual/__screenshots__/[^ ]*\.png" | grep -v vitest-attachments | sort -u
```

Delete those, re-run, and look at the diffs. If a Joy baseline moves and you cannot explain why, stop — Joy is the oracle, and an unexplained change to it means the oracle is no longer trustworthy.

Our light tokens live in Tailwind's `@theme { }` block, which compiles to `:root`; there is no `[data-color-scheme="light"]` block. A light-mode island nested inside a dark region therefore stays dark. Joy supports this and we deliberately don't — the alternative is duplicating every light value into a second hand-maintained block. Consequence for tests: **never nest scopes.** The scheme is document state and there is only one.

## Everyday commands (from `packages/ui/`)

- `pnpm test` — jsdom unit tests (fast, no real CSS rendering)
- `pnpm test:visual` — real-browser visual regression tests against real `@mui/joy` (see above)
- `pnpm typecheck` — from repo root: `pnpm typecheck` builds the library first, then typechecks both packages (playground depends on the built `dist/`)
- `pnpm lint` — from repo root
- `pnpm build` — builds `dist/index.js` + `dist/style.css`

## Every user-facing change needs a changeset

`@hintoric/ui` is published to npm from `main` by Changesets. Any change to `packages/ui/src`
that a consumer of the package could notice — a new component, a new or changed prop, a fixed
behaviour, an export — **must** ship with a changeset in the same branch:

```bash
pnpm changeset   # from the repo root: pick @hintoric/ui, minor for new components/APIs, patch for fixes
```

The changeset's text lands verbatim in `packages/ui/CHANGELOG.md` and in the GitHub release, so
write it for someone reading the release notes, not as a commit subject. No changeset is needed
for spec/docs-only commits, for test-only or CI-only changes, or for anything under `apps/` —
`apps/docs` and `apps/playground` are both `private`, so `@hintoric/ui` is the only package that
is ever published (`.changeset/config.json` also lists `playground` under `ignore`, though not
`docs`).

What happens after a merge to `main`: the `Release` workflow runs `changesets/action`, which
collects the pending changesets into a "Version Packages" PR (bumping the version and writing the
CHANGELOG). **That PR is the release** — merging it triggers the same workflow again, which now
publishes to npm via OIDC trusted publishing (no `NPM_TOKEN`), pushes the git tag
`@hintoric/ui@<version>` and cuts the matching GitHub release. So a release is two merges, and
a merge with no pending changesets correctly publishes nothing.

**The action major must match the `@changesets/cli` major**: `changesets/action@v1` is for CLI v2,
`@v2` is for CLI v3 (what this repo uses). Do not "simplify" that pin. The mismatch fails
*silently* — v1 detects published packages by scraping `New tag:` lines off the CLI's stdout, which
CLI v3 no longer prints, so 0.1.0 through 0.2.0 all published to npm with a green job and yet no
git tag and no GitHub release. The tags for those three versions were created by hand afterwards.
After any release, verify the whole chain, not just the workflow's colour:

```bash
npm view @hintoric/ui dist-tags && git ls-remote --tags origin && gh release list
```

## Don't re-derive what's already been reverse-engineered

Every color/spacing/shadow/radius token in `packages/ui/src/styles/theme.css` and every per-variant class map in `packages/ui/src/utils/colorVariantClasses.ts` was copied from real `@mui/joy` source or measured against the real rendered package — not guessed. If something looks off, it's more likely a token this project hasn't reverse-engineered yet than a wrong assumption in the existing tokens. Check the Phase 1 plan's "Post-Phase-1" addenda first; if it's genuinely new, verify against the real package (a throwaway `@mui/joy` + `@emotion/react` + `@emotion/styled` sandbox, or the visual test suite above) before changing a token, and document what you found the same way those addenda do.
