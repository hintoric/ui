# Colour schemes in the visual regression suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every component's visual test asserts both colour schemes — Joy-parity in light and dark for components with a Joy counterpart, self-baseline screenshots plus a dark-differs-from-light assertion for our own.

**Architecture:** The colour scheme becomes document state: `setColorScheme(mode)` writes `data-color-scheme` and `data-joy-color-scheme` onto `<html>`, so portalled popups inherit it. Each test file's existing variant × color raster gains an outer scheme loop; screenshot ids gain a trailing `-light` / `-dark`. The 1248 existing baselines are renamed to `…-light-chromium-darwin.png` with a single mechanical rule, so nothing is re-baselined.

**Tech Stack:** Vitest 4 browser mode (Playwright/Chromium), `@testing-library/react`, real `@mui/joy` 5.0.0-beta.52 as the oracle, Tailwind CSS v4 tokens.

**Spec:** `docs/superpowers/specs/2026-09-07-visual-tests-color-schemes-design.md`

## Discovered during implementation

**Task 1 — the page background must be dark-only, not scheme-aware.** The plan
originally set `document.body.style.background = 'var(--color-canvas)'`
unconditionally in `setup.ts`, reasoning that `--color-canvas` is white in
light mode so light baselines could not change. That reasoning was wrong:
"transparent" is not "white" underneath anything semi-transparent. The 1248
existing baselines were taken over a transparent page, and painting the body
white shifted `ModalOverflow`'s scrim from `rgb(58,58,58)` to `rgb(110,110,110)`
— 93% of that baseline's pixels. The background is therefore painted by
`setColorScheme` for dark only and cleared for light. Caught by the
no-modified-light-baseline gate on its first use.

**Filter syntax.** Passing the pattern after a `--` separator does *not*
filter — it runs all 67 files. Pass it directly: `pnpm test:visual Button`.
Every `Run:` line below has been corrected.

**"Run twice" is really "run once per new screenshot per test."**
`toMatchScreenshot` throws on a missing baseline, so a test with a joy *and* a
hintoric screenshot aborts at the joy line on run 1 and only reaches the
hintoric line on run 2 — three runs before green. Budget for that.

**`screenshotFailures` had to be turned off** (`vitest.visual.config.ts`).
Browser mode's automatic capture-on-failure writes auto-named PNGs into
`__screenshots__` alongside the real baselines, and for an `it.fails()` test
that happens on every run. Failure diffs still land in `.vitest-attachments/`.

**Task 3 — Button's type scale was wrong, and the P2 assertion is what found
it.** Measured against real `@mui/joy` 5.0.0-beta.52: `fontWeight` 500 where
Joy uses 600, `fontSize` 16px where Joy uses 14px at `md` and 18px where Joy
uses 16px at `lg`, line heights to match. `minHeight` and padding were
correct, so it read as a font problem, and no assertion in 852 green tests
compared a font property.

Scope check before acting: Joy's `fontWeight.md` **is** 500, so the
`font-medium` in twelve other components is correct — Joy's Button is the only
component using `fontWeight.lg`. And `Chip`/`Alert`/`Badge` all match Joy's
`sm→xs, md→sm, lg→md` size mapping exactly. **One component was wrong, not
thirteen.**

Fixed rather than encoded, by explicit decision (2026-09-07), overriding the
"do not fix component bugs" constraint for this one case: the divergence was
fully measured, the fix is three classes, and Button is the library's
most-used component. Consequences worth knowing for later tasks:

- A separate `leading-*` utility does not override the line-height that
  `text-sm` pairs with — measured, both `leading-normal` and `leading-[1.5]`
  left it at 20px. Use the `text-sm/[1.5]` shorthand.
- Fixing a component **requires retaking its own baselines**, which breaks the
  no-modified-light-baseline gate on purpose. Scope the retake: delete only
  `*hintoric*` PNGs, never Joy's, then verify zero Joy baselines changed. That
  check is what proves the retake was scoped correctly.
- Add a changeset — it changes rendered output for consumers.

## Global Constraints

- Work in the worktree `/Users/johanneswaigel/git/hintoric/ui/.worktrees/visual-tests-color-schemes` on branch `visual-tests-color-schemes`. Other sessions commit in the main checkout; never `cd` there.
- Commands run from `packages/ui/`. Visual suite: `pnpm test:visual`. Unit suite: `pnpm test`.
- Screenshot id convention: **the scheme suffix goes last** — `button-solid-primary-joy-light`, never `button-solid-primary-light-joy`.
- Screenshot ids are always explicit. Never call `toMatchScreenshot()` without an id.
- Baselines are named `<id>-chromium-darwin.png` on macOS and are local-only; no CI wiring exists.
- A first run of a new assertion fails on purpose with "no existing reference screenshot found". Rerun once to confirm it passes.
- **No light-mode baseline may change.** After every task, `git status` must show zero modified `*-light-chromium-darwin.png`. A modified light baseline means the change altered light rendering and must be understood before proceeding. The one sanctioned exception is a deliberate component fix, which requires retaking that component's own `*hintoric*` baselines — never Joy's; see Task 3 under "Discovered during implementation".
- Never nest colour-scheme scopes. There is no `[data-color-scheme="light"]` block, so a light scope inside a dark region stays dark.
- `COLOR_SCHEMES`, `ColorScheme` and `setColorScheme` live in `src/visual/helpers.ts`. The wrapper-scope helpers in `src/visual/darkMode.tsx` stay as they are and are used only by `DarkTokens` / `DarkVariant` / `DarkModeHarness`.
- Do **not** fix component bugs in this plan, with one exception already taken: `Button`'s type scale (Task 3), fixed by explicit decision because it was fully measured and three classes wide. P1 from the 2026-09-06 audit (`Input`, `Textarea`, `Autocomplete` sizing) stays encoded with `it.fails()`, not repaired. Anything new that surfaces gets measured and reported first — the decision to fix or encode is the user's, not the executor's.
- **Compare font properties.** `fontSize`, `fontWeight` and `lineHeight` go into every Flavour A assertion list from Task 4 onward. Their absence is what let Button's divergence survive 852 green tests, and adding them costs three lines per file while the file is already open.

---

### Task 1: The scheme helper and test setup

**Files:**
- Modify: `packages/ui/src/visual/helpers.ts`
- Modify: `packages/ui/src/visual/setup.ts`
- Modify: `packages/ui/src/visual/darkMode.tsx` (comment only)
- Test: `packages/ui/src/visual/ColorSchemeHelper.visual.test.tsx` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `COLOR_SCHEMES: readonly ['light','dark']`, `type ColorScheme = 'light'|'dark'`, `setColorScheme(mode: ColorScheme): Promise<void>` — all from `./helpers`. Every later task imports these.

- [x] **Step 1: Write the failing test**

Create `packages/ui/src/visual/ColorSchemeHelper.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Sheet as JoySheet } from '@mui/joy';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { Dropdown } from '../components/Dropdown';
import { MenuButton } from '../components/MenuButton';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// This file tests the test infrastructure, not a component. It exists because
// the whole 80-file retrofit rests on two claims that are cheap to assert once
// and expensive to discover wrong in file 47.
describe('setColorScheme', () => {
  it('exposes exactly light and dark', () => {
    expect([...COLOR_SCHEMES]).toEqual(['light', 'dark']);
  });

  it('puts both our tokens and Joy\'s on the document element', async () => {
    await setColorScheme('dark');

    const root = document.documentElement;
    expect(root.getAttribute('data-color-scheme')).toBe('dark');
    expect(root.getAttribute('data-joy-color-scheme')).toBe('dark');
  });

  /**
   * The reason this mechanism was chosen over the wrapper-div scopes in
   * darkMode.tsx. A portalled popup mounts on <body>, outside any wrapper, so
   * only a document-level attribute reaches it. If this ever regresses, every
   * overlay component's dark coverage silently becomes light coverage.
   */
  it('reaches portalled content', async () => {
    await setColorScheme('dark');
    render(
      <ColorSchemeProvider defaultMode="dark">
        <Dropdown defaultOpen>
          <MenuButton>open</MenuButton>
          <Menu data-testid="portalled-menu">
            <MenuItem>item</MenuItem>
          </Menu>
        </Dropdown>
      </ColorSchemeProvider>,
    );

    const menu = page.getByTestId('portalled-menu').element();
    // The popup is outside the provider's own wrapper div...
    expect(menu.closest('[data-color-scheme]')).toBe(document.documentElement);
    // ...and still resolves the dark surface token rather than the light one.
    expect(getComputedStyle(menu).backgroundColor).toBe('rgb(0, 0, 0)');
  });

  /**
   * Joy is the oracle for Flavour A, so Joy has to actually be dark when we
   * say dark — not merely carry the attribute.
   */
  it('switches real @mui/joy too', async () => {
    await setColorScheme('light');
    render(
      <JoyCssVarsProvider defaultMode="light">
        <JoySheet data-testid="joy-light">x</JoySheet>
      </JoyCssVarsProvider>,
    );
    const lightBg = getComputedStyle(page.getByTestId('joy-light').element()).backgroundColor;

    await setColorScheme('dark');
    const darkBg = getComputedStyle(page.getByTestId('joy-light').element()).backgroundColor;

    expect(darkBg).not.toBe(lightBg);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm test:visual ColorSchemeHelper`
Expected: FAIL — `setColorScheme` and `COLOR_SCHEMES` are not exported from `./helpers`.

- [x] **Step 3: Add the helper**

Append to `packages/ui/src/visual/helpers.ts`:

```ts
export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * Puts the whole document into `mode`.
 *
 * On <html>, deliberately, rather than on a wrapper element: Menu, Modal,
 * Drawer, Tooltip, Snackbar, Select and Autocomplete render their popup into a
 * portal on <body>, which no wrapper contains. A wrapper scope leaves those
 * popups light inside a dark test, silently — see darkMode.tsx, which takes
 * the wrapper approach for a different job and documents the same caveat.
 *
 * Both attributes are set because the two token systems use different ones:
 * ours reads `[data-color-scheme]` (theme.css), Joy's generated stylesheet
 * reads `[data-joy-color-scheme]`.
 *
 * Awaits settleTransitions(): `transition-colors` is on every interactive
 * component, so a getComputedStyle() immediately after the flip reads a value
 * mid-transition rather than the final one.
 */
export async function setColorScheme(mode: ColorScheme): Promise<void> {
  document.documentElement.setAttribute('data-color-scheme', mode);
  document.documentElement.setAttribute('data-joy-color-scheme', mode);
  await settleTransitions();
}
```

- [x] **Step 4: Make the page background follow the scheme**

Replace `packages/ui/src/visual/setup.ts` with:

```ts
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '../styles/index.css';

afterEach(() => {
  cleanup();
});

/*
 * The browser page is reused across tests in a file, so localStorage survives
 * between them. ColorSchemeProvider persists the chosen mode, which means a
 * test that switches modes silently changes the starting mode of every test
 * after it — and a screenshot baseline taken that way is unreproducible.
 * Joy's own provider does the same under the key `joy-mode`.
 */
beforeEach(() => {
  window.localStorage.clear();
});

/*
 * The document-level scheme attribute outlives a test too, for the same
 * reason. Reset it so a file's tests cannot depend on their own order.
 */
afterEach(() => {
  document.documentElement.setAttribute('data-color-scheme', 'light');
  document.documentElement.setAttribute('data-joy-color-scheme', 'light');
});

/*
 * Element screenshots capture whatever shows through a transparent element, so
 * without a scheme-aware page background every dark screenshot of a `plain` or
 * `outlined` variant is dark text on a white page — unreviewable, which defeats
 * the point of committing the PNG. `--color-canvas` is white in light mode, so
 * existing light baselines are unaffected.
 */
document.body.style.background = 'var(--color-canvas)';
```

- [x] **Step 5: Run test to verify it passes**

Run: `pnpm test:visual ColorSchemeHelper`
Expected: PASS, 4 tests.

If the portal test fails on the `rgb(0, 0, 0)` expectation, read the actual value before changing the assertion: `--color-canvas` is `--color-common-black` in dark mode (theme.css:331), but `Menu` may use `--color-surface-popup`. Assert whichever token `Menu` actually reads, and say which in a comment — do not weaken the assertion to "not the light value".

- [x] **Step 6: Document the division of labour in darkMode.tsx**

Insert into the existing block comment at the top of `packages/ui/src/visual/darkMode.tsx`, after the "Portalled content" paragraph:

```
 * Two mechanisms therefore coexist, on purpose:
 *
 * - These wrapper scopes, for tests that show a light and a dark element
 *   together in one document (DarkTokens' grid). `defaultMode="dark"` cannot
 *   do that — it writes onto the shared <html>.
 * - `setColorScheme()` in helpers.ts, which is document-level and is what the
 *   per-component suite uses, because that suite must cover portalled
 *   components and a wrapper cannot reach them.
```

- [x] **Step 7: Verify nothing else moved**

Run: `pnpm test:visual`
Expected: all files pass. Then `git status --short` — expected: only the four files of this task, and **no** modified PNGs.

- [x] **Step 8: Commit**

```bash
git add packages/ui/src/visual/helpers.ts packages/ui/src/visual/setup.ts packages/ui/src/visual/darkMode.tsx packages/ui/src/visual/ColorSchemeHelper.visual.test.tsx
git commit -m "Add a document-level colour scheme helper for the visual suite"
```

---

### Task 2: Rename the 1248 existing baselines

**Files:**
- Modify: every `packages/ui/src/visual/__screenshots__/**/*-chromium-darwin.png` (rename only)

**Interfaces:**
- Consumes: nothing.
- Produces: every existing baseline at `<id>-light-chromium-darwin.png`, so Task 3 onward can emit `-light` ids without re-baselining.

- [x] **Step 1: Count what exists, so the rename can be verified**

Run from `packages/ui/`:

```bash
find src/visual/__screenshots__ -name '*-chromium-darwin.png' | wc -l
```

Expected: `1248`. Write the number down; Step 4 checks against it. If it differs, another branch has merged — reconcile before renaming, do not proceed on a guess.

- [x] **Step 2: Rename with git mv**

The three dark-specific files are already scheme-explicit in their ids and must not be renamed. Everything else gets the suffix.

```bash
find src/visual/__screenshots__ -name '*-chromium-darwin.png' \
  -not -path '*/DarkTokens.visual.test.tsx/*' \
  -not -path '*/DarkVariant.visual.test.tsx/*' \
  -not -path '*/DarkModeHarness.visual.test.tsx/*' \
  -print0 |
while IFS= read -r -d '' f; do
  git mv "$f" "${f%-chromium-darwin.png}-light-chromium-darwin.png"
done
```

- [x] **Step 3: Verify the rename is content-preserving**

```bash
git diff --cached --stat | tail -3
git diff --cached --diff-filter=M --name-only | wc -l
```

Expected: the stat line reports renames only, and the count of **modified** (as opposed to renamed) files is `0`. A non-zero count means a PNG's content changed, which a rename cannot do — stop and investigate.

- [x] **Step 4: Verify the count**

```bash
find src/visual/__screenshots__ -name '*-light-chromium-darwin.png' | wc -l
```

Expected: the number from Step 1, minus however many belong to the three dark-specific files. Compute that number explicitly rather than eyeballing:

```bash
find src/visual/__screenshots__ \( -path '*/DarkTokens.visual.test.tsx/*' -o -path '*/DarkVariant.visual.test.tsx/*' -o -path '*/DarkModeHarness.visual.test.tsx/*' \) -name '*.png' | wc -l
```

- [x] **Step 5: Confirm the suite now fails as expected**

Run: `pnpm test:visual`
Expected: FAIL, with "no existing reference screenshot found" for the renamed ids — the tests still ask for the old names. This failure is the proof that the rename and the test ids are coupled; Task 3 onward fixes it file by file.

Do **not** commit a red suite. Continue to Step 6 in the same task.

- [x] **Step 6: Point the ids at the renamed files**

For each of the 63 component test files, append `-light` to every `toMatchScreenshot()` id. The ids are string literals and template literals; the suffix goes at the very end, inside the quotes or backticks:

```diff
- await expect(joyLocator).toMatchScreenshot(`button-${variant}-${color}-joy`);
+ await expect(joyLocator).toMatchScreenshot(`button-${variant}-${color}-joy-light`);
```

```diff
- await expect(page.getByRole('button')).toMatchScreenshot('locale-switcher-closed');
+ await expect(page.getByRole('button')).toMatchScreenshot('locale-switcher-closed-light');
```

Leave `DarkTokens`, `DarkVariant`, `DarkModeHarness` and `ColorSchemeHelper` alone.

This is a mechanical edit across 142 call sites. Do it with an edit per file rather than a blind repo-wide `sed`: `Tooltip.visual.test.tsx` has no call sites at all, and the word `toMatchScreenshot` appears in comments in `DataGrid` and `RelativeTime` that must not be rewritten.

- [x] **Step 7: Verify green with zero content change**

Run: `pnpm test:visual`
Expected: PASS, 66 files. Then:

```bash
git status --short | grep -c '\.png' 
```

Expected: `0` unstaged PNG changes — every PNG movement is already staged as a rename from Step 2, and no new PNG was written.

- [x] **Step 8: Commit**

```bash
git add -A src/visual
git commit -m "Suffix every existing baseline and screenshot id with -light"
```

---

### Task 3: Retrofit Button — the Flavour A pattern

**Files:**
- Modify: `packages/ui/src/visual/Button.visual.test.tsx`
- Create: 20 new `button-*-dark` baselines under `packages/ui/src/visual/__screenshots__/Button.visual.test.tsx/`

**Interfaces:**
- Consumes: `COLOR_SCHEMES`, `ColorScheme`, `setColorScheme` from `./helpers`.
- Produces: the Flavour A retrofit pattern that Tasks 5–10 apply to 58 more files. Later tasks are described as "apply Task 3's pattern", so this file is the reference — keep it exemplary.

- [x] **Step 1: Wrap the raster in a scheme loop**

In `packages/ui/src/visual/Button.visual.test.tsx`, replace the import of `settleTransitions` and the two nested loops:

```tsx
import { COLOR_SCHEMES, settleTransitions, setColorScheme } from './helpers';
```

```tsx
describe('Button visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyButton data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
                {color}
              </JoyButton>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricButton data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
                {color}
              </HintoricButton>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          // The actual pass/fail: exact computed CSS values must match. Two
          // different styling engines (Emotion vs Tailwind utilities) can and
          // do produce byte-identical computed styles when they encode the
          // same underlying values — that's the whole point of this check.
          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
          expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
          expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

          // Real, committed screenshots via Vitest's own visual regression
          // feature — for humans to review, not the pass/fail signal above.
          await expect(joyLocator).toMatchScreenshot(`button-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricLocator).toMatchScreenshot(`button-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }
  }
```

- [x] **Step 2: Give the focus test both schemes too**

Replace the existing focus test with a scheme loop. The focus ring is the bug CLAUDE.md cites as the reason interactive coverage is mandatory, and a focus ring that reads a palette token is exactly what a dark-mode token slip would break:

```tsx
  for (const scheme of COLOR_SCHEMES) {
    it(`shows the same focus-visible outline as Joy UI in ${scheme} (generic theme.focus.default, not Input's inset ring)`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyButton data-testid="joy-focus">focus me</JoyButton>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricButton data-testid="hintoric-focus">focus me</HintoricButton>
        </ColorSchemeProvider>,
      );

      const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
      const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

      joyEl.focus();
      await settleTransitions();
      const joyOutline = getComputedStyle(joyEl).outline;
      const joyOutlineOffset = getComputedStyle(joyEl).outlineOffset;
      joyEl.blur();

      hintoricEl.focus();
      await settleTransitions();
      const hintoricOutline = getComputedStyle(hintoricEl).outline;
      const hintoricOutlineOffset = getComputedStyle(hintoricEl).outlineOffset;
      hintoricEl.blur();

      expect(hintoricOutline).toBe(joyOutline);
      expect(hintoricOutlineOffset).toBe(joyOutlineOffset);
    });
  }
});
```

- [x] **Step 3: Add the audit's P2 sizing assertion**

Append inside the `describe`, once — not per cell. `Button` is not a fill-width control, so the assertion pins it as shrink-to-fit in agreement with Joy, which is what the audit asked for:

```tsx
  /**
   * P2 from the 2026-09-06 coverage audit: before it, no test compared `width`
   * or `display` inside a fixed-width parent, and four components had silently
   * diverged on fill-versus-shrink. One line per component prevents the whole
   * class from recurring.
   */
  for (const scheme of COLOR_SCHEMES) {
    it(`fills the same share of a fixed-width parent as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 400 }}>
            <JoyButton data-testid="joy-sized">sized</JoyButton>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 400 }}>
            <HintoricButton data-testid="hintoric-sized">sized</HintoricButton>
          </div>
        </ColorSchemeProvider>,
      );

      const joyEl = page.getByTestId('joy-sized').element();
      const hintoricEl = page.getByTestId('hintoric-sized').element();

      expect(getComputedStyle(hintoricEl).display).toBe(getComputedStyle(joyEl).display);
      expect(hintoricEl.getBoundingClientRect().width).toBeCloseTo(
        joyEl.getBoundingClientRect().width,
        1,
      );
    });
  }
```

- [x] **Step 4: Run to create the dark baselines**

Run: `pnpm test:visual Button`
Expected: FAIL with "no existing reference screenshot found" for the 20 new `-dark` ids. This is the documented first-run behaviour.

- [x] **Step 5: Rerun to confirm they pass**

Run: `pnpm test:visual Button`
Expected: PASS.

- [x] **Step 6: Look at the new baselines**

```bash
git status --short src/visual/__screenshots__/Button.visual.test.tsx/ | grep dark
```

Open several of the new `-dark` PNGs — at minimum one `solid`, one `soft`, one `outlined` and one `plain`. Check the backdrop is dark, the text is legible, and the Joy and Hintoric pair look like the same button. **This is a human review step: if executing via subagents, surface the file list and stop for it.**

- [x] **Step 7: Confirm no light baseline moved**

```bash
git status --short src/visual/__screenshots__/Button.visual.test.tsx/ | grep -c 'light'
```

Expected: `0`.

- [x] **Step 8: Commit**

```bash
git add packages/ui/src/visual/Button.visual.test.tsx packages/ui/src/visual/__screenshots__/Button.visual.test.tsx
git commit -m "Cover Button in both colour schemes"
```

---

### Task 4: Retrofit LocaleSwitcher — the Flavour B pattern

**Files:**
- Modify: `packages/ui/src/visual/LocaleSwitcher.visual.test.tsx`
- Create: new `locale-switcher-*-dark` baselines

**Interfaces:**
- Consumes: `COLOR_SCHEMES`, `setColorScheme` from `./helpers`.
- Produces: the Flavour B pattern that Task 11 applies to `DataGrid`, `Grid` and `RelativeTime`.

- [ ] **Step 1: Put the two screenshot tests in a scheme loop**

`LocaleSwitcher` needs `ColorSchemeProvider` — its existing tests render it bare, which works only because light is the default. Add the provider and the loop:

```tsx
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
```

```tsx
  for (const scheme of COLOR_SCHEMES) {
    it(`closed state matches its own ${scheme} baseline screenshot`, async () => {
      await setColorScheme(scheme);
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />
        </ColorSchemeProvider>,
      );

      await expect(page.getByRole('button')).toMatchScreenshot(
        `locale-switcher-closed-${scheme}`,
      );
    });

    it(`open menu matches its own ${scheme} baseline screenshot`, async () => {
      await setColorScheme(scheme);
      const user = userEvent.setup();
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />
        </ColorSchemeProvider>,
      );

      await user.click(screen.getByRole('button'));
      await screen.findByText('English');

      // The popup lives in a portal, so the button's own box does not contain it
      // — screenshotting the button would show a green test and no menu. The
      // portal is still in the document, reachable by its role. It is also why
      // the scheme is document state rather than a wrapper: a wrapper would not
      // contain this element either, and the menu would render light.
      await expect(page.getByRole('menu')).toMatchScreenshot(
        `locale-switcher-open-${scheme}`,
      );
    });
  }
```

- [ ] **Step 2: Write the failing dark-differs-from-light test**

Append inside the `describe`:

```tsx
  /**
   * A committed screenshot only catches a regression once a human looks at it.
   * This is the assertion a PNG cannot make: that the component reads scheme
   * tokens at all. A hardcoded light colour passes every screenshot test on
   * its own baseline and fails here.
   *
   * The component stays mounted across the flip — only the CSS custom
   * properties change — so this compares the same element with itself.
   */
  it('reads colour-scheme tokens rather than fixed colours', async () => {
    await setColorScheme('light');
    render(
      <ColorSchemeProvider defaultMode="light">
        <LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />
      </ColorSchemeProvider>,
    );

    const button = screen.getByRole('button');
    const read = () => {
      const s = getComputedStyle(button);
      return { bg: s.backgroundColor, fg: s.color, border: s.borderTopColor };
    };

    const light = read();
    await setColorScheme('dark');
    const dark = read();

    expect([dark.bg, dark.fg, dark.border]).not.toEqual([light.bg, light.fg, light.border]);
  });
```

- [ ] **Step 3: Run to verify it fails, then passes**

Run: `pnpm test:visual LocaleSwitcher`
Expected on the first run: FAIL with "no existing reference screenshot found" for the `-dark` ids.

Rerun. Expected: PASS.

If `reads colour-scheme tokens rather than fixed colours` fails, that is a **real finding, not a test bug**: `LocaleSwitcher` is `Dropdown` + `MenuButton`, whose dark tokens `DarkTokens.visual.test.tsx` already verifies, so a failure here means the composition overrides them. Report it and stop rather than relaxing the assertion.

- [ ] **Step 4: Look at the new baselines**

Open the new `locale-switcher-closed-dark` and `locale-switcher-open-dark` PNGs. The open menu is the interesting one — it is portalled, so it is the direct evidence that the mechanism works end to end. **Human review step.**

- [ ] **Step 5: Confirm no light baseline moved**

```bash
git status --short src/visual/__screenshots__/LocaleSwitcher.visual.test.tsx/ | grep -c 'light'
```

Expected: `0`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/visual/LocaleSwitcher.visual.test.tsx packages/ui/src/visual/__screenshots__/LocaleSwitcher.visual.test.tsx
git commit -m "Cover LocaleSwitcher in both colour schemes"
```

---

### Task 5: Write the CLAUDE.md rules

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the patterns established in Tasks 1, 3 and 4 — the text must describe what those files actually do.
- Produces: the rules Tasks 6–12 are held to.

- [ ] **Step 1: Extend the hard-requirement list**

In `CLAUDE.md`, under "Hard requirement: every component needs full visual regression coverage", change item 1 and add items 5 and 6:

```markdown
1. Renders the real `@mui/joy` component and our own component side by side, for **every variant the component supports** (`solid`/`soft`/`outlined`/`plain` where applicable) **crossed with every color** (`primary`/`neutral`/`danger`/`success`/`warning` where applicable) **crossed with both color schemes** (`light`/`dark`) — not a representative subset. If a component has no `variant`/`color` axis (e.g. Card's default), test its actual supported states instead. The scheme axis has no exceptions: every component renders in both.
```

```markdown
5. Sets the scheme with `setColorScheme(scheme)` from `visual/helpers.ts`, which writes `data-color-scheme` and `data-joy-color-scheme` onto `<html>`. It has to be the document, not a wrapper element: `Menu`, `Modal`, `Drawer`, `Tooltip`, `Snackbar`, `Select` and `Autocomplete` portal their popup to `body`, where a wrapper scope never reaches — such a popup renders light inside a dark test, silently. Joy providers additionally take `defaultMode={scheme}` so Joy's JS-side mode matches its CSS.

   `visual/darkMode.tsx`'s wrapper-scope helpers (`renderJoyDark` and friends) are the deliberate exception, for tests that need a light and a dark element in one document — the `DarkTokens` grid. Do not reach for them in a per-component test.

6. Asserts `display` and `width` against Joy inside a fixed-width parent. This is P2 from `docs/superpowers/specs/2026-09-06-visual-test-coverage-audit.md`: four components had silently diverged on fill-versus-shrink because nothing compared sizing. Where the divergence is still unfixed (`Input`, `Textarea`, `Autocomplete`), the assertion is written and marked `it.fails()` with a pointer to P1, never skipped — a `skip` lets the fix land unnoticed, `it.fails()` turns red the moment someone fixes the component.
```

- [ ] **Step 2: Document Flavour B, which the file never mentioned**

Add after the numbered list:

```markdown
### Components without an `@mui/joy` counterpart

`DataGrid`, `Grid`, `RelativeTime`, `LocaleSwitcher`, `ConfirmationDialog` and the colour-scheme switcher family have nothing to compare against, so points 1 and 3 do not apply to them. They are exempt from the parity comparison — **not** from scheme coverage. Their tests instead:

- take a self-baseline screenshot per scheme (`…-light` / `…-dark`);
- assert that the component's `backgroundColor` / `color` / `borderColor` actually *change* between light and dark. A committed PNG only catches a regression once a human looks at it; this catches a hardcoded light colour on the next test run.

A composition whose parts already carry full Joy-compared coverage (`LocaleSwitcher` is `Dropdown` + `MenuButton` + `Menu` + `MenuItem`) is exempt from parity for that reason, documented in the test file itself. Scheme coverage still applies — a composition can override a token its parts got right.

**Layout-only exception.** A component that sets no `bg-*` / `text-*` / `border-*` colour utility of its own paints nothing, so the "must differ" assertion is unsatisfiable. For those, assert the layout properties are *identical* across both schemes — a scheme flip must not move anything — with a comment saying why. `Grid` is the only current case.
```

- [ ] **Step 3: Document the naming convention and the light-island limitation**

Add after the paragraph about baseline naming:

```markdown
Screenshot ids end with the scheme: `button-solid-primary-joy-light`. The suffix is last so that adding a scheme to an existing test is a single mechanical rename of its baselines. Always pass an explicit id — never bare `toMatchScreenshot()`, whose filename follows the test title and moves when the title does.

Our light tokens live in Tailwind's `@theme { }` block, which compiles to `:root`; there is no `[data-color-scheme="light"]` block. A light-mode island nested inside a dark region therefore stays dark. Joy supports this and we do not, deliberately — the alternative is duplicating every light value into a second hand-maintained block. Consequence for tests: **never nest scopes.** The scheme is document state and there is only one.
```

- [ ] **Step 4: Verify the claims are true**

Read back each rule and check it against the code Tasks 1, 3 and 4 actually produced. A rule that describes an intention rather than the code is worse than no rule — this file is loaded into every session's context.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "Require both colour schemes in every visual test"
```

---

### Tasks 6–11: Flavour A batches

Each batch is one task with the same six steps. **Apply the pattern from Task 3, file by file** — do not invent a variation. Per file:

1. add `COLOR_SCHEMES` and `setColorScheme` to the `./helpers` import;
2. wrap every `it(...)` in `for (const scheme of COLOR_SCHEMES)`, `await setColorScheme(scheme)` as the first line of the body, and ` in ${scheme}` appended to the test title;
3. pass `defaultMode={scheme}` to `JoyCssVarsProvider` and `ColorSchemeProvider` (adding `ColorSchemeProvider` where the file renders our component bare);
4. append `-${scheme}` to every `toMatchScreenshot()` id, replacing the `-light` that Task 2 added;
5. add Task 3's Step 3 sizing assertion, adapted to the component;
6. run twice (first run creates baselines and fails), review the new dark PNGs, confirm no light PNG changed, commit.

Per-batch steps, identical in each of Tasks 6–11:

- [ ] **Step 1: Retrofit each file in the batch**
- [ ] **Step 2: Run `pnpm test:visual <Batch pattern>` — expect first-run baseline failures**
- [ ] **Step 3: Rerun — expect PASS**
- [ ] **Step 4: Report the new dark PNGs and stop for human review**
- [ ] **Step 5: Confirm `git status` shows zero modified `*-light-*.png`**
- [ ] **Step 6: Commit as `Cover <batch name> in both colour schemes`**

**Task 6 — Buttons and actions (7 files):** `IconButton`, `ButtonGroup`, `ToggleButtonGroup`, `Chip`, `ChipDelete`, `Link`, `Badge`.

**Task 7 — Form controls (14 files):** `Input`, `Textarea`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `Select`, `Option`, `Autocomplete`, `AutocompleteOption`, `FormControl`, `FormLabel`, `FormHelperText`.

This batch carries the P1 collision. `Input`, `Textarea` and `Autocomplete` shrink to content where Joy fills its parent — measured in the audit as 201px, 210px and 229px against Joy's 400px, 400px and 353.5px. Write the sizing assertion and mark it:

```tsx
  /**
   * P1 from docs/superpowers/specs/2026-09-06-visual-test-coverage-audit.md:
   * our root is an inline-flex <span> and shrinks to content, where Joy's is a
   * block-level flex container that fills its parent. Measured at 201px against
   * Joy's 400px.
   *
   * `it.fails()` rather than `it.skip()` on purpose: this asserts that the
   * divergence is still there, so the suite stays green while the bug is known
   * AND turns red the moment somebody fixes the component — at which point drop
   * the `.fails` and this comment. A skip would let the fix land unnoticed and
   * the assertion rot.
   */
  it.fails('fills a fixed-width parent like Joy UI does', async () => {
```

Do not fix the components. Report the three `it.fails()` sites in the batch report.

**Task 8 — Overlays and portals (11 files):** `Modal`, `ModalClose`, `ModalDialog`, `ModalOverflow`, `Drawer`, `Menu`, `Tooltip`, `Snackbar`, `DialogTitle`, `DialogContent`, `DialogActions`.

This is where the document-state mechanism earns its keep, and where it would fail if it were going to. `Tooltip` takes no screenshots by a documented decision — give it scheme coverage for its computed-style assertions only, and leave that decision intact.

For each portalled popup, assert once that the popup itself resolved dark tokens, not just its trigger:

```tsx
      // The popup is portalled to body, outside every wrapper. Asserting on it
      // is the only thing that proves the scheme reached it.
      expect(getComputedStyle(popupEl).backgroundColor).toBe(
        getComputedStyle(joyPopupEl).backgroundColor,
      );
```

**Task 9 — Surfaces (11 files):** `Sheet`, `Card`, `CardActions`, `CardContent`, `CardCover`, `CardOverflow`, `Alert`, `Divider`, `ListDivider`, `Accordion`, `Skeleton`.

`Card` is where the audit's third mechanism bit: `CardCover`'s test builds its own `position: relative` parent instead of composing a real `Card`, and the missing `position: relative` on `Card` therefore went unnoticed. While in these files, add one case to `CardCover` that composes the real `Card` — it is the audit's step 4 and these are the files it applies to.

**Task 10 — Lists and navigation (8 files):** `List`, `ListItemButton`, `ListItemContent`, `ListItemDecorator`, `ListSubheader`, `Breadcrumbs`, `Tabs`, `Stepper`.

**Task 11 — Layout, data and feedback (7 files):** `AspectRatio`, `Container`, `Avatar`, `AvatarGroup`, `CircularProgress`, `LinearProgress`, `Table`.

`AspectRatio` and `Container` are layout-only. They are Flavour A, so they still compare against Joy in both schemes — the layout-only exception applies to Flavour B's "must differ" assertion, which these files do not have.

---

### Task 12: Flavour B batch — DataGrid, Grid, RelativeTime

**Files:**
- Modify: `packages/ui/src/visual/DataGrid.visual.test.tsx`, `Grid.visual.test.tsx`, `RelativeTime.visual.test.tsx`

**Interfaces:**
- Consumes: `COLOR_SCHEMES`, `setColorScheme` from `./helpers`; the pattern from Task 4.

- [ ] **Step 1: Apply Task 4's pattern to DataGrid and RelativeTime**

Both are Flavour B with real painted surfaces: scheme loop around the screenshot tests, plus the "reads colour-scheme tokens" assertion.

`DataGrid` covers hover by asserting the presence of the `group-hover:` class rather than driving a pointer (noted in the audit as a known heuristic false positive). Leave that approach alone; it needs no scheme variant, since a class list does not change with the scheme.

- [ ] **Step 2: Apply the layout-only exception to Grid**

`Grid` paints nothing, so the "must differ" assertion is unsatisfiable. Assert the inverse instead:

```tsx
  /**
   * Grid is layout-only — it sets no bg-*/text-*/border-* colour utility, so
   * there is no colour to differ between schemes. The meaningful assertion is
   * the opposite one: a scheme flip must not move anything. This is the
   * layout-only exception in CLAUDE.md.
   */
  it('lays out identically in both colour schemes', async () => {
    await setColorScheme('light');
    render(/* the file's existing grid fixture */);

    const el = screen.getByTestId('grid');
    const read = () => {
      const s = getComputedStyle(el);
      return { display: s.display, gap: s.gap, gridTemplateColumns: s.gridTemplateColumns };
    };

    const light = read();
    await setColorScheme('dark');

    expect(read()).toEqual(light);
  });
```

- [ ] **Step 3: Run twice, review the new dark PNGs, confirm no light PNG moved**

Run: `pnpm test:visual "DataGrid|Grid|RelativeTime"` — first run fails on missing baselines, second passes. **Human review step** for the new PNGs.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/visual/DataGrid.visual.test.tsx packages/ui/src/visual/Grid.visual.test.tsx packages/ui/src/visual/RelativeTime.visual.test.tsx packages/ui/src/visual/__screenshots__
git commit -m "Cover the Joy-exempt components in both colour schemes"
```

---

### Tasks 13–16: The 17 components with no test file

These are **new tests, not retrofits** — the component's API has to be understood and its Joy counterpart set up correctly. Each task follows Task 3's Flavour A pattern for a component that has a Joy counterpart, or Task 4's Flavour B pattern for one that does not.

Before writing each file, read the component's source and its existing jsdom test in `packages/ui/src/components/<Name>/`. Do not assume the Joy counterpart takes the same props — CLAUDE.md's Phase 1 plan documents corrections found against the real package, and the same class of surprise applies here.

Per task: write the file, run twice, review the new PNGs, confirm no existing baseline moved, commit per component.

**Task 13 — Accordion parts (3 files):** `AccordionGroup`, `AccordionSummary`, `AccordionDetails`. All three have Joy counterparts. Compose them inside a real `Accordion` rather than in a hand-built parent — that is the audit's structural finding.

**Task 14 — Menu parts (5 files):** `Dropdown`, `MenuButton`, `MenuItem`, `MenuList`, `ListItem`. `Dropdown` is a thin context wrapper with no look of its own; if it turns out to have nothing to assert beyond passing props through, treat it as Flavour B and say so in the file, the way `LocaleSwitcher` does. `MenuItem` is a plain `BaseMenu.Item` wrapper whose styling comes from `ListItemButton`.

**Task 15 — Tabs and Stepper parts (6 files):** `Tab`, `TabList`, `TabPanel`, `Step`, `StepButton`, `StepIndicator`. Compose the parts inside their real parents (`Tabs`, `Stepper`) rather than in hand-built containers.

**Task 16 — Primitives (3 files):** `Box`, `Stack`, `Typography`. `Box` and `Stack` are layout-only; `Typography` paints text colour and is the one primitive where a dark token slip would be most visible.

---

### Task 17: Final verification and handoff

- [ ] **Step 1: Full suite, both configs**

```bash
pnpm test
pnpm test:visual
```

Expected: both green.

- [ ] **Step 2: Confirm no light baseline changed across the whole branch**

```bash
git diff --stat main...HEAD -- '*-light-chromium-darwin.png' | tail -1
```

Expected: renames only, zero content modifications. Any modified light baseline is a regression introduced somewhere in Tasks 1–16 and must be explained before the branch is offered for merge.

- [ ] **Step 3: Count the result**

```bash
find src/visual/__screenshots__ -name '*-light-chromium-darwin.png' | wc -l
find src/visual/__screenshots__ -name '*-dark-chromium-darwin.png' | wc -l
```

Report both numbers. They will not be equal — `Tooltip` takes no screenshots, and some tests are single-scheme by design — but a large gap means a file was missed.

- [ ] **Step 4: Verify every component is covered**

```bash
for c in src/components/*/; do n=$(basename "$c"); [ -f "src/visual/$n.visual.test.tsx" ] || echo "MISSING: $n"; done
```

Expected: no output.

```bash
for f in src/visual/*.visual.test.tsx; do grep -q 'COLOR_SCHEMES' "$f" || echo "NO SCHEME AXIS: $(basename $f)"; done
```

Expected: only `DarkTokens`, `DarkVariant`, `DarkModeHarness` and `ColorSchemeHelper`, which are scheme-aware by construction.

- [ ] **Step 5: Typecheck and lint**

From the repo root: `pnpm typecheck` and `pnpm lint`. Expected: both clean.

- [ ] **Step 6: Report the divergences found**

The point of the exercise. Collect every dark-mode divergence Tasks 6–16 surfaced between our tokens and real Joy, and write them up as addenda in the style CLAUDE.md prescribes — "verify against the real package before changing a token, and document what you found the same way those addenda do". Each entry: which token, what Joy renders, what we rendered, and what the fix was.

If nothing diverged, say so explicitly. That would be a genuinely surprising result for 345 lines of reverse-engineered tokens, and worth stating rather than leaving implied.

- [ ] **Step 7: Hand off**

Use `superpowers:finishing-a-development-branch`. Note in the handoff:

- the merge-time follow-ups from the spec (`ConfirmationDialog`, the colour-scheme switcher family);
- the `it.fails()` sites from Task 7 as the checklist for whoever fixes P1;
- that no CI wiring exists for these baselines, so they are only as good as the reviews in Tasks 3–16.

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: mechanism and helper → Task 1; naming and the 1248 baselines → Task 2; Flavour A → Tasks 3, 6–11; Flavour B → Tasks 4, 12; layout-only exception → Task 12 Step 2; P2 fold-in → Task 3 Step 3 and each batch's step 5; P1 collision → Task 7; CLAUDE.md rules → Task 5; the 17 new files → Tasks 13–16; merge-time follow-ups and the divergence write-up → Task 17.

**Known gap, stated rather than hidden:** the spec's own "Relationship to the audit" section says the hand-written property lists remain the suite's weakness, and this plan does not fix that. It multiplies the scheme axis over the existing lists and adds two properties. A dark-mode divergence in an unlisted property still escapes.

**Type consistency.** `setColorScheme`, `COLOR_SCHEMES` and `ColorScheme` are used with those exact names in every task, imported from `./helpers` throughout. `settleTransitions` and `lastShadowLayer` keep their existing signatures.

**Count check.** 63 retrofits = 1 (Button) + 1 (LocaleSwitcher) + 58 (Tasks 6–11: 7+14+11+11+8+7) + 3 (Task 12). New files = 3 (Task 13) + 5 (Task 14) + 6 (Task 15) + 3 (Task 16) = 17. Total 80, matching the spec.
