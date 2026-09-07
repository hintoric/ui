import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Button as JoyButton } from '@mui/joy';
import { Button as HintoricButton } from '../components/Button';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, settleTransitions, setColorScheme } from './helpers';

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
   * Button's typography diverges from Joy at every size. Found 2026-09-07 by
   * the sizing assertion below, which is what P2 of the coverage audit was
   * for: nothing in 852 green tests compared a font property, so this went
   * unnoticed despite being the library's most-used component.
   *
   * Measured against real @mui/joy 5.0.0-beta.52:
   *
   *   size | fontSize joy/ours | fontWeight joy/ours | lineHeight joy/ours
   *   sm   | 14px / 14px  ok   | 600 / 500           | 21px / 20px
   *   md   | 14px / 16px       | 600 / 500           | 21px / 24px
   *   lg   | 16px / 18px       | 600 / 500           | 24px / 28px
   *
   * `minHeight` and the horizontal padding were reverse-engineered correctly;
   * only the type scale was not. Joy's Button.js takes fontSize from
   * `fontSize.sm` for both sm and md and `fontSize.md` for lg, and fontWeight
   * from `fontWeight.lg` (600) throughout. Ours sets `font-medium` globally
   * and `text-sm`/`text-base`/`text-lg` per size (buttonVariants.ts:13-21).
   *
   * `it.fails()` rather than `it.skip()` on purpose: this asserts the
   * divergence is still present, so the suite stays green while the bug is
   * known AND turns red the moment somebody fixes the component — at which
   * point drop the `.fails` and this comment. A skip would let the fix land
   * unnoticed and the assertion rot.
   *
   * No colour-scheme loop: font metrics do not depend on the scheme, and the
   * probe confirmed identical values in light and dark.
   */
  for (const size of ['sm', 'md', 'lg'] as const) {
    it.fails(`matches Joy UI's type scale at size=${size}`, async () => {
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
   * `it.fails()` here is a consequence of the type-scale divergence above, not
   * an independent bug: Button is shrink-to-fit in both libraries and its
   * `display` matches, so the 71.08px-vs-67.66px width gap is the wider,
   * lighter text. Fixing the type scale should make this pass — drop both
   * `.fails` together.
   */
  for (const scheme of COLOR_SCHEMES) {
    it.fails(`fills the same share of a fixed-width parent as Joy UI in ${scheme}`, async () => {
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
});
