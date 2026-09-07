# Color Scheme Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship six presentation forms of a light/dark/system color scheme switcher, plus the `system` mode in `ColorSchemeProvider` that makes them possible.

**Architecture:** `ColorSchemeProvider` gains a third mode, `system`, resolved from `prefers-color-scheme` through `useSyncExternalStore` and exposed alongside the user's raw choice as `resolvedMode`. Six separate components (not one polymorphic component with a `variant` prop) compose existing Joy-compared primitives — `IconButton`, `Menu`/`MenuItem`, `ToggleButtonGroup`, `Switch`, `Select` — and share one internal module for mode order, labels and icons. Because those primitives have never been rendered in dark mode by any test, the plan verifies the dark token block against real `@mui/joy` before building anything on top of it.

**Tech Stack:** React 19, Base UI 1.7, Tailwind CSS v4 (CSS-first), `class-variance-authority`, Vitest (jsdom for units, `@vitest/browser-playwright` + real `@mui/joy` for visual parity).

**Spec:** `docs/superpowers/specs/2026-09-07-color-scheme-switcher-design.md`

## Global Constraints

- All work happens on local `main`, as the user requested. Do not push. Another session may also be committing to `main` — check `git status` before each commit and never `git add -A`; stage only the files the task names.
- Run commands from `packages/ui/` unless a step says otherwise. `pnpm typecheck`, `pnpm lint` and `pnpm build` are run from the repo root.
- `data-color-scheme` on the provider's wrapper always carries `resolvedMode` (`light` or `dark`), never `system`. `theme.css` defines tokens for those two values only.
- Every new component in `packages/ui/src/components/*` needs a matching `packages/ui/src/visual/<Component>.visual.test.tsx` (CLAUDE.md hard requirement). A form task is not complete without it.
- Component directory layout follows the existing convention exactly: `<Name>.tsx`, `types.ts`, `index.ts`, `<Name>.test.tsx`.
- Default labels are English (`System`, `Light`, `Dark`), overridable through a `labels` prop. The library ships no translations.
- Icons live in `src/internal/svg-icons/` and follow that directory's established shape: `width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"`, path data taken verbatim from Material Design, never redrawn.
- First run of any new `toMatchScreenshot()` assertion fails on purpose ("no existing reference screenshot found"). Rerun once, then open the PNG under `__screenshots__/` and look at it before trusting it.
- Baselines are named per browser+platform (`*-chromium-darwin.png` on macOS) and are local-only; there is no CI wiring for them.

---

## Phase 1 — Foundation

### Task 1: A dark-mode comparison harness for the visual suite

No visual test has ever rendered in dark mode, so before comparing anything, establish *how* to put real Joy into dark mode inside a browser test. This task's deliverable is that helper plus one passing dark assertion.

**Files:**
- Create: `packages/ui/src/visual/darkMode.tsx`
- Test: `packages/ui/src/visual/DarkModeHarness.visual.test.tsx`

**Interfaces:**
- Consumes: `settleTransitions` from `packages/ui/src/visual/helpers.ts`.
- Produces: `renderJoyDark(node: React.ReactNode): void` and `renderHintoricDark(node: React.ReactNode): void` — render helpers that mount their argument inside a dark-mode wrapper for Joy and for us respectively. Also `renderJoyLight` / `renderHintoricLight` for symmetry. Task 2 and every Phase 2 visual test consume these.

- [ ] **Step 1: Write the failing test that proves Joy's dark mode activates**

Joy's `CssVarsProvider` generates `[data-joy-color-scheme="dark"]` selectors by default, which means a wrapper element carrying that attribute should switch its subtree. That is an assumption, and this test is what turns it into a fact.

Create `packages/ui/src/visual/DarkModeHarness.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, IconButton as JoyIconButton } from '@mui/joy';
import { IconButton as HintoricIconButton } from '../components/IconButton';
import { renderJoyDark, renderJoyLight, renderHintoricDark, renderHintoricLight } from './darkMode';
import { settleTransitions } from './helpers';

describe('dark mode harness', () => {
  it('puts real Joy into dark mode, producing a different soft background than light', async () => {
    renderJoyLight(<JoyIconButton data-testid="joy-light" variant="soft" color="neutral">+</JoyIconButton>);
    renderJoyDark(<JoyIconButton data-testid="joy-dark" variant="soft" color="neutral">+</JoyIconButton>);
    await settleTransitions();

    const light = getComputedStyle(page.getByTestId('joy-light').element()).backgroundColor;
    const dark = getComputedStyle(page.getByTestId('joy-dark').element()).backgroundColor;

    // soft/neutral is neutral-100 in light and neutral-800 in dark — if these
    // are equal, the dark wrapper did not take effect and every dark
    // comparison built on this helper would silently compare light to light.
    expect(dark).not.toBe(light);
  });

  it('puts our own provider into dark mode the same way', async () => {
    renderHintoricLight(<HintoricIconButton data-testid="ours-light" variant="soft" color="neutral" aria-label="light">+</HintoricIconButton>);
    renderHintoricDark(<HintoricIconButton data-testid="ours-dark" variant="soft" color="neutral" aria-label="dark">+</HintoricIconButton>);
    await settleTransitions();

    const light = getComputedStyle(page.getByTestId('ours-light').element()).backgroundColor;
    const dark = getComputedStyle(page.getByTestId('ours-dark').element()).backgroundColor;

    expect(dark).not.toBe(light);
  });

  it('agrees with Joy on soft/neutral in dark mode', async () => {
    renderJoyDark(<JoyIconButton data-testid="joy" variant="soft" color="neutral">+</JoyIconButton>);
    renderHintoricDark(<HintoricIconButton data-testid="ours" variant="soft" color="neutral" aria-label="ours">+</HintoricIconButton>);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('ours').element()).backgroundColor).toBe(
      getComputedStyle(page.getByTestId('joy').element()).backgroundColor,
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test:visual -- DarkModeHarness`
Expected: FAIL — `Failed to resolve import "./darkMode"`.

- [ ] **Step 3: Write the harness**

Create `packages/ui/src/visual/darkMode.tsx`:

```tsx
import type * as React from 'react';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

/*
 * Two things have to be dark at once for a comparison to mean anything, and
 * they use different mechanisms:
 *
 * - Joy's CssVarsProvider emits `[data-joy-color-scheme="dark"]` selectors, so
 *   an element carrying that attribute switches its whole subtree. We cannot
 *   use `defaultMode="dark"` instead: that writes the attribute onto <html>,
 *   which is shared, so a light and a dark Joy element could not coexist in
 *   one test document.
 * - Ours reads `[data-color-scheme="dark"]`, set by ColorSchemeProvider from
 *   its resolved mode. Passing the attribute directly on a wrapper skips the
 *   provider's own resolution, which is what we want here — this suite tests
 *   token parity, not mode resolution (that is covered in jsdom).
 */
export function renderJoyLight(node: React.ReactNode): void {
  render(
    <JoyCssVarsProvider>
      <div data-joy-color-scheme="light">{node}</div>
    </JoyCssVarsProvider>,
  );
}

export function renderJoyDark(node: React.ReactNode): void {
  render(
    <JoyCssVarsProvider>
      <div data-joy-color-scheme="dark">{node}</div>
    </JoyCssVarsProvider>,
  );
}

export function renderHintoricLight(node: React.ReactNode): void {
  render(
    <ColorSchemeProvider>
      <div data-color-scheme="light">{node}</div>
    </ColorSchemeProvider>,
  );
}

export function renderHintoricDark(node: React.ReactNode): void {
  render(
    <ColorSchemeProvider>
      <div data-color-scheme="dark">{node}</div>
    </ColorSchemeProvider>,
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm --filter @hintoric/ui test:visual -- DarkModeHarness`
Expected: PASS, 3 tests.

**If the first test fails with equal light and dark backgrounds**, the attribute-on-a-wrapper assumption is wrong for this Joy version. Do not work around it by loosening the assertion. Instead read `node_modules/@mui/joy/styles/extendTheme.js` and `node_modules/@mui/system/cssVars/createCssVarsProvider.js` for the `colorSchemeSelector` default, and switch `renderJoyDark` to whatever selector Joy actually emits (`.mode-dark` class or a media query would both need a different wrapper). Record what you found as a comment in `darkMode.tsx`, because the next person will assume the same thing you did.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/visual/darkMode.tsx packages/ui/src/visual/DarkModeHarness.visual.test.tsx
git commit -m "Add a dark-mode render harness to the visual suite"
```

---

### Task 2: Verify the dark token block against real Joy

The `[data-color-scheme="dark"]` block in `theme.css` is several hundred lines copied from Joy and never once verified. This task covers the five primitives the switcher forms are built from. One table-driven file, because the assertion is identical for each and five near-copies would rot apart.

**Files:**
- Create: `packages/ui/src/visual/DarkTokens.visual.test.tsx`
- Modify: `packages/ui/src/styles/theme.css` (only if a mismatch is found)

**Interfaces:**
- Consumes: `renderJoyDark`, `renderHintoricDark` from Task 1; `settleTransitions`, `lastShadowLayer` from `helpers.ts`.
- Produces: nothing other tasks import. Its output is confidence plus, possibly, token corrections.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/visual/DarkTokens.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import {
  IconButton as JoyIconButton,
  MenuItem as JoyMenuItem,
  Switch as JoySwitch,
  Select as JoySelect,
  Button as JoyButton,
} from '@mui/joy';
import { IconButton } from '../components/IconButton';
import { MenuItem } from '../components/MenuItem';
import { Switch } from '../components/Switch';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { renderJoyDark, renderHintoricDark } from './darkMode';
import { settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// MenuItem renders inside a Joy Menu in real use, but its own styling comes
// from ListItemButton and needs no popup to resolve — rendering it bare keeps
// the comparison to the tokens, which is what this file is about.
const CASES = [
  {
    name: 'IconButton',
    joy: (variant: string, color: string, testId: string) => (
      <JoyIconButton data-testid={testId} variant={variant as 'solid'} color={color as 'primary'}>
        +
      </JoyIconButton>
    ),
    ours: (variant: string, color: string, testId: string) => (
      <IconButton data-testid={testId} variant={variant as 'solid'} color={color as 'primary'} aria-label={testId}>
        +
      </IconButton>
    ),
  },
  {
    name: 'Button',
    joy: (variant: string, color: string, testId: string) => (
      <JoyButton data-testid={testId} variant={variant as 'solid'} color={color as 'primary'}>
        Label
      </JoyButton>
    ),
    ours: (variant: string, color: string, testId: string) => (
      <Button data-testid={testId} variant={variant as 'solid'} color={color as 'primary'}>
        Label
      </Button>
    ),
  },
  {
    name: 'MenuItem',
    joy: (variant: string, color: string, testId: string) => (
      <JoyMenuItem data-testid={testId} variant={variant as 'solid'} color={color as 'primary'}>
        Label
      </JoyMenuItem>
    ),
    ours: (variant: string, color: string, testId: string) => (
      <MenuItem data-testid={testId} variant={variant as 'solid'} color={color as 'primary'}>
        Label
      </MenuItem>
    ),
  },
] as const;

describe('dark mode token parity with @mui/joy', () => {
  for (const testCase of CASES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${testCase.name} ${variant}/${color} matches Joy in dark mode`, async () => {
          const joyId = `joy-${testCase.name}-${variant}-${color}`;
          const oursId = `ours-${testCase.name}-${variant}-${color}`;
          renderJoyDark(testCase.joy(variant, color, joyId));
          renderHintoricDark(testCase.ours(variant, color, oursId));
          await settleTransitions();

          const joyStyle = getComputedStyle(page.getByTestId(joyId).element());
          const oursStyle = getComputedStyle(page.getByTestId(oursId).element());

          expect(oursStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(oursStyle.color).toBe(joyStyle.color);
          expect(oursStyle.borderColor).toBe(joyStyle.borderColor);
        });
      }
    }
  }

  it('Switch matches Joy in dark mode, unchecked and checked', async () => {
    renderJoyDark(
      <>
        <JoySwitch data-testid="joy-switch-off" />
        <JoySwitch data-testid="joy-switch-on" checked />
      </>,
    );
    renderHintoricDark(
      <>
        <Switch data-testid="ours-switch-off" />
        <Switch data-testid="ours-switch-on" checked />
      </>,
    );
    await settleTransitions();

    for (const state of ['off', 'on']) {
      const joyStyle = getComputedStyle(page.getByTestId(`joy-switch-${state}`).element());
      const oursStyle = getComputedStyle(page.getByTestId(`ours-switch-${state}`).element());
      expect(oursStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    }
  });

  it('Select matches Joy in dark mode', async () => {
    renderJoyDark(<JoySelect data-testid="joy-select" placeholder="Pick" />);
    renderHintoricDark(<Select data-testid="ours-select" placeholder="Pick" />);
    await settleTransitions();

    const joyStyle = getComputedStyle(page.getByTestId('joy-select').element());
    const oursStyle = getComputedStyle(page.getByTestId('ours-select').element());

    expect(oursStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(oursStyle.color).toBe(joyStyle.color);
    expect(oursStyle.borderColor).toBe(joyStyle.borderColor);
  });

  it('renders a readable grid of every dark variant for human review', async () => {
    renderHintoricDark(
      <div data-testid="dark-grid" style={{ display: 'grid', gap: 8, padding: 16, gridTemplateColumns: 'repeat(5, max-content)' }}>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <Button key={`${variant}-${color}`} variant={variant} color={color}>
              {variant}/{color}
            </Button>
          )),
        )}
      </div>,
    );
    await settleTransitions();

    await expect(page.getByTestId('dark-grid')).toMatchScreenshot('dark-tokens-button-grid');
  });
});
```

- [ ] **Step 2: Run it and record what fails**

Run: `pnpm --filter @hintoric/ui test:visual -- DarkTokens`
Expected: the screenshot test fails once on purpose (no baseline yet). The parity tests may pass outright — or may not, and that is the point of the task.

For **every** parity failure, fix the token in `packages/ui/src/styles/theme.css`, not the assertion. Read the real value out of `node_modules/@mui/joy/styles/extendTheme.js` (the `colorSchemes.dark` palette) and correct the `[data-color-scheme="dark"]` entry to match it. Add a comment naming the token and where you read it, in the style of the surrounding file.

If a failure turns out to be a genuine, defensible divergence rather than a bug (as `Select`'s primary-only focus ring was), do not silently loosen it — document it in the spec's addendum section the way `docs/superpowers/specs/2026-09-06-locale-switcher-design.md` does, then adjust the test with a comment pointing at that entry.

- [ ] **Step 3: Rerun until green**

Run: `pnpm --filter @hintoric/ui test:visual -- DarkTokens`
Expected: PASS. Then open `packages/ui/src/visual/__screenshots__/` and look at `dark-tokens-button-grid-chromium-darwin.png`. If it is unreadable, or any swatch is invisible against its own background, that is a real finding — go back to Step 2.

- [ ] **Step 4: Run the whole visual suite to catch collateral damage**

Run: `pnpm --filter @hintoric/ui test:visual`
Expected: PASS. A token correction in Step 2 can invalidate existing light-mode baselines if the token is shared; if a light-mode test now fails, the correction was wrong — dark tokens live in their own block and must not affect `:root`.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/visual/DarkTokens.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/styles/theme.css
git commit -m "Verify the dark token block against real Joy for the switcher's primitives"
```

---

### Task 3: `system` mode in `ColorSchemeProvider`

**Files:**
- Modify: `packages/ui/src/theme/ColorSchemeProvider.tsx`
- Modify: `packages/ui/src/theme/ColorSchemeProvider.test.tsx`
- Modify: `packages/ui/src/index.ts:3-4`
- Modify: `packages/ui/src/test/setup.ts`

**Interfaces:**
- Produces:
  - `type ColorSchemeMode = 'light' | 'dark' | 'system'`
  - `type ResolvedColorScheme = 'light' | 'dark'`
  - `useColorScheme(): { mode: ColorSchemeMode; resolvedMode: ResolvedColorScheme; setMode: (mode: ColorSchemeMode) => void }`
  - `ColorSchemeProviderProps.defaultMode?: ColorSchemeMode` — default is now `'system'`.

  Every Phase 2 component consumes `useColorScheme()`.

- [ ] **Step 1: Add a `matchMedia` stub to the jsdom setup**

jsdom ships no `matchMedia`, so the provider would throw in every unit test. Append to `packages/ui/src/test/setup.ts`:

```ts
/*
 * jsdom implements no matchMedia at all, and ColorSchemeProvider calls it to
 * resolve `system`. A stub that reports "not dark" and records its listeners
 * lets tests drive an OS-level change: read the listener off
 * `matchMediaState.listeners` and call it after flipping `matches`.
 */
export const matchMediaState = {
  matches: false,
  listeners: new Set<(event: MediaQueryListEvent) => void>(),
};

beforeEach(() => {
  matchMediaState.matches = false;
  matchMediaState.listeners.clear();
});

window.matchMedia = ((query: string) => ({
  media: query,
  get matches() {
    return matchMediaState.matches;
  },
  onchange: null,
  addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
    matchMediaState.listeners.add(listener);
  },
  removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
    matchMediaState.listeners.delete(listener);
  },
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

export function setSystemDark(dark: boolean): void {
  matchMediaState.matches = dark;
  for (const listener of matchMediaState.listeners) {
    listener({ matches: dark } as MediaQueryListEvent);
  }
}
```

Add `beforeEach` to the existing `vitest` import at the top of that file.

- [ ] **Step 2: Write the failing tests**

Replace the `Consumer` component near the top of `packages/ui/src/theme/ColorSchemeProvider.test.tsx` and add the new cases. The `Consumer` becomes:

```tsx
function Consumer() {
  const { mode, resolvedMode, setMode } = useColorScheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
      <button type="button" onClick={() => setMode('dark')}>
        go dark
      </button>
      <button type="button" onClick={() => setMode('system')}>
        go system
      </button>
    </div>
  );
}
```

Then append these tests inside the existing `describe('ColorSchemeProvider')`:

```tsx
it('defaults to system and resolves it from the browser preference', () => {
  render(
    <ColorSchemeProvider>
      <Consumer />
    </ColorSchemeProvider>,
  );
  expect(screen.getByTestId('mode')).toHaveTextContent('system');
  expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
    'data-color-scheme',
    'light',
  );
});

it('resolves system to dark when the browser prefers dark', () => {
  setSystemDark(true);
  render(
    <ColorSchemeProvider>
      <Consumer />
    </ColorSchemeProvider>,
  );
  expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
});

it('follows a browser preference change without a reload', async () => {
  render(
    <ColorSchemeProvider>
      <Consumer />
    </ColorSchemeProvider>,
  );
  expect(screen.getByTestId('resolved')).toHaveTextContent('light');

  await act(async () => {
    setSystemDark(true);
  });

  expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
});

it('never puts system on the data attribute', async () => {
  setSystemDark(true);
  render(
    <ColorSchemeProvider>
      <Consumer />
    </ColorSchemeProvider>,
  );
  expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
    'data-color-scheme',
    'dark',
  );
});

it('persists system explicitly rather than clearing the key', async () => {
  render(
    <ColorSchemeProvider defaultMode="light">
      <Consumer />
    </ColorSchemeProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'go system' }));

  // Clearing the key would let defaultMode="light" overwrite this choice on
  // the next load — the user asked to follow the system, not to reset.
  expect(window.localStorage.getItem('hintoric-color-scheme')).toBe('system');
});

it('prefers a stored mode over defaultMode', () => {
  window.localStorage.setItem('hintoric-color-scheme', 'dark');
  render(
    <ColorSchemeProvider defaultMode="light">
      <Consumer />
    </ColorSchemeProvider>,
  );
  expect(screen.getByTestId('mode')).toHaveTextContent('dark');
});

it('falls back to defaultMode when the stored value is not a mode', () => {
  window.localStorage.setItem('hintoric-color-scheme', 'aubergine');
  render(
    <ColorSchemeProvider defaultMode="light">
      <Consumer />
    </ColorSchemeProvider>,
  );
  expect(screen.getByTestId('mode')).toHaveTextContent('light');
});

it('adopts a mode chosen in another tab', async () => {
  render(
    <ColorSchemeProvider defaultMode="light">
      <Consumer />
    </ColorSchemeProvider>,
  );

  await act(async () => {
    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'hintoric-color-scheme', newValue: 'dark' }),
    );
  });

  expect(screen.getByTestId('mode')).toHaveTextContent('dark');
});

it('ignores storage events for other keys', async () => {
  render(
    <ColorSchemeProvider defaultMode="light">
      <Consumer />
    </ColorSchemeProvider>,
  );

  await act(async () => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: 'dark' }));
  });

  expect(screen.getByTestId('mode')).toHaveTextContent('light');
});
```

Add `act` to the `@testing-library/react` import, and import the helper: `import { setSystemDark } from '../test/setup';`.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeProvider`
Expected: FAIL — the default is still `light`, `resolvedMode` is `undefined`, and the storage/matchMedia cases do nothing.

- [ ] **Step 4: Implement the provider**

Replace the body of `packages/ui/src/theme/ColorSchemeProvider.tsx`:

```tsx
'use client';
import * as React from 'react';

export type ColorSchemeMode = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

interface ColorSchemeContextValue {
  /** What the user chose. `'system'` is a real, persisted choice. */
  mode: ColorSchemeMode;
  /** What is actually painted — never `'system'`. */
  resolvedMode: ResolvedColorScheme;
  setMode: (mode: ColorSchemeMode) => void;
}

const ColorSchemeContext = React.createContext<ColorSchemeContextValue | null>(null);

const STORAGE_KEY = 'hintoric-color-scheme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isMode(value: unknown): value is ColorSchemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function storedMode(): ColorSchemeMode | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isMode(stored) ? stored : undefined;
}

function subscribeToSystem(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function systemSnapshot(): ResolvedColorScheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/*
 * `useSyncExternalStore` rather than an effect that copies matchMedia into
 * state: it gives server rendering a defined snapshot ('light') instead of a
 * value that only appears after hydration and visibly flips, and it keeps the
 * subscription's lifetime tied to the read.
 */
function serverSnapshot(): ResolvedColorScheme {
  return 'light';
}

export interface ColorSchemeProviderProps {
  children: React.ReactNode;
  /**
   * Which mode applies when the user has never chosen one. Defaults to
   * `'system'` — the browser's own preference. Pass `'light'` for the
   * pre-system-mode behaviour.
   */
  defaultMode?: ColorSchemeMode;
}

export function ColorSchemeProvider({ children, defaultMode = 'system' }: ColorSchemeProviderProps) {
  const [mode, setModeState] = React.useState<ColorSchemeMode>(() => storedMode() ?? defaultMode);

  const systemScheme = React.useSyncExternalStore(subscribeToSystem, systemSnapshot, serverSnapshot);

  const setMode = React.useCallback((next: ColorSchemeMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      // 'system' is written, not cleared: an absent key means "never chose",
      // which a consumer's defaultMode is entitled to answer. Clearing would
      // let defaultMode overwrite an explicit choice on the next load.
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  // Two tabs of the same app disagreeing about the color scheme reads as a
  // bug, so adopt what another tab stored.
  React.useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      if (isMode(event.newValue)) setModeState(event.newValue);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const resolvedMode: ResolvedColorScheme = mode === 'system' ? systemScheme : mode;

  const value = React.useMemo(
    () => ({ mode, resolvedMode, setMode }),
    [mode, resolvedMode, setMode],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {/* resolvedMode, never mode: theme.css defines tokens for light and
          dark only, so data-color-scheme="system" would silently drop every
          dark override and leave the app on :root's light values. */}
      <div data-color-scheme={resolvedMode}>{children}</div>
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const context = React.useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
}
```

- [ ] **Step 5: Export the new type**

In `packages/ui/src/index.ts`, replace line 4:

```ts
export type {
  ColorSchemeMode,
  ColorSchemeProviderProps,
  ResolvedColorScheme,
} from './theme/ColorSchemeProvider';
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeProvider`
Expected: PASS, including the pre-existing tests. The old test named "defaults to light mode and sets data-color-scheme on its wrapper" now contradicts the new default — update it to pass `defaultMode="light"` explicitly and rename it to "honours an explicit light defaultMode", rather than deleting it: an explicit `defaultMode` still has to work.

- [ ] **Step 7: Run the full jsdom suite**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS. Any other test that rendered a `ColorSchemeProvider` now gets `system`; if one asserted a light-mode-specific value, give it `defaultMode="light"`.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/theme/ColorSchemeProvider.tsx packages/ui/src/theme/ColorSchemeProvider.test.tsx packages/ui/src/index.ts packages/ui/src/test/setup.ts
git commit -m "Teach ColorSchemeProvider a system mode and expose resolvedMode"
```

---

### Task 4: Wire Tailwind's `dark:` variant to the provider

**Files:**
- Modify: `packages/ui/src/styles/index.css`
- Create: `packages/ui/src/visual/DarkVariant.visual.test.tsx`

**Interfaces:**
- Consumes: `renderHintoricLight`, `renderHintoricDark` from Task 1.
- Produces: nothing importable. It makes consumers' own `dark:` classes agree with the provider.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/visual/DarkVariant.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { renderHintoricDark, renderHintoricLight } from './darkMode';
import { settleTransitions } from './helpers';

// A consumer writing `dark:` in their own markup must follow OUR switcher, not
// the raw OS preference — otherwise the app they built disagrees with the
// button we gave them. Tailwind's stock `dark:` reads prefers-color-scheme, so
// this only holds once index.css declares a custom variant.
describe('the dark: variant follows data-color-scheme', () => {
  it('does not apply inside a light subtree', async () => {
    renderHintoricLight(<div data-testid="light-box" className="bg-neutral-100 dark:bg-neutral-800" />);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('light-box').element()).backgroundColor).toBe(
      'rgb(240, 244, 248)',
    );
  });

  it('applies inside a dark subtree', async () => {
    renderHintoricDark(<div data-testid="dark-box" className="bg-neutral-100 dark:bg-neutral-800" />);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('dark-box').element()).backgroundColor).toBe(
      'rgb(23, 26, 28)',
    );
  });
});
```

The two expected values are `--color-neutral-100: #f0f4f8` and `--color-neutral-800: #171a1c` from `theme.css`.

- [ ] **Step 2: Run it to verify the second test fails**

Run: `pnpm --filter @hintoric/ui test:visual -- DarkVariant`
Expected: the light test passes; the dark test FAILS, reporting the neutral-100 colour, because stock `dark:` keys off the OS and the headless browser reports light.

- [ ] **Step 3: Declare the variant**

In `packages/ui/src/styles/index.css`, immediately after the two `@import` lines:

```css
/*
 * Tailwind's stock `dark:` keys off `prefers-color-scheme`, which would
 * contradict ColorSchemeProvider the moment a user overrides their OS
 * setting. Point it at the same attribute our tokens use. Our own components
 * never write `dark:` (they read tokens instead) — this exists entirely for
 * consumers' own markup.
 */
@custom-variant dark (&:where([data-color-scheme="dark"], [data-color-scheme="dark"] *));
```

- [ ] **Step 4: Run it to verify both pass**

Run: `pnpm --filter @hintoric/ui test:visual -- DarkVariant`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/styles/index.css packages/ui/src/visual/DarkVariant.visual.test.tsx
git commit -m "Point Tailwind's dark: variant at data-color-scheme"
```

---

## Phase 2 — The six forms

### Task 5: The shared core and the three icons

**Files:**
- Create: `packages/ui/src/internal/svg-icons/LightModeIcon.tsx`
- Create: `packages/ui/src/internal/svg-icons/DarkModeIcon.tsx`
- Create: `packages/ui/src/internal/svg-icons/SettingsBrightnessIcon.tsx`
- Create: `packages/ui/src/internal/colorScheme.tsx`
- Test: `packages/ui/src/internal/colorScheme.test.tsx`

**Interfaces:**
- Produces, all consumed by Tasks 6–11:
  - `COLOR_SCHEME_MODES: readonly ['system', 'light', 'dark']`
  - `nextColorSchemeMode(mode: ColorSchemeMode): ColorSchemeMode`
  - `interface ColorSchemeLabels { system?: React.ReactNode; light?: React.ReactNode; dark?: React.ReactNode }`
  - `resolveColorSchemeLabels(labels?: ColorSchemeLabels): Record<ColorSchemeMode, React.ReactNode>`
  - `COLOR_SCHEME_ICONS: Record<ColorSchemeMode, React.ComponentType<React.SVGProps<SVGSVGElement>>>`
  - `ICON_SIZE_CLASS: Record<'sm' | 'md' | 'lg', string>`

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/internal/colorScheme.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  COLOR_SCHEME_ICONS,
  COLOR_SCHEME_MODES,
  nextColorSchemeMode,
  resolveColorSchemeLabels,
} from './colorScheme';

describe('colorScheme shared core', () => {
  it('orders the modes system, light, dark', () => {
    expect(COLOR_SCHEME_MODES).toEqual(['system', 'light', 'dark']);
  });

  it('cycles through every mode and wraps around', () => {
    expect(nextColorSchemeMode('system')).toBe('light');
    expect(nextColorSchemeMode('light')).toBe('dark');
    expect(nextColorSchemeMode('dark')).toBe('system');
  });

  it('defaults every label in English', () => {
    expect(resolveColorSchemeLabels()).toEqual({ system: 'System', light: 'Light', dark: 'Dark' });
  });

  it('overrides only the labels it is given', () => {
    expect(resolveColorSchemeLabels({ dark: 'Dunkel' })).toEqual({
      system: 'System',
      light: 'Light',
      dark: 'Dunkel',
    });
  });

  it('has one icon per mode, and each renders a path', () => {
    for (const mode of COLOR_SCHEME_MODES) {
      const Icon = COLOR_SCHEME_ICONS[mode];
      const { container, unmount } = render(<Icon data-testid={`icon-${mode}`} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      // aria-hidden because the control around it carries the accessible name.
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy();
      unmount();
    }
  });

  it('gives each mode a distinct icon', () => {
    const icons = new Set(COLOR_SCHEME_MODES.map((mode) => COLOR_SCHEME_ICONS[mode]));
    expect(icons.size).toBe(3);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- colorScheme`
Expected: FAIL — `Failed to resolve import "./colorScheme"`.

- [ ] **Step 3: Write the three icons**

The path data below is Material Design's own `light_mode`, `dark_mode` and `settings_brightness` at 24px, taken verbatim from the Google export. Do not retype or simplify it.

`packages/ui/src/internal/svg-icons/LightModeIcon.tsx`:

```tsx
import type * as React from 'react';

// Material Design's "light_mode" path, verbatim — the same icon @mui/joy's own
// documentation uses for its light-mode control. Transcribed rather than
// redrawn, like every other icon in this directory.
export function LightModeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
    </svg>
  );
}
```

`packages/ui/src/internal/svg-icons/DarkModeIcon.tsx`:

```tsx
import type * as React from 'react';

// Material Design's "dark_mode" path, verbatim.
export function DarkModeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}
```

`packages/ui/src/internal/svg-icons/SettingsBrightnessIcon.tsx`:

```tsx
import type * as React from 'react';

// Material Design's "settings_brightness" path, verbatim — a display with a
// half-lit sun, which is how Material depicts "follow the system" rather than
// a fixed brightness.
export function SettingsBrightnessIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02zM8 16h2.5l1.5 1.5 1.5-1.5H16v-2.5l1.5-1.5-1.5-1.5V8h-2.5L12 6.5 10.5 8H8v2.5L6.5 12 8 13.5V16zm4-7c1.66 0 3 1.34 3 3s-1.34 3-3 3V9z" />
    </svg>
  );
}
```

- [ ] **Step 4: Write the shared core**

Create `packages/ui/src/internal/colorScheme.tsx`:

```tsx
import type * as React from 'react';
import type { ColorSchemeMode } from '../theme/ColorSchemeProvider';
import { DarkModeIcon } from './svg-icons/DarkModeIcon';
import { LightModeIcon } from './svg-icons/LightModeIcon';
import { SettingsBrightnessIcon } from './svg-icons/SettingsBrightnessIcon';

/*
 * One place decides the order of the three modes. Six components render them —
 * as a cycle, as a menu, as segments, as options — and a disagreement between
 * any two of them would look like a bug to the user, not like variety.
 *
 * `system` comes first because it is the default: the list reads
 * "follow the system, or override it one way or the other".
 */
export const COLOR_SCHEME_MODES = ['system', 'light', 'dark'] as const;

/** Wraps at the end, so a cycling control always has a next state. */
export function nextColorSchemeMode(mode: ColorSchemeMode): ColorSchemeMode {
  const index = COLOR_SCHEME_MODES.indexOf(mode);
  return COLOR_SCHEME_MODES[(index + 1) % COLOR_SCHEME_MODES.length];
}

export interface ColorSchemeLabels {
  system?: React.ReactNode;
  light?: React.ReactNode;
  dark?: React.ReactNode;
}

const DEFAULT_LABELS: Record<ColorSchemeMode, React.ReactNode> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/*
 * English defaults, partially overridable. The library ships no translations
 * and knows no i18n library — the same line LocaleSwitcher draws. A caller
 * who translates one label should not have to restate the other two.
 */
export function resolveColorSchemeLabels(
  labels?: ColorSchemeLabels,
): Record<ColorSchemeMode, React.ReactNode> {
  return {
    system: labels?.system ?? DEFAULT_LABELS.system,
    light: labels?.light ?? DEFAULT_LABELS.light,
    dark: labels?.dark ?? DEFAULT_LABELS.dark,
  };
}

export const COLOR_SCHEME_ICONS: Record<
  ColorSchemeMode,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  system: SettingsBrightnessIcon,
  light: LightModeIcon,
  dark: DarkModeIcon,
};

/*
 * The icons are `1em`-based, so without an explicit size they inherit the
 * surrounding font size and come out visibly small inside a control. Locked
 * with `size-*` so width and height cannot drift apart.
 */
export const ICON_SIZE_CLASS = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-7',
} as const;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- colorScheme`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/internal/colorScheme.tsx packages/ui/src/internal/colorScheme.test.tsx packages/ui/src/internal/svg-icons/LightModeIcon.tsx packages/ui/src/internal/svg-icons/DarkModeIcon.tsx packages/ui/src/internal/svg-icons/SettingsBrightnessIcon.tsx
git commit -m "Add the color scheme forms' shared core and three Material icons"
```

---

### Task 6: `ColorSchemeToggle`

**Files:**
- Create: `packages/ui/src/components/ColorSchemeToggle/ColorSchemeToggle.tsx`
- Create: `packages/ui/src/components/ColorSchemeToggle/types.ts`
- Create: `packages/ui/src/components/ColorSchemeToggle/index.ts`
- Test: `packages/ui/src/components/ColorSchemeToggle/ColorSchemeToggle.test.tsx`
- Test: `packages/ui/src/visual/ColorSchemeToggle.visual.test.tsx`
- Modify: `packages/ui/src/index.ts` (append)

**Interfaces:**
- Consumes: `useColorScheme` (Task 3); `COLOR_SCHEME_ICONS`, `ICON_SIZE_CLASS`, `nextColorSchemeMode` (Task 5); `IconButton`.
- Produces: `ColorSchemeToggle`, `ColorSchemeToggleProps`.

- [ ] **Step 1: Write the failing unit test**

Create `packages/ui/src/components/ColorSchemeToggle/ColorSchemeToggle.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider } from '../../theme/ColorSchemeProvider';
import { ColorSchemeToggle } from './ColorSchemeToggle';

function renderToggle(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ColorSchemeToggle {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeToggle', () => {
  it('cycles system to light to dark and back', async () => {
    renderToggle();
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to system mode');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('labels the effect of a click, not the current state', () => {
    renderToggle();
    // A button that announces where it already is never tells the user what
    // pressing it does.
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('shows the chosen mode rather than the resolved one', async () => {
    const { container } = renderToggle();
    const iconOf = () => container.querySelector('svg path')?.getAttribute('d');

    // In `system` on a light OS, resolvedMode is 'light'. Showing the sun here
    // would make "follows the system" indistinguishable from "pinned to light".
    const systemIcon = iconOf();
    await userEvent.click(screen.getByRole('button'));
    expect(iconOf()).not.toBe(systemIcon);
  });

  it('lets a caller override the label', () => {
    renderToggle({ 'aria-label': 'Farbschema wechseln' });
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Farbschema wechseln');
  });

  it('still cycles when the caller passes their own onClick', async () => {
    const onClick = vi.fn();
    renderToggle({ onClick });
    const button = screen.getByRole('button');

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('forwards unrecognised props to the button', () => {
    renderToggle({ 'data-testid': 'toggle', className: 'custom' });
    expect(screen.getByTestId('toggle')).toHaveClass('custom');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeToggle />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeToggle`
Expected: FAIL — `Failed to resolve import "./ColorSchemeToggle"`.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorSchemeToggle/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ColorSchemeToggleProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
}
```

`packages/ui/src/components/ColorSchemeToggle/ColorSchemeToggle.tsx`:

```tsx
'use client';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { COLOR_SCHEME_ICONS, ICON_SIZE_CLASS, nextColorSchemeMode } from '../../internal/colorScheme';
import type { ColorSchemeToggleProps } from './types';

/**
 * The most compact of the six forms: one square button that cycles
 * `system → light → dark`. The icon shows the **chosen** mode, not the
 * resolved one — a sun while following a light OS would be indistinguishable
 * from a sun while pinned to light.
 *
 * The cost is discoverability: three unlabelled stops have to be clicked
 * through to be found. Where that matters, use `ColorSchemeMenu`, whose stops
 * are named.
 *
 * Defaults to `outlined`/`md` rather than IconButton's own `plain`: a control
 * that renders as a bare glyph does not read as a control — the same
 * correction LocaleSwitcher made after shipping `plain`.
 */
export const ColorSchemeToggle = React.forwardRef<HTMLButtonElement, ColorSchemeToggleProps>(
  function ColorSchemeToggle(
    { variant = 'outlined', color = 'neutral', size = 'md', onClick, ...props },
    ref,
  ) {
    const { mode, setMode } = useColorScheme();
    const next = nextColorSchemeMode(mode);
    const Icon = COLOR_SCHEME_ICONS[mode];

    return (
      <IconButton
        ref={ref}
        variant={variant}
        color={color}
        size={size}
        aria-label={`Switch to ${next} mode`}
        {...props}
        onClick={(event) => {
          // The caller's handler runs too rather than replacing ours —
          // spreading `props` over `onClick` would silently break the toggle.
          onClick?.(event);
          setMode(next);
        }}
      >
        <Icon className={ICON_SIZE_CLASS[size]} />
      </IconButton>
    );
  },
);
```

`packages/ui/src/components/ColorSchemeToggle/index.ts`:

```ts
export { ColorSchemeToggle } from './ColorSchemeToggle';
export type { ColorSchemeToggleProps } from './types';
```

Append to `packages/ui/src/index.ts`, before the trailing `export type { JoyColor, JoyVariant }` line:

```ts
export { ColorSchemeToggle } from './components/ColorSchemeToggle';
export type { ColorSchemeToggleProps } from './components/ColorSchemeToggle';
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeToggle`
Expected: PASS, 7 tests.

- [ ] **Step 5: Write the visual test**

This is a composition of `IconButton`, which already carries a full Joy-compared variant × color matrix, so a second cross-product would re-assert the same computed styles. What a composition can still get wrong is pass-through, icon choice and sizing — plus its look in dark mode, which is the whole point of the component.

Create `packages/ui/src/visual/ColorSchemeToggle.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton as JoyIconButton } from '@mui/joy';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { renderJoyDark, renderHintoricDark } from './darkMode';
import { settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

describe('ColorSchemeToggle visual', () => {
  it.each(SIZES)('passes size %s through to the button', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid={`toggle-${size}`} size={size} />
      </ColorSchemeProvider>,
    );
    render(<JoyIconButton data-testid={`joy-${size}`} variant="outlined" color="neutral" size={size}>+</JoyIconButton>);
    await settleTransitions();

    const ours = getComputedStyle(page.getByTestId(`toggle-${size}`).element());
    const joy = getComputedStyle(page.getByTestId(`joy-${size}`).element());

    // Swallowing `size` is the classic composition bug — LocaleSwitcher's
    // visual test exists for the same reason.
    expect(ours.width).toBe(joy.width);
    expect(ours.height).toBe(joy.height);
  });

  it('renders its icon at the size Joy gives an IconButton icon', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" size="md" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const icon = page.getByTestId('toggle').element().querySelector('svg');
    const iconStyle = getComputedStyle(icon as Element);

    // ICON_SIZE_CLASS.md is `size-6` = 24px. If Joy's own --Icon-fontSize for
    // a md IconButton turns out to differ, correct ICON_SIZE_CLASS rather than
    // this number, and say so in a comment there.
    expect(iconStyle.width).toBe('24px');
    expect(iconStyle.height).toBe('24px');
  });

  it('is outlined by default', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" />
      </ColorSchemeProvider>,
    );
    render(<JoyIconButton data-testid="joy" variant="outlined" color="neutral">+</JoyIconButton>);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('toggle').element()).borderColor).toBe(
      getComputedStyle(page.getByTestId('joy').element()).borderColor,
    );
  });

  it('shows the same focus-visible outline as Joy', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" />
      </ColorSchemeProvider>,
    );
    render(<JoyIconButton data-testid="joy" variant="outlined" color="neutral">+</JoyIconButton>);

    (page.getByTestId('toggle').element() as HTMLElement).focus();
    (page.getByTestId('joy').element() as HTMLElement).focus();
    (page.getByTestId('toggle').element() as HTMLElement).focus();
    await settleTransitions();

    const ours = getComputedStyle(page.getByTestId('toggle').element());
    expect(ours.outlineWidth).toBe('2px');
    expect(ours.outlineStyle).toBe('solid');
  });

  it('matches Joy in dark mode', async () => {
    renderJoyDark(<JoyIconButton data-testid="joy" variant="outlined" color="neutral">+</JoyIconButton>);
    renderHintoricDark(<ColorSchemeToggle data-testid="toggle" />);
    await settleTransitions();

    const ours = getComputedStyle(page.getByTestId('toggle').element());
    const joy = getComputedStyle(page.getByTestId('joy').element());

    expect(ours.backgroundColor).toBe(joy.backgroundColor);
    expect(ours.borderColor).toBe(joy.borderColor);
    expect(ours.color).toBe(joy.color);
  });

  it('shows a different icon for each of the three modes', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" />
      </ColorSchemeProvider>,
    );
    const button = screen.getByRole('button');

    // No computed style can tell whether the right symbol is on screen, so
    // these three baselines are the actual signal, not decoration.
    await expect(page.getByTestId('toggle')).toMatchScreenshot('colorschemetoggle-system');
    await userEvent.click(button);
    await expect(page.getByTestId('toggle')).toMatchScreenshot('colorschemetoggle-light');
    await userEvent.click(button);
    await expect(page.getByTestId('toggle')).toMatchScreenshot('colorschemetoggle-dark');
  });

  it('matches its own baseline in dark mode', async () => {
    renderHintoricDark(<ColorSchemeToggle data-testid="toggle-dark" />);
    await settleTransitions();

    await expect(page.getByTestId('toggle-dark')).toMatchScreenshot('colorschemetoggle-dark-scheme');
  });
});
```

- [ ] **Step 6: Run the visual test, twice**

Run: `pnpm --filter @hintoric/ui test:visual -- ColorSchemeToggle`
Expected: first run FAILS on the four screenshot assertions ("no existing reference screenshot found"). Rerun; expected PASS.

Then open the four new PNGs in `packages/ui/src/visual/__screenshots__/` and confirm: `system` shows the display-with-sun glyph, `light` a full sun, `dark` a crescent moon, and the dark-scheme shot is legible on its dark ground. A green run with the wrong glyph is exactly the failure these baselines exist to catch.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/ColorSchemeToggle packages/ui/src/visual/ColorSchemeToggle.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/index.ts
git commit -m "Add ColorSchemeToggle, the cycling icon-button form"
```

---

### Task 7: `ColorSchemeMenuItems`

The three labelled entries with no trigger and no popup of their own, so an application that already has a user menu can hang them inside it.

**Files:**
- Create: `packages/ui/src/components/ColorSchemeMenuItems/ColorSchemeMenuItems.tsx`
- Create: `packages/ui/src/components/ColorSchemeMenuItems/types.ts`
- Create: `packages/ui/src/components/ColorSchemeMenuItems/index.ts`
- Test: `packages/ui/src/components/ColorSchemeMenuItems/ColorSchemeMenuItems.test.tsx`
- Test: `packages/ui/src/visual/ColorSchemeMenuItems.visual.test.tsx`
- Modify: `packages/ui/src/index.ts` (append)

**Interfaces:**
- Consumes: `useColorScheme`; `COLOR_SCHEME_MODES`, `COLOR_SCHEME_ICONS`, `ICON_SIZE_CLASS`, `resolveColorSchemeLabels`, `ColorSchemeLabels` (Task 5); `MenuItem`.
- Produces: `ColorSchemeMenuItems`, `ColorSchemeMenuItemsProps`. Task 8 renders it.

- [ ] **Step 1: Write the failing unit test**

Create `packages/ui/src/components/ColorSchemeMenuItems/ColorSchemeMenuItems.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuButton } from '../MenuButton';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { ColorSchemeMenuItems } from './ColorSchemeMenuItems';

function ModeProbe() {
  const { mode } = useColorScheme();
  return <span data-testid="mode">{mode}</span>;
}

// The items carry no popup of their own, so a host menu has to supply one —
// which is exactly the integration worth testing.
function renderInHostMenu(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ModeProbe />
      <Dropdown defaultOpen>
        <MenuButton>Account</MenuButton>
        <Menu>
          <ColorSchemeMenuItems {...props} />
        </Menu>
      </Dropdown>
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeMenuItems', () => {
  it('renders one labelled entry per mode', async () => {
    renderInHostMenu();
    expect(await screen.findByText('System')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('sets the mode to the entry that was clicked', async () => {
    renderInHostMenu();
    await userEvent.click(await screen.findByText('Dark'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('overrides only the labels it is given', async () => {
    renderInHostMenu({ labels: { dark: 'Dunkel' } });
    expect(await screen.findByText('Dunkel')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('sets the mode by value even when the label is translated', async () => {
    renderInHostMenu({ labels: { dark: 'Dunkel' } });
    await userEvent.click(await screen.findByText('Dunkel'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeMenuItems />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeMenuItems`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorSchemeMenuItems/types.ts`:

```ts
import type { JoyColor } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeMenuItemsProps {
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
  color?: JoyColor;
  /** Hides the per-entry icon, leaving text only. */
  icons?: boolean;
}
```

`packages/ui/src/components/ColorSchemeMenuItems/ColorSchemeMenuItems.tsx`:

```tsx
'use client';
import * as React from 'react';
import { MenuItem } from '../MenuItem';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import {
  COLOR_SCHEME_ICONS,
  COLOR_SCHEME_MODES,
  ICON_SIZE_CLASS,
  resolveColorSchemeLabels,
} from '../../internal/colorScheme';
import type { ColorSchemeMenuItemsProps } from './types';

/**
 * The three entries without a trigger or a popup, for applications that
 * already have a user menu or a drawer and do not want a second button beside
 * it. The enclosing `Menu` belongs to the caller.
 *
 * A fragment is safe here, and that is checked rather than assumed: `Menu`
 * hands `children` straight to `BaseMenu.Popup` without `React.Children.map`
 * or `cloneElement`. A host that clones its children — `ToggleButtonGroup`
 * does — would apply those clones to the fragment instead of the entries.
 */
export function ColorSchemeMenuItems({
  labels,
  color = 'neutral',
  icons = true,
}: ColorSchemeMenuItemsProps) {
  const { mode, setMode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);

  return (
    <>
      {COLOR_SCHEME_MODES.map((entry) => {
        const Icon = COLOR_SCHEME_ICONS[entry];
        return (
          <MenuItem
            key={entry}
            color={color}
            // `mode`, not `resolvedMode`: the tick belongs beside what the
            // user chose, so "System" stays ticked while it resolves to dark.
            selected={entry === mode}
            onClick={() => setMode(entry)}
          >
            {icons && <Icon className={`${ICON_SIZE_CLASS.sm} shrink-0`} />}
            {resolved[entry]}
          </MenuItem>
        );
      })}
    </>
  );
}
```

`packages/ui/src/components/ColorSchemeMenuItems/index.ts`:

```ts
export { ColorSchemeMenuItems } from './ColorSchemeMenuItems';
export type { ColorSchemeMenuItemsProps } from './types';
```

Append to `packages/ui/src/index.ts`:

```ts
export { ColorSchemeMenuItems } from './components/ColorSchemeMenuItems';
export type { ColorSchemeMenuItemsProps } from './components/ColorSchemeMenuItems';
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeMenuItems`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the visual test**

Create `packages/ui/src/visual/ColorSchemeMenuItems.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { Dropdown } from '../components/Dropdown';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { MenuItem } from '../components/MenuItem';
import { ColorSchemeMenuItems } from '../components/ColorSchemeMenuItems';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

function renderItems(scheme: 'light' | 'dark') {
  render(
    <ColorSchemeProvider defaultMode="light">
      <div data-color-scheme={scheme}>
        <Dropdown defaultOpen>
          <MenuButton>Account</MenuButton>
          <Menu>
            <ColorSchemeMenuItems />
          </Menu>
        </Dropdown>
      </div>
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeMenuItems visual', () => {
  it('gives the chosen entry the same selected background a plain selected MenuItem gets', async () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <Dropdown defaultOpen>
          <MenuButton>Account</MenuButton>
          <Menu>
            <ColorSchemeMenuItems />
          </Menu>
        </Dropdown>
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="light">
        <MenuItem data-testid="reference" selected>
          Light
        </MenuItem>
      </ColorSchemeProvider>,
    );
    await screen.findByText('Light');
    await settleTransitions();

    // defaultMode="light" means the Light entry is the chosen one.
    const chosen = [...document.querySelectorAll('[role="menuitem"]')].find(
      (item) => item.textContent === 'Light',
    ) as HTMLElement;

    expect(getComputedStyle(chosen).backgroundColor).toBe(
      getComputedStyle(page.getByTestId('reference').element()).backgroundColor,
    );
  });

  it('renders all three entries inside a host menu, light and dark', async () => {
    renderItems('light');
    await screen.findByText('System');
    await settleTransitions();
    await expect(page.getByRole('menu')).toMatchScreenshot('colorschememenuitems-light');
  });

  it('renders all three entries in dark mode', async () => {
    renderItems('dark');
    await screen.findByText('System');
    await settleTransitions();
    // The popup lives in a portal outside the wrapper div, so the dark
    // attribute has to reach it through the provider, not the local wrapper —
    // if this shot comes out light, that is the finding, not a flake.
    await expect(page.getByRole('menu')).toMatchScreenshot('colorschememenuitems-dark');
  });
});
```

**Note for the implementer:** the third test contains a real trap. `Menu` renders through `BaseMenu.Portal`, which mounts outside the `<div data-color-scheme>` wrapper, so a locally-scoped attribute will not reach it. If that screenshot comes out light, the fix is to render the whole thing under a `ColorSchemeProvider` whose resolved mode is dark (set `localStorage['hintoric-color-scheme'] = 'dark'` before rendering) instead of a wrapper div, and to note in `darkMode.tsx` that portalled content needs the provider rather than a wrapper. Fix it; do not delete the test.

- [ ] **Step 6: Run the visual test twice, then look at the PNGs**

Run: `pnpm --filter @hintoric/ui test:visual -- ColorSchemeMenuItems`
Expected: first run fails on the two screenshots, second run passes. Open both PNGs: three entries, one tick or highlight, icons present, and the dark one actually dark.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/ColorSchemeMenuItems packages/ui/src/visual/ColorSchemeMenuItems.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/index.ts
git commit -m "Add ColorSchemeMenuItems for hanging into an existing menu"
```

---

### Task 8: `ColorSchemeMenu`

**Files:**
- Create: `packages/ui/src/components/ColorSchemeMenu/ColorSchemeMenu.tsx`
- Create: `packages/ui/src/components/ColorSchemeMenu/types.ts`
- Create: `packages/ui/src/components/ColorSchemeMenu/index.ts`
- Test: `packages/ui/src/components/ColorSchemeMenu/ColorSchemeMenu.test.tsx`
- Test: `packages/ui/src/visual/ColorSchemeMenu.visual.test.tsx`
- Modify: `packages/ui/src/index.ts` (append)

**Interfaces:**
- Consumes: `useColorScheme`; `COLOR_SCHEME_ICONS`, `ICON_SIZE_CLASS`, `resolveColorSchemeLabels`, `ColorSchemeLabels` (Task 5); `ColorSchemeMenuItems` (Task 7); `Dropdown`, `MenuButton`, `Menu`.
- Produces: `ColorSchemeMenu`, `ColorSchemeMenuProps`.

- [ ] **Step 1: Write the failing unit test**

Create `packages/ui/src/components/ColorSchemeMenu/ColorSchemeMenu.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider } from '../../theme/ColorSchemeProvider';
import { ColorSchemeMenu } from './ColorSchemeMenu';

function renderMenu(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ColorSchemeMenu {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeMenu', () => {
  it('shows the current mode on the trigger', () => {
    renderMenu();
    expect(screen.getByRole('button')).toHaveTextContent('System');
  });

  it('lists all three modes when opened', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    // 'System' appears on the trigger as well as in the list.
    expect(screen.getAllByText('System')).toHaveLength(2);
  });

  it('changes the mode and updates the trigger', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(await screen.findByText('Dark'));

    expect(screen.getByRole('button')).toHaveTextContent('Dark');
  });

  it('applies translated labels to the trigger too', () => {
    renderMenu({ labels: { system: 'Automatisch' } });
    expect(screen.getByRole('button')).toHaveTextContent('Automatisch');
  });

  it('forwards unrecognised props to the trigger', () => {
    renderMenu({ 'data-testid': 'trigger', className: 'custom' });
    expect(screen.getByTestId('trigger')).toHaveClass('custom');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeMenu />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeMenu`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorSchemeMenu/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeMenuProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
}
```

`packages/ui/src/components/ColorSchemeMenu/ColorSchemeMenu.tsx`:

```tsx
'use client';
import * as React from 'react';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuButton } from '../MenuButton';
import { ColorSchemeMenuItems } from '../ColorSchemeMenuItems';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { COLOR_SCHEME_ICONS, ICON_SIZE_CLASS, resolveColorSchemeLabels } from '../../internal/colorScheme';
import type { ColorSchemeMenuProps } from './types';

/**
 * The recommended form for anything that does not have to be extremely
 * compact: a trigger showing the current mode, and three named entries behind
 * it. Named and directly reachable, where `ColorSchemeToggle` makes the user
 * click through unlabelled stops to find what they want.
 *
 * Built from Dropdown/MenuButton/Menu, exactly like LocaleSwitcher — the
 * trigger carries the icon *and* the label, because a discoverable form that
 * hides its current state behind a glyph gives up the thing it exists for.
 * For an icon-only control, use `ColorSchemeToggle`.
 */
export function ColorSchemeMenu({
  variant = 'outlined',
  color = 'neutral',
  size = 'sm',
  labels,
  ...buttonProps
}: ColorSchemeMenuProps) {
  const [open, setOpen] = React.useState(false);
  const { mode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);
  const Icon = COLOR_SCHEME_ICONS[mode];

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <MenuButton variant={variant} color={color} size={size} {...buttonProps}>
        <Icon className={`${ICON_SIZE_CLASS[size]} shrink-0`} />
        {resolved[mode]}
      </MenuButton>
      <Menu variant="outlined" color={color} size={size}>
        <ColorSchemeMenuItems labels={labels} color={color} />
      </Menu>
    </Dropdown>
  );
}
```

`packages/ui/src/components/ColorSchemeMenu/index.ts`:

```ts
export { ColorSchemeMenu } from './ColorSchemeMenu';
export type { ColorSchemeMenuProps } from './types';
```

Append to `packages/ui/src/index.ts`:

```ts
export { ColorSchemeMenu } from './components/ColorSchemeMenu';
export type { ColorSchemeMenuProps } from './components/ColorSchemeMenu';
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeMenu`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the visual test**

Create `packages/ui/src/visual/ColorSchemeMenu.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuButton as HintoricMenuButton } from '../components/MenuButton';
import { ColorSchemeMenu } from '../components/ColorSchemeMenu';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

describe('ColorSchemeMenu visual', () => {
  it.each(SIZES)('passes size %s through to the trigger', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid={`menu-${size}`} size={size} />
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="system">
        <HintoricMenuButton data-testid={`reference-${size}`} size={size}>
          System
        </HintoricMenuButton>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId(`menu-${size}`).element()).minHeight).toBe(
      getComputedStyle(page.getByTestId(`reference-${size}`).element()).minHeight,
    );
  });

  it('matches its own baseline closed', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid="menu" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    await expect(page.getByTestId('menu')).toMatchScreenshot('colorschememenu-closed');
  });

  it('matches its own baseline open, with the chosen entry marked', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid="menu" />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button'));
    await screen.findByText('Light');
    await settleTransitions();

    // The popup is portalled, so the trigger's own box does not contain it —
    // screenshotting the trigger would show a green test and no menu.
    await expect(page.getByRole('menu')).toMatchScreenshot('colorschememenu-open');
  });

  it('matches its own baseline in dark mode', async () => {
    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider>
        <ColorSchemeMenu data-testid="menu-dark" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    await expect(page.getByTestId('menu-dark')).toMatchScreenshot('colorschememenu-dark');
    window.localStorage.removeItem('hintoric-color-scheme');
  });
});
```

- [ ] **Step 6: Run it twice, then look at the PNGs**

Run: `pnpm --filter @hintoric/ui test:visual -- ColorSchemeMenu`
Expected: first run fails on the three screenshots, second passes. Check the open shot shows three named entries with the chosen one marked, and the dark shot has a dark trigger.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/ColorSchemeMenu packages/ui/src/visual/ColorSchemeMenu.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/index.ts
git commit -m "Add ColorSchemeMenu, the labelled dropdown form"
```

---

### Task 9: `ColorSchemeToggleGroup`

**Files:**
- Create: `packages/ui/src/components/ColorSchemeToggleGroup/ColorSchemeToggleGroup.tsx`
- Create: `packages/ui/src/components/ColorSchemeToggleGroup/types.ts`
- Create: `packages/ui/src/components/ColorSchemeToggleGroup/index.ts`
- Test: `packages/ui/src/components/ColorSchemeToggleGroup/ColorSchemeToggleGroup.test.tsx`
- Test: `packages/ui/src/visual/ColorSchemeToggleGroup.visual.test.tsx`
- Modify: `packages/ui/src/index.ts` (append)

**Interfaces:**
- Consumes: `useColorScheme`; `COLOR_SCHEME_MODES`, `COLOR_SCHEME_ICONS`, `ICON_SIZE_CLASS`, `resolveColorSchemeLabels`, `ColorSchemeLabels` (Task 5); `ToggleButtonGroup`, `Button`.
- Produces: `ColorSchemeToggleGroup`, `ColorSchemeToggleGroupProps`.

- [ ] **Step 1: Write the failing unit test**

Create `packages/ui/src/components/ColorSchemeToggleGroup/ColorSchemeToggleGroup.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { ColorSchemeToggleGroup } from './ColorSchemeToggleGroup';

function ModeProbe() {
  const { mode } = useColorScheme();
  return <span data-testid="mode">{mode}</span>;
}

function renderGroup(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ModeProbe />
      <ColorSchemeToggleGroup {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeToggleGroup', () => {
  it('renders one segment per mode', () => {
    renderGroup();
    expect(screen.getByRole('button', { name: /System/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Light/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dark/ })).toBeInTheDocument();
  });

  it('sets the mode to the segment that was clicked', async () => {
    renderGroup();
    await userEvent.click(screen.getByRole('button', { name: /Dark/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('does nothing when the already-active segment is clicked', async () => {
    renderGroup();
    // ToggleButtonGroup implements multi-select semantics, so a click on a
    // selected value deselects it and hands back an empty array. There is no
    // such thing as "no color scheme", so that has to be a no-op rather than
    // an undefined mode.
    await userEvent.click(screen.getByRole('button', { name: /System/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  it('keeps exactly one segment active after several clicks', async () => {
    renderGroup();
    await userEvent.click(screen.getByRole('button', { name: /Light/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    await userEvent.click(screen.getByRole('button', { name: /Dark/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    await userEvent.click(screen.getByRole('button', { name: /System/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  it('overrides only the labels it is given', () => {
    renderGroup({ labels: { dark: 'Dunkel' } });
    expect(screen.getByRole('button', { name: /Dunkel/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /System/ })).toBeInTheDocument();
  });

  it('forwards unrecognised props to the group', () => {
    renderGroup({ 'data-testid': 'group' });
    expect(screen.getByTestId('group')).toBeInTheDocument();
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeToggleGroup />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeToggleGroup`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorSchemeToggleGroup/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeToggleGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'onChange' | 'value' | 'defaultValue'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
  /** Hides the per-segment icon, leaving text only. */
  icons?: boolean;
}
```

`packages/ui/src/components/ColorSchemeToggleGroup/ColorSchemeToggleGroup.tsx`:

```tsx
'use client';
import * as React from 'react';
import { Button } from '../Button';
import { ToggleButtonGroup } from '../ToggleButtonGroup';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import type { ColorSchemeMode } from '../../theme/ColorSchemeProvider';
import {
  COLOR_SCHEME_ICONS,
  COLOR_SCHEME_MODES,
  ICON_SIZE_CLASS,
  resolveColorSchemeLabels,
} from '../../internal/colorScheme';
import type { ColorSchemeToggleGroupProps } from './types';

/**
 * All three states side by side, each one click away — the form for a
 * settings page rather than a header corner.
 *
 * `ToggleButtonGroup` deliberately implements only Joy's multi-select array
 * mode (see its own scope note), so this adapts it to single selection: the
 * value is a one-element array, and the handler takes the newly-added entry
 * out of what comes back. Clicking the active segment hands back an empty
 * array, which is ignored — "no color scheme" is not a state a user can be in.
 *
 * Adding a real exclusive mode to `ToggleButtonGroup` would be the tidier fix
 * and is deliberately out of scope: that component's look is compared against
 * Joy, and changing it belongs in its own piece of work.
 */
export function ColorSchemeToggleGroup({
  variant = 'outlined',
  color = 'neutral',
  size = 'sm',
  labels,
  icons = true,
  ...props
}: ColorSchemeToggleGroupProps) {
  const { mode, setMode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);

  return (
    <ToggleButtonGroup
      variant={variant}
      color={color}
      value={[mode]}
      onChange={(_event, next) => {
        const picked = (next as ColorSchemeMode[]).find((entry) => entry !== mode);
        if (picked) setMode(picked);
      }}
      {...props}
    >
      {COLOR_SCHEME_MODES.map((entry) => {
        const Icon = COLOR_SCHEME_ICONS[entry];
        return (
          <Button
            key={entry}
            value={entry}
            variant={variant}
            color={color}
            size={size}
            startDecorator={icons ? <Icon className={`${ICON_SIZE_CLASS.sm} shrink-0`} /> : undefined}
          >
            {resolved[entry]}
          </Button>
        );
      })}
    </ToggleButtonGroup>
  );
}
```

Note the children are returned as a flat array from `map`, not wrapped in a fragment: `ToggleButtonGroup` runs `React.Children.map` and `cloneElement` over them, and a fragment would receive the clones instead of the segments.

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeToggleGroup`
Expected: PASS, 7 tests.

- [ ] **Step 5: Write the visual test**

Create `packages/ui/src/visual/ColorSchemeToggleGroup.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeToggleGroup } from '../components/ColorSchemeToggleGroup';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

describe('ColorSchemeToggleGroup visual', () => {
  it('marks exactly one segment as active', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const segments = [...page.getByTestId('group').element().querySelectorAll('button')];
    const backgrounds = segments.map((segment) => getComputedStyle(segment).backgroundColor);
    const distinct = new Set(backgrounds);

    // Two values: the active segment's, and the one the other two share.
    expect(segments).toHaveLength(3);
    expect(distinct.size).toBe(2);
  });

  it('moves the active background when another segment is chosen', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    const before = getComputedStyle(
      page.getByTestId('group').element().querySelectorAll('button')[0],
    ).backgroundColor;

    await userEvent.click(screen.getByRole('button', { name: /Dark/ }));
    await settleTransitions();

    const after = getComputedStyle(
      page.getByTestId('group').element().querySelectorAll('button')[0],
    ).backgroundColor;
    expect(after).not.toBe(before);
  });

  it('matches its own baseline, light and dark', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group-light" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    await expect(page.getByTestId('group-light')).toMatchScreenshot('colorschemetogglegroup-light');

    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider>
        <ColorSchemeToggleGroup data-testid="group-dark" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    await expect(page.getByTestId('group-dark')).toMatchScreenshot('colorschemetogglegroup-dark');
    window.localStorage.removeItem('hintoric-color-scheme');
  });
});
```

- [ ] **Step 6: Run it twice, then look at the PNGs**

Run: `pnpm --filter @hintoric/ui test:visual -- ColorSchemeToggleGroup`
Expected: first run fails on the two screenshots, second passes. Check three joined segments with one visibly active, and that the dark shot's inactive segments are still readable.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/ColorSchemeToggleGroup packages/ui/src/visual/ColorSchemeToggleGroup.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/index.ts
git commit -m "Add ColorSchemeToggleGroup, the segmented form"
```

---

### Task 10: `ColorSchemeSwitch`

**Files:**
- Create: `packages/ui/src/components/ColorSchemeSwitch/ColorSchemeSwitch.tsx`
- Create: `packages/ui/src/components/ColorSchemeSwitch/types.ts`
- Create: `packages/ui/src/components/ColorSchemeSwitch/index.ts`
- Test: `packages/ui/src/components/ColorSchemeSwitch/ColorSchemeSwitch.test.tsx`
- Test: `packages/ui/src/visual/ColorSchemeSwitch.visual.test.tsx`
- Modify: `packages/ui/src/index.ts` (append)

**Interfaces:**
- Consumes: `useColorScheme`; `LightModeIcon`, `DarkModeIcon`, `ICON_SIZE_CLASS` (Task 5); `Switch`.
- Produces: `ColorSchemeSwitch`, `ColorSchemeSwitchProps`.

- [ ] **Step 1: Write the failing unit test**

Create `packages/ui/src/components/ColorSchemeSwitch/ColorSchemeSwitch.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { setSystemDark } from '../../test/setup';
import { ColorSchemeSwitch } from './ColorSchemeSwitch';

function ModeProbe() {
  const { mode, resolvedMode } = useColorScheme();
  return (
    <>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
    </>
  );
}

function renderSwitch(props: Record<string, unknown> = {}, defaultMode: 'system' | 'light' | 'dark' = 'system') {
  return render(
    <ColorSchemeProvider defaultMode={defaultMode}>
      <ModeProbe />
      <ColorSchemeSwitch {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeSwitch', () => {
  it('is unchecked while the resolved scheme is light', () => {
    renderSwitch();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('is checked while the resolved scheme is dark, even in system mode', () => {
    setSystemDark(true);
    renderSwitch();
    // It mirrors what is on screen, not the raw choice — a switch showing
    // "off" on a dark screen would be plainly wrong.
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('leaves system for a fixed mode when toggled', async () => {
    renderSwitch();
    await userEvent.click(screen.getByRole('switch'));

    // The user made a decision; quietly continuing to follow the OS would be
    // the more surprising outcome. A switch has two positions, so there is no
    // way back to system from here — that is what the three-state forms are for.
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('toggles back to light', async () => {
    renderSwitch({}, 'dark');
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('labels the effect of a click', () => {
    renderSwitch();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('lets a caller override the label', () => {
    renderSwitch({ 'aria-label': 'Dunkelmodus' });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Dunkelmodus');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeSwitch />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeSwitch`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorSchemeSwitch/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor } from '../../utils/colorVariantClasses';

export interface ColorSchemeSwitchProps
  extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color' | 'onChange'> {
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Hides the sun and moon decorators either side of the track. */
  icons?: boolean;
}
```

`packages/ui/src/components/ColorSchemeSwitch/ColorSchemeSwitch.tsx`:

```tsx
'use client';
import * as React from 'react';
import { Switch } from '../Switch';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { ICON_SIZE_CLASS } from '../../internal/colorScheme';
import { DarkModeIcon } from '../../internal/svg-icons/DarkModeIcon';
import { LightModeIcon } from '../../internal/svg-icons/LightModeIcon';
import type { ColorSchemeSwitchProps } from './types';

/**
 * The two-position form, for a settings row reading "Dark mode: [off]".
 *
 * It cannot represent `system`, and that is the shape rather than a gap: a
 * switch has two positions. The behaviour at the third state is decided
 * rather than accidental —
 *
 * - `checked` mirrors `resolvedMode`, so in `system` the switch shows what is
 *   actually on screen.
 * - Toggling writes a fixed mode and leaves `system` for good. The user made a
 *   decision; honouring it and then quietly continuing to follow the OS would
 *   be the more surprising behaviour.
 * - There is no hidden way back (no long press, no double click). Callers who
 *   need `system` reachable use one of the three-state forms.
 */
export function ColorSchemeSwitch({
  color,
  size = 'md',
  icons = true,
  ...props
}: ColorSchemeSwitchProps) {
  const { resolvedMode, setMode } = useColorScheme();
  const isDark = resolvedMode === 'dark';

  return (
    <Switch
      color={color}
      size={size}
      checked={isDark}
      onCheckedChange={(next) => setMode(next ? 'dark' : 'light')}
      startDecorator={icons ? <LightModeIcon className={`${ICON_SIZE_CLASS.sm} shrink-0`} /> : undefined}
      endDecorator={icons ? <DarkModeIcon className={`${ICON_SIZE_CLASS.sm} shrink-0`} /> : undefined}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeSwitch`
Expected: PASS, 7 tests.

If `aria-label` does not land on the element with `role="switch"`, `Switch` is spreading `...props` onto `BaseSwitch.Root` while the role sits elsewhere — check `Switch.tsx` and put the label where the role is, rather than changing the assertion.

- [ ] **Step 5: Write the visual test**

Create `packages/ui/src/visual/ColorSchemeSwitch.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Switch as HintoricSwitch } from '../components/Switch';
import { ColorSchemeSwitch } from '../components/ColorSchemeSwitch';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

describe('ColorSchemeSwitch visual', () => {
  it.each(SIZES)('passes size %s through to the track', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <div data-testid={`ours-${size}`}>
          <ColorSchemeSwitch size={size} />
        </div>
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="light">
        <div data-testid={`reference-${size}`}>
          <HintoricSwitch size={size} />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const ours = page.getByTestId(`ours-${size}`).element().querySelector('[role="switch"]');
    const reference = page.getByTestId(`reference-${size}`).element().querySelector('[role="switch"]');

    expect(getComputedStyle(ours as Element).width).toBe(getComputedStyle(reference as Element).width);
  });

  it('shows the checked track colour when the resolved scheme is dark', async () => {
    window.localStorage.setItem('hintoric-color-scheme', 'light');
    render(
      <ColorSchemeProvider>
        <div data-testid="off">
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider>
        <div data-testid="on">
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const off = page.getByTestId('off').element().querySelector('[role="switch"]');
    const on = page.getByTestId('on').element().querySelector('[role="switch"]');

    expect(getComputedStyle(on as Element).backgroundColor).not.toBe(
      getComputedStyle(off as Element).backgroundColor,
    );
    window.localStorage.removeItem('hintoric-color-scheme');
  });

  it('matches its own baseline, light and dark', async () => {
    window.localStorage.setItem('hintoric-color-scheme', 'light');
    render(
      <ColorSchemeProvider>
        <div data-testid="switch-light" style={{ padding: 8 }}>
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    await expect(page.getByTestId('switch-light')).toMatchScreenshot('colorschemeswitch-light');

    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider>
        <div data-testid="switch-dark" style={{ padding: 8 }}>
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    await expect(page.getByTestId('switch-dark')).toMatchScreenshot('colorschemeswitch-dark');
    window.localStorage.removeItem('hintoric-color-scheme');
  });
});
```

- [ ] **Step 6: Run it twice, then look at the PNGs**

Run: `pnpm --filter @hintoric/ui test:visual -- ColorSchemeSwitch`
Expected: first run fails on the two screenshots, second passes. Check that the sun sits left of the track and the moon right, and that the thumb is on the right in the dark shot.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/ColorSchemeSwitch packages/ui/src/visual/ColorSchemeSwitch.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/index.ts
git commit -m "Add ColorSchemeSwitch, the two-position form"
```

---

### Task 11: `ColorSchemeSelect`

**Files:**
- Create: `packages/ui/src/components/ColorSchemeSelect/ColorSchemeSelect.tsx`
- Create: `packages/ui/src/components/ColorSchemeSelect/types.ts`
- Create: `packages/ui/src/components/ColorSchemeSelect/index.ts`
- Test: `packages/ui/src/components/ColorSchemeSelect/ColorSchemeSelect.test.tsx`
- Test: `packages/ui/src/visual/ColorSchemeSelect.visual.test.tsx`
- Modify: `packages/ui/src/index.ts` (append)

**Interfaces:**
- Consumes: `useColorScheme`; `COLOR_SCHEME_MODES`, `resolveColorSchemeLabels`, `ColorSchemeLabels` (Task 5); `Select`, `Option`.
- Produces: `ColorSchemeSelect`, `ColorSchemeSelectProps`.

- [ ] **Step 1: Write the failing unit test**

Create `packages/ui/src/components/ColorSchemeSelect/ColorSchemeSelect.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { ColorSchemeSelect } from './ColorSchemeSelect';

function ModeProbe() {
  const { mode } = useColorScheme();
  return <span data-testid="mode">{mode}</span>;
}

function renderSelect(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ModeProbe />
      <ColorSchemeSelect {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeSelect', () => {
  it('shows the current mode on the trigger', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveTextContent('System');
  });

  it('offers all three modes when opened', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));

    expect(await screen.findByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
  });

  it('sets the mode to the chosen option', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Dark' }));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('sets the mode by value even when the label is translated', async () => {
    renderSelect({ labels: { dark: 'Dunkel' } });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Dunkel' }));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('forwards unrecognised props to the trigger', () => {
    renderSelect({ 'data-testid': 'select' });
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeSelect />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeSelect`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorSchemeSelect/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeSelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<'button'>,
    'color' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
}
```

`packages/ui/src/components/ColorSchemeSelect/ColorSchemeSelect.tsx`:

```tsx
'use client';
import * as React from 'react';
import { Select } from '../Select';
import { Option } from '../Option';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import type { ColorSchemeMode } from '../../theme/ColorSchemeProvider';
import { COLOR_SCHEME_MODES, resolveColorSchemeLabels } from '../../internal/colorScheme';
import type { ColorSchemeSelectProps } from './types';

/**
 * The form-control form, for a settings page that already has select fields
 * beside it and where a segmented control would look out of place.
 *
 * No icons in the options: Select renders its chosen option's content into the
 * trigger, and a glyph there duplicates what the label already says. The
 * three-state forms that do show icons are the ones without a value display.
 */
export function ColorSchemeSelect({
  variant = 'outlined',
  color = 'neutral',
  size = 'md',
  labels,
  ...props
}: ColorSchemeSelectProps) {
  const { mode, setMode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);

  return (
    <Select
      variant={variant}
      color={color}
      size={size}
      value={mode}
      onChange={(value) => {
        // Select types its value as nullable; there is no "no color scheme",
        // so a null clear is ignored rather than crashing the provider.
        if (value) setMode(value as ColorSchemeMode);
      }}
      {...props}
    >
      {COLOR_SCHEME_MODES.map((entry) => (
        <Option key={entry} value={entry}>
          {resolved[entry]}
        </Option>
      ))}
    </Select>
  );
}
```

`packages/ui/src/components/ColorSchemeSelect/index.ts`:

```ts
export { ColorSchemeSelect } from './ColorSchemeSelect';
export type { ColorSchemeSelectProps } from './types';
```

Append to `packages/ui/src/index.ts`:

```ts
export { ColorSchemeSelect } from './components/ColorSchemeSelect';
export type { ColorSchemeSelectProps } from './components/ColorSchemeSelect';
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeSelect`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the visual test**

Create `packages/ui/src/visual/ColorSchemeSelect.visual.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select as HintoricSelect } from '../components/Select';
import { Option } from '../components/Option';
import { ColorSchemeSelect } from '../components/ColorSchemeSelect';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

describe('ColorSchemeSelect visual', () => {
  it.each(SIZES)('passes size %s through to the trigger', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid={`ours-${size}`} style={{ width: 240 }}>
          <ColorSchemeSelect size={size} />
        </div>
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid={`reference-${size}`} style={{ width: 240 }}>
          <HintoricSelect size={size} value="system">
            <Option value="system">System</Option>
          </HintoricSelect>
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const ours = page.getByTestId(`ours-${size}`).element().querySelector('[role="combobox"]');
    const reference = page
      .getByTestId(`reference-${size}`)
      .element()
      .querySelector('[role="combobox"]');

    expect(getComputedStyle(ours as Element).minHeight).toBe(
      getComputedStyle(reference as Element).minHeight,
    );
  });

  it('fills the width of its container, like Select itself', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid="wrapper" style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    // Select's own regression: an inline-flex root shrank to its content
    // instead of filling the form. A wrapper form control must not undo that.
    const trigger = page.getByTestId('wrapper').element().querySelector('[role="combobox"]');
    expect(getComputedStyle(trigger as Element).width).toBe('240px');
  });

  it('matches its own baseline closed and open', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid="select" style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    await expect(page.getByTestId('select')).toMatchScreenshot('colorschemeselect-closed');

    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('option', { name: 'Light' });
    await settleTransitions();
    await expect(page.getByRole('listbox')).toMatchScreenshot('colorschemeselect-open');
  });

  it('matches its own baseline in dark mode', async () => {
    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider>
        <div data-testid="select-dark" style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    await expect(page.getByTestId('select-dark')).toMatchScreenshot('colorschemeselect-dark');
    window.localStorage.removeItem('hintoric-color-scheme');
  });
});
```

**Note for the implementer:** `Select`'s listbox is a two-layer portal (an outer positioner wrapping an inner popup surface) — `page.getByRole('listbox')` may resolve to either. If the open baseline comes out as an empty box, target the inner surface instead; `packages/ui/src/visual/Select.visual.test.tsx` already solved this and shows how.

- [ ] **Step 6: Run it twice, then look at the PNGs**

Run: `pnpm --filter @hintoric/ui test:visual -- ColorSchemeSelect`
Expected: first run fails on the three screenshots, second passes. Check the open shot lists all three modes and the dark shot's popup is on the dark surface.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/ColorSchemeSelect packages/ui/src/visual/ColorSchemeSelect.visual.test.tsx packages/ui/src/visual/__screenshots__ packages/ui/src/index.ts
git commit -m "Add ColorSchemeSelect, the form-control form"
```

---

### Task 12: Guard the public surface

`packages/ui/src/index.test.ts` already exists and asserts the package's exports. Six new components and one new type have to appear there, otherwise a build that drops one of them passes.

**Files:**
- Modify: `packages/ui/src/index.test.ts`

**Interfaces:**
- Consumes: every export from Tasks 3 and 6–11.
- Produces: nothing.

- [ ] **Step 1: Read the existing file and follow its shape**

Run: `sed -n 1,60p packages/ui/src/index.test.ts`

Match whatever assertion style is already there (a list of expected names, or per-export `expect(…).toBeDefined()`); do not introduce a second style beside it.

- [ ] **Step 2: Add the failing assertions**

Add `ColorSchemeToggle`, `ColorSchemeMenu`, `ColorSchemeMenuItems`, `ColorSchemeToggleGroup`, `ColorSchemeSwitch` and `ColorSchemeSelect` to whatever list or set the file checks.

- [ ] **Step 3: Run it**

Run: `pnpm --filter @hintoric/ui test -- index`
Expected: PASS, since Tasks 6–11 already added the exports. If it fails, an export line was missed — add it to `packages/ui/src/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/index.test.ts
git commit -m "Assert the six color scheme forms are exported"
```

---

## Phase 3 — Documentation and migration

### Task 13: Retire the hand-rolled switchers in the apps

Both apps in this repo already reimplement the component, incompletely. Replacing them is what proves the library version works, and it makes the documentation site itself switchable — after which a wrong dark token shows up across ~70 pages instead of hiding in one test.

**Files:**
- Modify: `apps/docs/src/Layout.tsx:1-68`
- Modify: `apps/playground/src/App.tsx:41-48`
- Modify: `apps/docs/src/styles.css:102-110` (comment only)

**Interfaces:**
- Consumes: `ColorSchemeMenu`, `useColorScheme` (with `resolvedMode`).
- Produces: nothing.

- [ ] **Step 1: Build the library so the apps see the new exports**

Run (from the repo root): `pnpm --filter @hintoric/ui build`
Expected: success. The apps import from the built `dist/`, so a stale build makes the next step fail confusingly.

- [ ] **Step 2: Replace the docs switcher**

In `apps/docs/src/Layout.tsx`: delete the local `SunIcon` and `MoonIcon` functions entirely, change the import to

```tsx
import { ColorSchemeMenu, useColorScheme } from '@hintoric/ui';
```

replace the whole `<IconButton>…</IconButton>` block in `.docs-topbar` with

```tsx
<ColorSchemeMenu />
```

and fix the logo line — this is the bug the new mode introduces if it is missed:

```tsx
const { resolvedMode } = useColorScheme();
// …
src={`https://cdn.hintoric.com/assets/logo/ui/${resolvedMode === 'dark' ? 'white' : 'black'}.svg`}
```

`mode` would now be `'system'` for a first-time visitor, so the old expression served the black logo on a dark background.

- [ ] **Step 3: Replace the playground switcher**

In `apps/playground/src/App.tsx`, replace the hand-rolled button (lines 41–48) with `<ColorSchemeMenu />` and drop `useColorScheme` from the import if nothing else in the file uses it.

- [ ] **Step 4: Refresh the stale comment in the docs stylesheet**

The comment at `apps/docs/src/styles.css:102-110` explains that the attribute lands on a `div` inside `body`. That is still true, but it now carries the *resolved* scheme. Add one sentence saying so, so the next reader does not go looking for a `system` value in CSS.

- [ ] **Step 5: Verify in a real browser**

Start the docs dev server through the preview tooling (never `pnpm dev` in a shell), then:

1. Confirm the topbar shows a labelled switcher reading "System".
2. Open it, choose Dark. The page must go dark and the sidebar logo must turn white.
3. Choose System again. The page must return to whatever the OS reports.
4. Reload. The choice must survive.
5. Read the browser console. Expected: no errors, and specifically no hydration or `matchMedia` warnings.

Take a screenshot of the dark documentation site and share it — that image is the actual deliverable of this task.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/Layout.tsx apps/playground/src/App.tsx apps/docs/src/styles.css
git commit -m "Replace both apps' hand-rolled switchers with ColorSchemeMenu"
```

---

### Task 14: Document all six forms

**Files:**
- Create: `apps/docs/src/pages/ColorSchemeTogglePage.tsx`
- Create: `apps/docs/src/pages/ColorSchemeMenuPage.tsx`
- Create: `apps/docs/src/pages/ColorSchemeToggleGroupPage.tsx`
- Create: `apps/docs/src/pages/ColorSchemeSwitchPage.tsx`
- Create: `apps/docs/src/pages/ColorSchemeSelectPage.tsx`
- Modify: `apps/docs/src/pages/ColorSchemeProviderPage.tsx`
- Modify: `apps/docs/src/pages/GettingStarted.tsx`
- Modify: `apps/docs/src/pages/RoadmapPage.tsx:27`
- Modify: `apps/docs/src/nav.ts:97`
- Modify: `apps/docs/src/App.tsx`

**Interfaces:**
- Consumes: all six components.
- Produces: nothing.

- [ ] **Step 1: Read an existing page and copy its shape**

Run: `cat apps/docs/src/pages/ColorSchemeProviderPage.tsx apps/docs/src/pages/LocaleSwitcherPage.tsx`

Use the same heading levels, the same `<Code>` component and the same live-demo layout. Do not invent a new page structure.

- [ ] **Step 2: Write the five new pages**

Each page needs: a one-line statement of which placement the form is for, a live instance the reader can actually click, a `<Code>` block with the import and minimal usage, and a props table matching the component's `types.ts` exactly (including defaults).

`ColorSchemeMenuItems` gets no page of its own — document it as a section on `ColorSchemeMenuPage` ("hanging the entries in your own menu"), because it only makes sense with a host menu around it and a page showing it bare would be misleading.

For every page, state the fact readers will otherwise get wrong: **the icon and the marked entry follow `mode`, not `resolvedMode`** — "System" stays selected while the screen is dark.

On `ColorSchemeSwitchPage`, say plainly that this form cannot reach `system` and that toggling leaves it permanently, and point at the three-state forms.

- [ ] **Step 3: Update the provider page**

In `ColorSchemeProviderPage.tsx`, document `system`, `resolvedMode`, the new `defaultMode` default, the storage-then-default resolution order, why `'system'` is written rather than the key cleared, and cross-tab adoption. Include the migration note in the words a consumer needs:

> `mode` is what the user chose and can be `'system'`. Use `resolvedMode` wherever you previously compared `mode` against `'dark'`.

- [ ] **Step 4: Document the Tailwind variant**

In `GettingStarted.tsx`, add a short section: consumers writing their own `dark:` classes get them from `@hintoric/ui/styles.css`, already pointed at `data-color-scheme`, so `dark:` follows the switcher rather than the OS.

- [ ] **Step 5: Wire routes, nav and roadmap**

Add five routes in `App.tsx` beside the existing `/color-scheme-provider` one, five links in the `nav.ts` group that currently holds only `ColorSchemeProvider`, and six `{ name: …, done: true }` entries in `RoadmapPage.tsx`.

- [ ] **Step 6: Click through every page in the browser**

With the docs dev server running, open each of the five new pages plus the provider page and Getting Started. On each: the live demo actually switches the site's scheme, no console errors, no horizontal overflow. Then switch the site to dark and walk the same pages again — a page that is unreadable in dark mode is a finding, not a cosmetic detail.

- [ ] **Step 7: Commit**

```bash
git add apps/docs/src/pages apps/docs/src/nav.ts apps/docs/src/App.tsx
git commit -m "Document the six color scheme forms and the provider's system mode"
```

---

### Task 15: Changeset and full verification

**Files:**
- Create: `.changeset/color-scheme-switcher.md`

**Interfaces:**
- Consumes: everything.
- Produces: the release note.

- [ ] **Step 1: Write the changeset**

Create `.changeset/color-scheme-switcher.md`:

```markdown
---
'@hintoric/ui': minor
---

Add six color scheme switcher forms — `ColorSchemeToggle`, `ColorSchemeMenu`, `ColorSchemeMenuItems`, `ColorSchemeToggleGroup`, `ColorSchemeSwitch` and `ColorSchemeSelect` — and a `system` mode in `ColorSchemeProvider`.

`ColorSchemeProvider` now follows the operating system's preference by default and keeps following it live. Two migration notes:

- **`defaultMode` now defaults to `'system'`, not `'light'`.** Pass `defaultMode="light"` for the previous behaviour.
- **`mode` can now be `'system'`.** It is the user's choice, not the applied scheme. Use the new `resolvedMode` (`'light' | 'dark'`) wherever you compared `mode` against `'dark'` — for example when picking a logo or an illustration. Existing code still compiles, which is why this is worth checking by hand.

Tailwind's `dark:` variant shipped in `@hintoric/ui/styles.css` now keys off `data-color-scheme` instead of `prefers-color-scheme`, so `dark:` classes in your own markup follow the switcher.
```

- [ ] **Step 2: Run the whole jsdom suite**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS, no skips.

- [ ] **Step 3: Run the whole visual suite**

Run: `pnpm --filter @hintoric/ui test:visual`
Expected: PASS. Note the total count — Task 2's token verification may have changed baselines beyond the new components, and a failure here is a real regression, not a stale baseline to overwrite. Never delete a baseline to make a test pass without looking at both images first.

- [ ] **Step 4: Typecheck, lint, build**

Run from the repo root, in order:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all three pass. `typecheck` builds the library first because the playground depends on the built `dist/`.

- [ ] **Step 5: Review every new screenshot**

Run: `git status --short packages/ui/src/visual/__screenshots__`

Open every PNG the branch added or changed and look at it. This is the step the whole visual convention exists for, and it is the one most easily skipped. Specifically confirm: the right glyph per mode, one active segment per group, legible dark surfaces, and no clipped popup.

- [ ] **Step 6: Report honestly, then commit**

State what passed and what did not, with the actual command output. If any check failed, say so rather than reporting completion. Do not push — the user asked for local `main` only.

```bash
git add .changeset/color-scheme-switcher.md
git commit -m "Add a changeset for the color scheme switcher family"
```

---

## Self-Review

**Spec coverage.** Every section of the spec maps to a task: the provider's `system` mode and storage rules → Task 3; the Tailwind variant → Task 4; the six forms → Tasks 6–11 (with `ColorSchemeMenuItems`' fragment safety in Task 7 and the `ToggleButtonGroup` adapter in Task 9); the shared core and icons → Task 5; the visual-coverage argument and the dark-mode gap → Tasks 1, 2 and the per-form visual tests; the labels and accessibility rules → Tasks 5–11; documentation and dogfooding → Tasks 13–14; acceptance → Task 15. The spec's "what stays out" list is honoured by omission: no SSR script, no exclusive mode for `ToggleButtonGroup`, no shipped translations, no dark coverage for the other ~57 components.

**Two deliberate additions beyond the spec.** `Button` joined Task 2's dark parity table (`ColorSchemeToggleGroup` is built from `Button` segments, so its dark tokens matter as much as the other five), and Task 12 guards the public export surface (`src/index.test.ts` already exists for that purpose, and six new exports that no test names would be silently droppable).

**Naming consistency.** `resolvedMode`, `COLOR_SCHEME_MODES`, `nextColorSchemeMode`, `resolveColorSchemeLabels`, `COLOR_SCHEME_ICONS`, `ICON_SIZE_CLASS`, `ColorSchemeLabels` and the six component names are used identically in every task that references them. The `icons?: boolean` prop appears on `ColorSchemeMenuItems`, `ColorSchemeToggleGroup` and `ColorSchemeSwitch` with the same meaning, and deliberately not on `ColorSchemeSelect` (whose trigger echoes the option) or `ColorSchemeToggle` (which is nothing but an icon).

**Known unknowns, each with a named resolution step rather than an assumption.** How Joy activates dark mode in a browser test (Task 1, Step 4 gives the fallback and where to read it). Whether `ICON_SIZE_CLASS` matches Joy's `--Icon-fontSize` (Task 6, Step 5 asserts it and says which side to correct). Whether portalled popups inherit a wrapper's `data-color-scheme` (Task 7, Step 5's note). Which node `getByRole('listbox')` resolves to for `Select` (Task 11, Step 5's note). Whether `Switch` puts `aria-label` on the element carrying `role="switch"` (Task 10, Step 4).
