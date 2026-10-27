# KLM-inspired look Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Joy look of `@hintoric/ui` and `@hintoric/email` with the agreed KLM-inspired look: rounder, flatter, 1.5px outlines, warm neutrals and re-tuned status colours in light, today's colours in dark. The visual suite keeps real `@mui/joy` as its oracle, now configured with the same tokens.

**Architecture:** One TypeScript module (`packages/ui/src/styles/palette.ts`) records every new value, and a committed script derives those values reproducibly from KLM's v47 stops. `theme.css` implements them, and a jsdom test parses `theme.css` and checks it against `palette.ts`, including a WCAG contrast check. A shared Joy theme (`packages/ui/src/visual/joyTheme.ts`) is built from the same `palette.ts` and passed to every `JoyCssVarsProvider` in the visual suite. After that, the existing parity tests drive the component fixes. `@hintoric/email` follows through its own `tokens.ts` and its parity suite against the built `@hintoric/ui`.

**Tech Stack:** Tailwind CSS v4.3 (`@theme`, `--default-border-width`), React 19, Base UI, `@mui/joy` 5.0.0-beta.52 (`extendTheme`), Vitest 4 (jsdom unit suite and Playwright/Chromium browser suite), react-email, Changesets, Node 24 (runs `.ts` scripts directly).

**Spec:** `docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md`. Read it before starting any task.

## Global Constraints

- Radius scale: `--radius-xs` 4px, `--radius-sm` 12px, `--radius-md` 16px, `--radius-lg` 24px, `--radius-xl` 32px.
- Component outlines are 1.5px (`--default-border-width: 1.5px`). Dividers, table rules and the focus ring keep today's thickness.
- `--shadow-xs: none` in light **and** dark. `--shadow-md` and `--shadow-lg` keep today's exact values in both schemes.
- Light neutral stops: 50 `#FBF7F3`, 100 `#F5F1ED`, 200 `#EBE2DB`, 300 `#D4CCC6`, 400 `#AAA49E`, 500 `#6E6966`, 600 `#605C5A`, 700 `#393735`, 800 `#1A1918`, 900 `#0D0C0C`.
- Light status stops 50–300 are KLM's exactly (danger ← red, success ← green, warning ← orange, listed in the spec). 400–900 keep KLM's OKLCH hue and chroma, with the lightness lowered only as far as contrast requires (Task 1).
- Light neutral fills move one stop darker: `neutral-soft-bg` 200, `neutral-soft-hover-bg` 300, `neutral-soft-active-bg` 400, `neutral-plain-hover-bg` 200, `neutral-plain-active-bg` 300, `neutral-outlined-hover-bg` 200, `neutral-outlined-active-bg` 300. `*-solid-disabled-bg` moves to neutral-200 for all five colours. Text tokens don't move, `*-soft-disabled-bg` stays neutral-50, and dark doesn't move.
- Light surfaces: `--color-canvas` → neutral-100, `--color-surface` and `--color-surface-popup` → white, `--color-surface-1/2/3` → neutral-200/300/400, `--color-divider` → `rgba(110, 105, 102, 0.2)` (the new neutral-500 channel at Joy's 0.2).
- Dark scheme: every colour value is today's Joy value. The dark block redeclares the raw neutral, danger, success and warning stops.
- Primary palette, typography and public token names are unchanged. No new props.
- Card: `rounded-lg` (24px). In light, an outlined-neutral Card (the default) has a transparent border of unchanged width. In dark it keeps `neutral-outlined-border`.
- Contrast: every light text/background pair the variant formula produces is ≥ 4.5:1. The one exception is primary `plain`/`outlined` text on its `active-bg`, which already sits at 3.85:1 under Joy and whose tokens don't change. The test asserts those two stay at 3.85 (`toBeCloseTo(3.85, 2)`) rather than ≥ 4.5. *(Plan-level call: the spec keeps primary unchanged and requires AA for all pairs; only these two pairs fail both at once. Task 1 records it in the spec.)*
- Nothing KLM-branded: no KLM blue, no Universal Sans, no KLM imagery.
- Changesets: `major` for `@hintoric/ui` and `@hintoric/email`. Nothing is merged or published before the user has reviewed the branch locally.
- Repo rules from `CLAUDE.md` still apply:
  - Filter visual runs as `pnpm test:visual Button`, never after `--`.
  - Every screenshot gets an explicit id ending in `-light`/`-dark`.
  - Set the scheme with `setColorScheme()`.
  - A test with two screenshots needs three runs to create its baselines.

## Review Focus

1. **Consumer page without `bg-canvas`.** On a white `body`, a borderless light Card disappears. Expected: canvas and surface are different colours, and the release notes say to add `bg-canvas`. Pinned in Task 2 (`theme.test.ts`: canvas ≠ surface) and Task 10 (changeset text).
2. **Dark scheme set on an inner element** (a consumer's `[data-color-scheme="dark"]` wrapper, or the `dark:` custom variant). A token missing from the dark block inherits its already-resolved warm light value. Expected: nothing warm inside a dark subtree. Pinned in Task 2: every light `--color-*` token whose value references a raw neutral/danger/success/warning stop is also declared in the dark block.
3. **Neutral controls placed straight on the canvas** (soft Chip/Avatar/Alert, plain IconButton/Tab hover, disabled solid Button). Expected: a visible fill or hover. Pinned in Task 2: no neutral fill token and no `*-solid-disabled-bg` resolves to the canvas colour.
4. **Dark Card.** Expected: a visible outline, because a borderless dark Card sits at about 1.08:1 against the black canvas. Pinned in Task 5 (dark `borderColor` is `neutral-outlined-border`, not transparent).
5. **Email in a dark-mode client.** Expected: today's dark colours, with no warm stop leaking through `variantTokens('dark', …)`. Pinned in Task 8 (`tokens.test.ts`).

---

### Task 1: Workspace and reproducible palette derivation

**Files:**
- Create: `packages/ui/scripts/palette/color.ts`
- Create: `packages/ui/scripts/palette/deriveKlmPalette.ts`
- Create: `packages/ui/src/styles/palette.ts`
- Test: `packages/ui/scripts/palette/deriveKlmPalette.test.ts`
- Modify: `docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md` (record derived values)

**Interfaces:**
- Produces, in `color.ts`:
  - `hexToOklch(hex: string): { l: number; c: number; h: number }`
  - `oklchToHex(o: { l: number; c: number; h: number }): string` returns uppercase `#RRGGBB`. When the colour is out of sRGB gamut, lower chroma until it fits; never clip channels.
  - `contrastRatio(a: string, b: string): number` (WCAG 2.x)
- Produces, in `palette.ts`:
  - `type Stop = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900`
  - `type PaletteColor = 'primary' | 'neutral' | 'danger' | 'success' | 'warning'`
  - `joyPalette: Record<PaletteColor, Record<Stop, string>>`: today's `theme.css` raw stops, lines 3–52, uppercase hex
  - `lightPalette: Record<PaletteColor, Record<Stop, string>>`: `primary` is `joyPalette.primary`, the others are derived literals
  - `radius = { xs: '4px', sm: '12px', md: '16px', lg: '24px', xl: '32px' } as const`
  - `outlineWidth = '1.5px'`
- Produces, in `deriveKlmPalette.ts`:
  - `KLM_V47: Record<'neutral' | 'red' | 'green' | 'orange', Record<Stop | 950, string>>` (values from the spec; neutral 950 is `#161514`)
  - `deriveNeutral(): Record<Stop, string>`
  - `deriveStatus(source: Record<Stop, string>): Record<Stop, string>`
  - `statusPairs(p: Record<Stop, string>): Array<{ label: string; text: string; bg: string }>`
  - `deriveLightPalette(): Record<Exclude<PaletteColor, 'primary'>, Record<Stop, string>>`
  - Run as a script, it prints `lightPalette` as a TS literal plus a markdown contrast table.

- [ ] **Step 1: Install and confirm a green starting point**

  The worktree has no `node_modules`. From the worktree root:

  ```bash
  pnpm install && pnpm --filter @hintoric/ui build && pnpm --filter @hintoric/ui test
  ```

  Expected: the install succeeds and the unit suite passes. If it doesn't, stop and report; don't start on a red suite.

- [ ] **Step 2: Write the failing test** (`deriveKlmPalette.test.ts`)

  ```ts
  it('derives the neutral scale pinned in the spec', () => {
    expect(deriveNeutral()).toEqual({ 50: '#FBF7F3', 100: '#F5F1ED', 200: '#EBE2DB', 300: '#D4CCC6',
      400: '#AAA49E', 500: '#6E6966', 600: '#605C5A', 700: '#393735', 800: '#1A1918', 900: '#0D0C0C' });
  });
  it.each([['danger', 'red'], ['success', 'green'], ['warning', 'orange']] as const)(
    '%s keeps KLM fills, darkens text stops only as far as contrast needs', (color, klm) => {
      const p = deriveLightPalette()[color];
      for (const s of [50, 100, 200, 300] as const) expect(p[s]).toBe(KLM_V47[klm][s].toUpperCase());
      for (const s of [400, 500, 600, 700, 800, 900] as const) {
        expect(Math.abs(hexToOklch(p[s]).h - hexToOklch(KLM_V47[klm][s]).h)).toBeLessThan(2);
        expect(hexToOklch(p[s]).l).toBeLessThanOrEqual(hexToOklch(KLM_V47[klm][s]).l + 1e-9);
      }
      const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
      stops.slice(1).forEach((s, i) => expect(hexToOklch(p[s]).l).toBeLessThan(hexToOklch(p[stops[i]]).l));
      for (const pair of statusPairs(p)) expect(contrastRatio(pair.text, pair.bg), pair.label).toBeGreaterThanOrEqual(4.5);
    });
  it('palette.ts records exactly what the script derives', () => {
    const { primary, ...rest } = lightPalette;
    expect(rest).toEqual(deriveLightPalette());
    expect(primary).toEqual(joyPalette.primary);
  });
  it('computes WCAG contrast', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#A3680C', '#F5F1ED')).toBeCloseTo(4.11, 2);
  });
  ```

- [ ] **Step 3: Run it to verify it fails**

  Run: `pnpm --filter @hintoric/ui exec vitest run scripts/palette`
  Expected: FAIL, modules not found.

- [ ] **Step 4: Implement `color.ts` and `deriveKlmPalette.ts`**

  - **`deriveNeutral`**: stops 50–300 are KLM's neutral 50–300. For 400–900, take Joy's neutral stop's OKLCH `l`, and take `c` and `h` by linear interpolation over KLM's 11 neutral stops sorted by `l`.
  - **`statusPairs(p)`**, with canvas `#F5F1ED` and white `#FFFFFF`:
    - 500 on canvas, white, 100 and 200
    - 700 on 100 and 200
    - 800 on 300
    - white on 500, 600 and 700
  - **`deriveStatus(source)`**: keep 50–400 as the source. Then for 500, 600, 700, 800 and 900, in order:
    - Start from the source `l`, with the source `c` and `h`.
    - Lower `l` in steps of 0.002 until two things hold after hex rounding: every `statusPairs` entry involving this stop is ≥ 4.5, and `l` is below the previous stop's `l`.
    - Re-check 400 < 300 and 500 < 400 in `l`. If 400 is not above 500, darken 400 the same way.
  - **`deriveLightPalette()`** maps danger ← red, success ← green and warning ← orange.

- [ ] **Step 5: Write `palette.ts`**

  - Copy `joyPalette` from today's `theme.css` lines 3–52.
  - Run `node packages/ui/scripts/palette/deriveKlmPalette.ts` and paste the printed `lightPalette` literal.

- [ ] **Step 6: Run the tests to verify they pass**

  Run: `pnpm --filter @hintoric/ui exec vitest run scripts/palette`
  Expected: PASS.

- [ ] **Step 7: Record the derived values in the spec**

  In the spec's "Colour — light scheme" section, replace "The builder derives the values and records them here together with the resulting contrast table." with:
  - the three derived 50–900 lists;
  - the script's contrast table;
  - one sentence on the primary exception from Global Constraints.

- [ ] **Step 8: Commit**

  ```bash
  git add packages/ui/scripts/palette packages/ui/src/styles/palette.ts docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md
  git commit -m "feat(ui): derive the KLM-inspired palette reproducibly"
  ```

### Task 2: New tokens in `theme.css`, checked against `palette.ts`

**Files:**
- Create: `packages/ui/scripts/palette/themeCss.ts`
- Modify: `packages/ui/src/styles/theme.css`
- Test: `packages/ui/src/styles/theme.test.ts`, `packages/ui/src/styles/themeContrast.test.ts`

**Interfaces:**
- Consumes: `lightPalette`, `joyPalette`, `radius` (`palette.ts`); `contrastRatio` (`color.ts`).
- Produces:
  - `parseThemeCss(css: string): { light: Record<string, string>; dark: Record<string, string> }`. `light` is the `@theme { }` block and `dark` the `[data-color-scheme="dark"] { }` block. Values are trimmed and comments ignored.
  - `resolveToken(tokens: Record<string, string>, name: string): string` follows `var(--x)` chains. For dark, the caller passes `{ ...light, ...dark }`. Hex values come back uppercase.

- [ ] **Step 1: Write the failing tests**

  `theme.test.ts` reads `theme.css` with `readFileSync(new URL('./theme.css', import.meta.url), 'utf8')` and asserts:

  ```ts
  // raw stops
  for (const c of ['neutral', 'danger', 'success', 'warning', 'primary'] as const)
    for (const s of STOPS) expect(light[`--color-${c}-${s}`].toUpperCase()).toBe(lightPalette[c][s]);
  for (const c of ['neutral', 'danger', 'success', 'warning'] as const)
    for (const s of STOPS) expect(dark[`--color-${c}-${s}`].toUpperCase()).toBe(joyPalette[c][s]);
  // shape
  for (const [k, v] of Object.entries(radius)) expect(light[`--radius-${k}`]).toBe(v);
  expect(light['--default-border-width']).toBe('1.5px');
  expect(light['--shadow-xs']).toBe('none');
  expect(dark['--shadow-xs']).toBe('none');
  expect(light['--shadow-md']).toBe('0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(21, 21, 21, 0.08)');
  expect(dark['--shadow-lg']).toBe('0px 2px 8px -2px rgba(0, 0, 0, 0.6), 0px 12px 16px -4px rgba(0, 0, 0, 0.6)');
  // surfaces (Review Focus 1)
  expect(r('--color-canvas')).toBe('#F5F1ED');
  expect(r('--color-surface')).toBe('#FFFFFF');
  expect(r('--color-surface-popup')).toBe('#FFFFFF');
  expect([r('--color-surface-1'), r('--color-surface-2'), r('--color-surface-3')]).toEqual(['#EBE2DB', '#D4CCC6', '#AAA49E']);
  expect(light['--color-divider']).toBe('rgba(110, 105, 102, 0.2)');
  expect(r('--color-canvas')).not.toBe(r('--color-surface'));
  // neutral fills, one stop darker
  expect(r('--color-neutral-soft-bg')).toBe('#EBE2DB');
  expect(r('--color-neutral-soft-hover-bg')).toBe('#D4CCC6');
  expect(r('--color-neutral-soft-active-bg')).toBe('#AAA49E');
  for (const v of ['plain', 'outlined']) {
    expect(r(`--color-neutral-${v}-hover-bg`)).toBe('#EBE2DB');
    expect(r(`--color-neutral-${v}-active-bg`)).toBe('#D4CCC6');
  }
  for (const c of COLORS) expect(r(`--color-${c}-solid-disabled-bg`)).toBe('#EBE2DB');
  // Review Focus 3: nothing that should show a fill resolves to the canvas colour
  for (const name of Object.keys(light).filter((n) => /^--color-neutral-.*-(bg)$|-solid-disabled-bg$/.test(n) && !/soft-disabled-bg$/.test(n)))
    expect(r(name), name).not.toBe('#F5F1ED');
  // Review Focus 2: anything built on a changed raw stop is redeclared in dark
  for (const [name, value] of Object.entries(light))
    if (name.startsWith('--color-') && /var\(--color-(neutral|danger|success|warning)-\d+\)/.test(value))
      expect(dark, name).toHaveProperty(name);
  ```

  `themeContrast.test.ts`: for each of the five colours, assert ≥ 4.5 for every pair below except the two primary exceptions. The failure message names the pair and the ratio.
  - `plain-color` and `outlined-color` on `--color-canvas`, `--color-surface`, their `-hover-bg` and their `-active-bg`
  - `soft-color` on `soft-bg` and `soft-hover-bg`
  - `soft-active-color` on `soft-active-bg`
  - `solid-color` on `solid-bg`, `solid-hover-bg` and `solid-active-bg`
  - `--color-{c}-main` on canvas and surface
  - for neutral, also `plain-hover-color` on `plain-hover-bg`
  - `--color-ink-primary`, `-secondary` and `-tertiary` on canvas and surface

  For the two primary exceptions (`primary-plain-color` on `primary-plain-active-bg`, `primary-outlined-color` on `primary-outlined-active-bg`), assert `toBeCloseTo(3.85, 2)`.

- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm --filter @hintoric/ui exec vitest run src/styles`
  Expected: FAIL on raw stops, radius, `--default-border-width` and the other new values.

- [ ] **Step 3: Implement `themeCss.ts` and edit `theme.css`**

  - **Light raw stops** (`@theme`): neutral/danger/success/warning from `lightPalette`.
  - **Light semantic tokens:** the neutral fills and solid-disabled backgrounds from Global Constraints, plus canvas, surfaces and divider.
  - **Shape:** `--radius-*`, `--default-border-width: 1.5px`, `--shadow-xs: none`.
  - **Dark block:** add the four raw palettes from `joyPalette`, and set `--shadow-xs: none`.
  - **Comments:** update the ones that say a changed value "is Joy's" (radius, shadow-xs, raw palette header, divider) to name the spec instead.

- [ ] **Step 4: Run them to verify they pass**

  Run: `pnpm --filter @hintoric/ui exec vitest run src/styles scripts`
  Expected: PASS.

- [ ] **Step 5: Run the whole unit suite**

  Run: `pnpm --filter @hintoric/ui test`
  Expected: PASS, or only failures in component unit tests that assert a class name this task didn't touch. A token edit should not change any class name, so any failure here is a finding: investigate it rather than updating the test.

- [ ] **Step 6: Commit**

  The visual suite is expected to be red from here until Task 7.

  ```bash
  git add packages/ui/scripts/palette/themeCss.ts packages/ui/src/styles
  git commit -m "feat(ui): KLM-inspired light tokens, Joy's dark values pinned"
  ```

### Task 3: Joy oracle theme, wired into every visual test

**Files:**
- Create: `packages/ui/src/visual/joyTheme.ts`
- Create: `packages/ui/src/visual/JoyTheme.visual.test.tsx`
- Create: `packages/ui/scripts/joyThemeUsage.test.ts`
- Modify: every `packages/ui/src/visual/*.visual.test.tsx` that renders `JoyCssVarsProvider` (84 files, 199 sites), and `packages/ui/src/visual/errorParity.tsx`

**Interfaces:**
- Consumes: `lightPalette`, `radius`, `outlineWidth` (`palette.ts`).
- Produces: `export const joyTheme` (the return value of `extendTheme` from `@mui/joy/styles`).

- [ ] **Step 1: Write the failing oracle self-test** (`JoyTheme.visual.test.tsx`)

  This test checks only Joy's configuration, so it takes no screenshots; a comment says so. In both schemes via `setColorScheme(scheme)` and `<JoyCssVarsProvider theme={joyTheme} defaultMode={scheme}>`, assert:
  - `JoyButton` (outlined, neutral) and `JoyInput`: `borderRadius` `'12px'`, and `JoyInput` `boxShadow` `'none'`.
  - `JoyCard` (defaults): `borderRadius` `'24px'`. `borderColor` is `'rgba(0, 0, 0, 0)'` in light and `'rgb(50, 56, 62)'` in dark (Joy's dark `neutral.outlinedBorder`, neutral-700 `#32383E`).
  - `JoySheet sx={{ bgcolor: 'background.body' }}`: `'rgb(245, 241, 237)'` in light, `'rgb(0, 0, 0)'` in dark.
  - `JoyChip` (soft, neutral): `backgroundColor` `'rgb(235, 226, 219)'` in light, `'rgb(23, 26, 28)'` in dark.
  - `JoyButton` (solid, danger): `backgroundColor` equals `lightPalette.danger[500]` as `rgb()` in light, and Joy's `#C41C1C` in dark.

- [ ] **Step 2: Run it to verify it fails**

  Run: `pnpm --filter @hintoric/ui test:visual JoyTheme`
  Expected: FAIL, `joyTheme` not found.

- [ ] **Step 3: Implement `joyTheme.ts` with `extendTheme`**

  Only light is overridden; dark keeps Joy's defaults.
  - **Light palettes:**
    - neutral, danger, success, warning: the `lightPalette` stops.
    - neutral additionally: `softBg` 200, `softHoverBg` 300, `softActiveBg` 400, `plainHoverBg` 200, `plainActiveBg` 300, `outlinedHoverBg` 200, `outlinedActiveBg` 300. Write each as `'var(--joy-palette-neutral-N)'`.
    - every colour, primary included: `solidDisabledBg: 'var(--joy-palette-neutral-200)'`.
    - `background`: `body` neutral-100, `surface` and `popup` `common-white`, `level1` / `level2` / `level3` neutral-200 / 300 / 400.
  - **`radius`:** the `radius` constant.
  - **`shadow`:** `{ xs: 'none' }`.
  - **`variants.outlined`:** `{ '--variant-borderWidth': outlineWidth }` for each of the five colours. Joy deep-merges `variantsInput` into its variants (`styles/extendTheme.js:448`).
  - **`components.JoyCard.styleOverrides.root`:**
    - Set `'--Card-radius': theme.vars.radius.lg`.
    - When `ownerState.variant === 'outlined'` and `ownerState.color === 'neutral'`, also set `borderColor: 'transparent'` and `[theme.getColorSchemeSelector('dark')]: { borderColor: theme.vars.palette.neutral.outlinedBorder }`.
    - Joy's `getColorSchemeSelector('light')` is `'&'`, which is why the dark selector is the one written out.

  Every override carries a comment naming the spec decision it encodes.

- [ ] **Step 4: Run it to verify it passes**

  Run: `pnpm --filter @hintoric/ui test:visual JoyTheme`
  Expected: PASS. If `JoyCard`'s override also reaches `JoyModalDialog`, fix it in this module before moving on. Both share `StyledCardRoot`, but overrides are keyed by component name. Assert that `JoyModalDialog` stays at `'16px'` in the same test.

- [ ] **Step 5: Write the failing usage guard** (`scripts/joyThemeUsage.test.ts`)

  Read every file under `packages/ui/src/visual/` that contains `<JoyCssVarsProvider`, and assert that every occurrence matches `/<JoyCssVarsProvider theme=\{joyTheme\}/`. The failure message names the file and line.

  Run: `pnpm --filter @hintoric/ui exec vitest run scripts/joyThemeUsage`
  Expected: FAIL, listing 199 sites.

- [ ] **Step 6: Wire the theme in**

  ```bash
  cd packages/ui/src/visual
  grep -l '<JoyCssVarsProvider' *.tsx | xargs perl -0pi -e "s/<JoyCssVarsProvider defaultMode=/<JoyCssVarsProvider theme={joyTheme} defaultMode=/g"
  grep -l 'theme={joyTheme}' *.tsx | xargs grep -L "from './joyTheme'" | xargs perl -0pi -e "s/^(import [^\n]*\n)(?!import)/\$1import { joyTheme } from '.\/joyTheme';\n/m"
  ```

  Check the import landed after the last import line in each file. Fix any file the substitution got wrong by hand. Then run `pnpm typecheck` and `pnpm lint` from the repo root.

- [ ] **Step 7: Run the guard to verify it passes**

  Run: `pnpm --filter @hintoric/ui exec vitest run scripts/joyThemeUsage`
  Expected: PASS.

- [ ] **Step 8: Commit**

  ```bash
  git add packages/ui/src/visual packages/ui/scripts/joyThemeUsage.test.ts
  git commit -m "test(ui): render Joy with the agreed theme as the parity oracle"
  ```

### Task 4: Make the 1.5px outline testable

**Files:**
- Create: `packages/ui/src/visual/commands.ts`
- Create: `packages/ui/src/visual/Outline.visual.test.tsx`
- Modify: `packages/ui/vitest.visual.config.ts`; the browser-commands type augmentation (next to `src/visual/setup.ts`, in the file the suite already uses for ambient types, or a new `src/visual/commands.d.ts`)

**Interfaces:**
- Produces: the browser command `setDeviceScaleFactor(factor: number): Promise<void>`, callable as `commands.setDeviceScaleFactor(2)` from `vitest/browser`.

- [ ] **Step 1: Write the failing test** (`Outline.visual.test.tsx`)

  - `beforeAll`: `await commands.setDeviceScaleFactor(2)`. `afterAll`: set it back to `1`.
  - For each of these pairs, assert `borderTopWidth === '1.5px'` for both Joy and ours:
    - outlined `Button` neutral
    - `Input`
    - outlined `Card` primary
    - outlined `Chip` danger
  - Assert `Divider` stays 1px on both sides: compare the Joy and ours computed `height` or `borderTopWidth`, whichever our Divider uses.
  - No screenshots: this file checks a single cross-cutting property, and the component files carry the baselines. Add a comment saying so.

- [ ] **Step 2: Run it to verify it fails**

  Run: `pnpm --filter @hintoric/ui test:visual Outline`
  Expected: FAIL, the command doesn't exist.

- [ ] **Step 3: Implement the command and register it**

  - Implement `setDeviceScaleFactor` in `commands.ts`. It receives Vitest's browser command context: `ctx.page` is the Playwright page. Open a CDP session on it and send `Emulation.setDeviceMetricsOverride` with the current viewport, `deviceScaleFactor: factor` and `mobile: false`.
  - Register it under `test.browser.commands` in `vitest.visual.config.ts`.
  - Add the `BrowserCommands` type augmentation.

- [ ] **Step 4: Run it to verify it passes**

  Run: `pnpm --filter @hintoric/ui test:visual Outline`
  Expected: PASS on everything except components that still disagree with Joy. Those are fixed in Task 7; note them.

- [ ] **Step 5: Prove the test can fail**

  Temporarily set `--default-border-width: 1px` in `theme.css`, run `pnpm --filter @hintoric/ui test:visual Outline`, and expect FAIL. Then revert.

- [ ] **Step 6: Commit**

  ```bash
  git add packages/ui/src/visual packages/ui/vitest.visual.config.ts
  git commit -m "test(ui): check outline width at device pixel ratio 2"
  ```

### Task 5: Card: 24px, borderless in light, outlined in dark

**Files:**
- Modify: `packages/ui/src/styles/theme.css` (new token `--color-card-outlined-neutral-border`: `transparent` in `@theme`, `var(--color-neutral-outlined-border)` in the dark block)
- Modify: `packages/ui/src/components/Card/Card.tsx`
- Test: `packages/ui/src/visual/Card.visual.test.tsx`, `packages/ui/src/components/Card/Card.test.tsx`, `packages/ui/src/styles/theme.test.ts`

**Interfaces:**
- Consumes: `joyTheme`'s `JoyCard` override (Task 3).
- Produces: the public token `--color-card-outlined-neutral-border` (Tailwind class `border-card-outlined-neutral-border`).

- [ ] **Step 1: Write the failing tests**

  - **`Card.visual.test.tsx`:** add `expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor)` next to the existing width/radius assertions (only if it is not already there).
  - **`Card.visual.test.tsx`:** for outlined/neutral, assert `borderColor` is `'rgba(0, 0, 0, 0)'` in light and `'rgb(50, 56, 62)'` in dark (Review Focus 4).
  - **`theme.test.ts`:** assert the new token's light value is `'transparent'` and its dark value is `'var(--color-neutral-outlined-border)'`.
  - **`Card.test.tsx`:** update the radius class expectation to `rounded-lg`.

- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm --filter @hintoric/ui test:visual Card` and `pnpm --filter @hintoric/ui exec vitest run src/components/Card src/styles`
  Expected: FAIL. The radius is 16px and the light border is visible.

- [ ] **Step 3: Implement**

  - In `Card.tsx`, change `rounded-md` to `rounded-lg`.
  - For `variant === 'outlined' && color === 'neutral'`, use the surface classes with `border-neutral-outlined-border` swapped for `border-card-outlined-neutral-border`. Build the class string in `Card.tsx`; don't add a row to the shared maps, since this is Card-only.
  - Add the token to both `theme.css` blocks.
  - Delete Card's baselines: `rm packages/ui/src/visual/__screenshots__/Card.visual.test.tsx/*.png`.

- [ ] **Step 4: Run them to verify they pass**

  Run the Card visual test three times, so both screenshots get created. Then run the unit tests from Step 2.
  Expected: PASS. Open two new PNGs, one light and one dark, and look at them.

- [ ] **Step 5: Commit**

  ```bash
  git add packages/ui/src/components/Card packages/ui/src/styles packages/ui/src/visual/Card.visual.test.tsx packages/ui/src/visual/__screenshots__/Card.visual.test.tsx
  git commit -m "feat(ui): Card is 24px and borderless on the light canvas"
  ```

### Task 6: Radii that are hard-coded instead of tokens

**Files (the known candidates; Task 7 catches the rest):**
- `components/Link`: `rounded-[2px]`. Joy uses `radius.xs`, so this becomes `rounded-xs`.
- `components/Checkbox`: `rounded-[4px]`
- Bare `rounded` in `Button`, `IconButton`, `MenuButton`, `Textarea`, `RelativeTime`
- `components/Skeleton`: `rounded-[2.4px]`
- Tests: each component's `*.visual.test.tsx` and `*.test.tsx`

- [ ] **Step 1: Find Joy's expression for each candidate**

  For each candidate, find the expression in `@mui/joy`'s source (`node_modules/.pnpm/@mui+joy@5.0.0-beta.52*/node_modules/@mui/joy/<Component>/<Component>.js`) and write down whether it reads a radius token, a calc on one, or a constant.

- [ ] **Step 2: Run the candidates' visual tests**

  Run: `pnpm --filter @hintoric/ui test:visual Link` (and so on for each candidate).
  Expected: computed `borderRadius` assertions FAIL wherever ours is a constant and Joy's reads a token. Screenshot failures don't count yet.

- [ ] **Step 3: Replace each constant that disagrees**

  Use the matching token class (`rounded-xs`/`sm`/`md`/`lg`) or a `calc()` on `var(--radius-*)` that mirrors Joy's expression. Constants that match Joy's constant stay as they are; Skeleton's `min(0.15em, 6px)` is one.

- [ ] **Step 4: Run them to verify they pass**

  Run the same commands. Expected: `borderRadius` and `width`/`height` assertions PASS. Screenshot mismatches remain until Task 7.

- [ ] **Step 5: Commit**

  ```bash
  git commit -am "fix(ui): derive radii from the scale where Joy does"
  ```

### Task 7: Retake every baseline and close the remaining parity gaps

**Files:**
- Delete: `packages/ui/src/visual/__screenshots__/**/*.png`
- Modify: whichever components and unit tests the run flags

- [ ] **Step 1: Delete all `packages/ui` baselines and create new ones**

  ```bash
  find packages/ui/src/visual/__screenshots__ -name '*.png' -delete
  ```

  Run `pnpm --filter @hintoric/ui test:visual` three times.

- [ ] **Step 2: Collect the real failures**

  ```bash
  pnpm --filter @hintoric/ui test:visual 2>&1 | tee /tmp/visual.log | grep -E "FAIL|AssertionError" | grep -v "no existing reference"
  ```

  Expected: a list of computed-style mismatches. Group them by root cause:
  - **(a)** a hard-coded radius that Task 6 didn't list. Fix it as in Task 6.
  - **(b)** a bare `border` where Joy keeps a fixed 1px (dividers, rules, a component Joy styles outside `--variant-borderWidth`). Use `border-1` on our side.
  - **(c)** a hard-coded shadow that should read `var(--shadow-xs)`.
  - **(d)** a hard-coded colour that doesn't read a token.
  - **(e)** anything else. Stop and describe it before changing code.

  Never change Joy's side to make a test pass. The only Joy-side file is `joyTheme.ts`, and it changes only if it misstates a spec decision.

- [ ] **Step 3: Fix one root cause at a time**

  For each, re-run the affected files' tests until they pass, then commit:

  ```bash
  git commit -am "fix(ui): <component>: follow the new <radius|outline|shadow> token"
  ```

- [ ] **Step 4: Bring the unit suite in line**

  Run `pnpm --filter @hintoric/ui test`. Update unit tests that assert a class you changed, and nothing else.

- [ ] **Step 5: Commit the baselines**

  When the whole suite passes on a fresh run:

  ```bash
  git add packages/ui/src/visual/__screenshots__ && git commit -m "test(ui): retake visual baselines for the new look"
  ```

### Task 8: `@hintoric/email` follows

**Files:**
- Modify: `packages/email/src/tokens.ts`, `packages/email/src/styles.ts`, `packages/email/src/components/{Card,Button,Chip,Alert,Layout}.tsx` (wherever a radius or a border width is inlined)
- Create: `packages/email/src/tokens.test.ts`
- Retake: `packages/email/src/visual/__screenshots__/**`

**Interfaces:**
- Produces:
  - `emailPalettes: Record<EmailScheme, Record<EmailColor, Record<Stop, string>>>`. `light` equals `lightPalette` and `dark` equals `joyPalette`, both as literal copies; email can't import from ui's `src`.
  - `emailPalette` stays exported as an alias of `emailPalettes.light`, because it is public API.
  - `emailRadius` gets the new values.
  - `emailOutlineWidth = '1.5px'`.
  - `variantTokens(scheme, …)` reads `emailPalettes[scheme]`. In light, neutral soft returns `backgroundColor: c[200]`.

- [ ] **Step 1: Write the failing test** (`tokens.test.ts`, covering Review Focus 5)

  ```ts
  expect(emailPalettes.dark.neutral[800]).toBe('#171A1C');
  expect(variantTokens('dark', 'soft', 'neutral')).toEqual({ color: '#DDE7EE', backgroundColor: '#171A1C' });
  expect(variantTokens('dark', 'outlined', 'danger')).toEqual({ color: '#F7C5C5', borderColor: '#7D1212' });
  expect(variantTokens('light', 'soft', 'neutral')).toEqual({ color: '#393735', backgroundColor: '#EBE2DB' });
  expect(emailRadius).toEqual({ xs: '4px', sm: '12px', md: '16px', lg: '24px', xl: '32px' });
  ```

- [ ] **Step 2: Run it to verify it fails**

  Run: `pnpm --filter @hintoric/email test`
  Expected: FAIL.

- [ ] **Step 3: Implement**

  - **`tokens.ts`:** the palettes and `variantTokens` change above.
  - **`emailSchemes.light`:** `surface` `#FFFFFF`, `surface1` neutral-200. Mirror ui's canvas/surface roles: check in `styles.ts` and `Layout.tsx` which token paints the page, and give the page the canvas colour `#F5F1ED`.
  - **`Card`:** `emailRadius.lg`. In light, the border is transparent at the same width; `styles.ts`'s dark rules restore today's dark border colour.
  - **Outline width:** inline outline widths become `emailOutlineWidth` wherever the web counterpart is outlined.
  - **Layout:** set the `20px` shell radius to `emailRadius.lg`, unless a Layout parity test compares it with a web element that says otherwise.

- [ ] **Step 4: Run the unit test to verify it passes**

  Run: `pnpm --filter @hintoric/email test`
  Expected: PASS.

- [ ] **Step 5: Build ui, retake the email baselines, run the parity suite**

  ```bash
  pnpm --filter @hintoric/ui build
  find packages/email/src/visual/__screenshots__ -name '*.png' -delete
  ```

  Run `pnpm --filter @hintoric/email test:visual` three times.
  Expected: PASS. A computed-style failure means email and web disagree: fix the email side, never ui's.

- [ ] **Step 6: Commit**

  ```bash
  git add packages/email && git commit -m "feat(email): follow the KLM-inspired look"
  ```

### Task 9: Docs app, CLAUDE.md, page background

**Files:**
- Modify: `apps/docs/src/Layout.tsx` (or `apps/docs/src/styles.css` if it paints `body`)
- Modify: `CLAUDE.md`
- Modify: `.gitignore` (add `.contact-sheets`)

- [ ] **Step 1: Give the docs app the canvas background**

  Add `bg-canvas` to the docs app's outermost page element; the playground already has it in `apps/playground/src/App.tsx`. Start the docs dev server and check the page background:
  - light: `rgb(245, 241, 237)`
  - dark: `rgb(0, 0, 0)`

- [ ] **Step 2: Edit `CLAUDE.md`**

  - **Opening line:** say `@hintoric/ui` has Joy UI's API and structure on Base UI and Tailwind, with its own look (link the spec).
  - **Hard requirement, point 1:** "Renders the real `@mui/joy` component, configured with the shared oracle theme `visual/joyTheme.ts`, and our own component side by side". Add one sentence: a new visual test must pass `theme={joyTheme}`, and `scripts/joyThemeUsage.test.ts` enforces it.
  - **The wrapper-scope paragraph** (`visual/darkMode.tsx` … `renderJoyDark`): delete it. The file no longer exists, and the nested-scope guard now lives in `src/styles/theme.test.ts`.
  - **"Changing a component means retaking its baselines":** add `joyTheme.ts` as an explained reason for Joy's own images to move.
  - **"Don't re-derive what's already been reverse-engineered":**
    - Light colour, radius, outline and shadow-xs values come from the spec and are recorded in `src/styles/palette.ts`, derived by `scripts/palette/deriveKlmPalette.ts`.
    - Dark values and every per-variant formula are still Joy's.
    - Change a value in `palette.ts` first. `theme.test.ts` then shows where `theme.css` disagrees.
  - **Email section:** `tokens.ts` holds one palette per scheme.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/docs CLAUDE.md .gitignore && git commit -m "docs: the library's look is its own now; Joy stays the oracle"
  ```

### Task 10: Changesets

**Files:**
- Create: `.changeset/klm-inspired-look.md`

- [ ] **Step 1: Write the changeset**

  ```markdown
  ---
  '@hintoric/ui': major
  '@hintoric/email': major
  ---

  A new look. Components are rounder (buttons and fields 12px, cards 24px), flatter (no resting shadow on inputs and cards) and outlined at 1.5px. In light mode, neutrals move from cool blue-grey to warm stone, the page background (`bg-canvas`) is a warm beige with white cards on it, and danger, success and warning use new, more vivid fills with darker text that meets WCAG AA in every state. Dark mode keeps its colours and only changes shape; cards keep their outline there. Primary blue, typography and every prop are unchanged.

  To migrate, put `bg-canvas` on your page root if you haven't already: light cards are white with no border and need the canvas behind them to stand out. Token names are unchanged; token values are not, so anything you built from `--color-neutral-*`, `--radius-*` or `--shadow-xs` changes with it. Emails follow the same palette and radii. `@hintoric/icons` illustrations still use the cool greys and will be updated separately.
  ```

- [ ] **Step 2: Check it**

  Run: `pnpm changeset status`
  Expected: lists both packages as major.

- [ ] **Step 3: Commit**

  ```bash
  git add .changeset/klm-inspired-look.md && git commit -m "chore: changeset for the new look"
  ```

### Task 11: Contact sheets and the baseline review

**Files:**
- Create: `packages/ui/scripts/contactSheets.ts`
- Test: `packages/ui/scripts/contactSheets.test.ts`

**Interfaces:**
- Produces: `buildContactSheets(screenshotsRoot: string, outDir: string, labels: { theirs: string; ours: string }): string[]`.
  - Writes one HTML file per test-file directory and returns their paths.
  - A row pairs `<id>-<theirs>-<scheme>-*.png` with `<id>-<ours>-<scheme>-*.png`, with light and dark side by side.
  - Files without a partner are listed under "Unpaired".
- CLI: `node packages/ui/scripts/contactSheets.ts <screenshotsRoot> <outDir> <theirs> <ours>`.

- [ ] **Step 1: Write the failing test**

  In a temp dir, create empty files `Card.visual.test.tsx/card-outlined-neutral-joy-light-chromium-darwin.png`, `…-hintoric-light-…`, `…-joy-dark-…`, `…-hintoric-dark-…` and `Card.visual.test.tsx/stray-chromium-darwin.png`.

  Assert:
  - one sheet is written;
  - it contains one row with all four images in the order joy-light, hintoric-light, joy-dark, hintoric-dark;
  - `stray` appears under "Unpaired".

- [ ] **Step 2: Run it to verify it fails, implement, run it to verify it passes**

  Run: `pnpm --filter @hintoric/ui exec vitest run scripts/contactSheets`

- [ ] **Step 3: Generate the sheets**

  ```bash
  node packages/ui/scripts/contactSheets.ts packages/ui/src/visual/__screenshots__ .contact-sheets/ui joy hintoric
  node packages/ui/scripts/contactSheets.ts packages/email/src/visual/__screenshots__ .contact-sheets/email web email
  ```

- [ ] **Step 4: Review every sheet**

  Open each sheet in the browser pane and screenshot it, scrolling as needed. Record one line per sheet in `docs/superpowers/plans/2026-10-27-klm-inspired-look-review-log.md`: `ok`, or the issue.

  An issue is anything where ours and themed-Joy differ visibly, or where the look contradicts the spec (a warm tone in dark, a visible light Card border, a shadow on a resting input). Each issue goes back to Task 7's root-cause loop.

- [ ] **Step 5: Commit**

  ```bash
  git add packages/ui/scripts/contactSheets.ts packages/ui/scripts/contactSheets.test.ts docs/superpowers/plans/2026-10-27-klm-inspired-look-review-log.md
  git commit -m "test(ui): contact sheets for reviewing retaken baselines"
  ```

### Task 12: Whole-branch verification and hand-off

- [ ] **Step 1: Run everything from a clean state**

  ```bash
  pnpm typecheck && pnpm lint && pnpm --filter @hintoric/ui test && pnpm --filter @hintoric/email test \
    && pnpm --filter @hintoric/ui test:visual && pnpm --filter @hintoric/ui build && pnpm --filter @hintoric/email test:visual
  ```

  Expected: every command passes. Paste the summary lines (test counts) into the hand-off.

- [ ] **Step 2: Check the spec's "Done when" list item by item**

  Note any item that isn't met.

- [ ] **Step 3: Hand off to the user for local review**

  Start the playground and the docs app. Show both in light and dark, and link the contact sheets and the review log. Don't merge, don't push a release, don't open a PR unless the user asks.
