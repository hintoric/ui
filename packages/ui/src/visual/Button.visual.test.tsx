import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Button as JoyButton } from '@mui/joy';
import { Button as HintoricButton } from '../components/Button';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

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
          await expect(hintoricLocator).toMatchScreenshot(
            `button-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }
  }

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

  /**
   * Button's typography diverged from Joy at every size until 2026-09-07,
   * when the sizing assertion below found it — which is what P2 of the
   * coverage audit was for. Nothing in 852 green tests compared a font
   * property, so this survived in the library's most-used component:
   *
   *   size | fontSize joy/ours | fontWeight joy/ours | lineHeight joy/ours
   *   sm   | 14px / 14px  ok   | 600 / 500           | 21px / 20px
   *   md   | 14px / 16px       | 600 / 500           | 21px / 24px
   *   lg   | 16px / 18px       | 600 / 500           | 24px / 28px
   *
   * `minHeight` and the horizontal padding had been reverse-engineered
   * correctly; only the type scale had not. Fixed in buttonVariants.ts, whose
   * comment records what Joy actually does and why Button is the one component
   * that uses `fontWeight.lg`.
   *
   * No colour-scheme loop: font metrics do not depend on the scheme, measured
   * identical in light and dark.
   */
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`matches Joy UI's type scale at size=${size}`, async () => {
      await setColorScheme('light');

      render(
        <JoyCssVarsProvider defaultMode="light">
          <JoyButton data-testid="joy-type" size={size}>
            sized
          </JoyButton>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode="light">
          <HintoricButton data-testid="hintoric-type" size={size}>
            sized
          </HintoricButton>
        </ColorSchemeProvider>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-type').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-type').element());

      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
    });
  }

  /**
   * P2 from the 2026-09-06 coverage audit: before it, no test compared `width`
   * or `display` inside a fixed-width parent, and four components had silently
   * diverged on fill-versus-shrink. One case per component prevents the whole
   * class from recurring.
   *
   * This is the assertion that found the type-scale divergence: Button is
   * shrink-to-fit in both libraries and its `display` always matched, so the
   * 71.08px-vs-67.66px width gap it reported was entirely the wider, heavier
   * text. It passes now that the type scale does.
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

  /**
   * Disabled + hover, the combination P3 of the 2026-09-06 coverage audit
   * lists Button as missing.
   *
   * It is asserted through `pointer-events` rather than by driving a real
   * hover, because that turned out to be the actual mechanism: Joy sets
   * `pointer-events: none` on a disabled button, so a hover state can never
   * arise there — `user.hover()` on Joy's disabled button refuses outright
   * with "element has pointer-events: none".
   *
   * That matters because CSS `:hover` otherwise matches a disabled <button> in
   * Chrome, and a `hover:bg-*` utility with no disabled counterpart repaints a
   * control the user cannot use. A disabled `outlined`/`plain` Select did
   * exactly that until 2026-09-07, intermittently, depending on where the
   * pointer happened to rest.
   */
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      it(`blocks pointer interaction while disabled like Joy UI in ${variant}/${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyButton data-testid="joy-disabled" variant={variant} disabled>
              disabled
            </JoyButton>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricButton data-testid="hintoric-disabled" variant={variant} disabled>
              disabled
            </HintoricButton>
          </ColorSchemeProvider>,
        );

        const joyStyle = getComputedStyle(page.getByTestId('joy-disabled').element());
        const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-disabled').element());

        expect(hintoricStyle.pointerEvents).toBe(joyStyle.pointerEvents);
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
      });
    }
  }

  for (const scheme of COLOR_SCHEMES) {
    // The coverage hole that let the loading label show through: Button had a
    // `loading` prop, a jsdom test that it disables clicks, and no visual test at
    // all. Joy hides the label by putting `color: transparent` AFTER its variant
    // styles ("this has to come after the variant styles to take effect", its own
    // Button.js comment) — a Tailwind `text-transparent` cannot win that on order
    // alone, because `disabled:text-*` outranks it on specificity and Button
    // always disables itself while loading.
    for (const color of COLORS) {
      it(`loading/solid/${color} hides its label the way Joy UI does in ${scheme}`, async () => {
          await setColorScheme(scheme);
        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyButton data-testid={`joy-loading-${color}`} variant="solid" color={color} loading>
              {color}
            </JoyButton>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricButton data-testid={`hintoric-loading-${color}`} variant="solid" color={color} loading>
              {color}
            </HintoricButton>
          </ColorSchemeProvider>,
        );
        await settleTransitions();

        const joyStyle = getComputedStyle(page.getByTestId(`joy-loading-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-loading-${color}`).element());

        expect(joyStyle.color).toBe('rgba(0, 0, 0, 0)');
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);

        // Making the root transparent is only half of it: Joy re-colours its
        // indicator explicitly (`theme.variants[variant+'Disabled'][color].color`,
        // since a loading button is always disabled), because an indicator drawn
        // in `currentColor` would otherwise inherit the transparency and vanish.
        const joyIndicator = page
          .getByTestId(`joy-loading-${color}`)
          .element()
          .querySelector('.MuiButton-loadingIndicatorCenter') as HTMLElement;
        const hintoricIndicator = page
          .getByTestId(`hintoric-loading-${color}`)
          .element()
          .querySelector('span[aria-hidden="true"]') as HTMLElement;
        expect(joyIndicator).toBeTruthy();
        expect(hintoricIndicator).toBeTruthy();
        expect(getComputedStyle(joyIndicator).color).not.toBe('rgba(0, 0, 0, 0)');
        expect(getComputedStyle(hintoricIndicator).color).toBe(getComputedStyle(joyIndicator).color);

        // The indicator shapes still differ by construction — Joy renders a
        // CircularProgress, ours is a CSS border spinner — so the screenshots are
        // for a human to compare, not a pass/fail signal.
        await expect(page.getByTestId(`joy-loading-${color}`)).toMatchScreenshot(`button-loading-solid-${color}-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-loading-${color}`)).toMatchScreenshot(
          `button-loading-solid-${color}-hintoric-${scheme}`,
        );
      });
    }
  }

});
