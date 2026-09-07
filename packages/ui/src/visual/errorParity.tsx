import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions, lastShadowLayer } from './helpers';
import type { JoyColor, JoyVariant } from '../utils/colorVariantClasses';

export interface ErrorParityConfig {
  /** Screenshot name prefix, e.g. 'checkbox'. */
  slug: string;
  /** Omit for components with no variant axis (Switch, Slider). */
  variants?: readonly JoyVariant[];
  colors: readonly JoyColor[];
  /**
   * Renders the Joy reference in its error state. Where Joy's component has
   * no `error` prop at all, render it with `color="danger"` instead and say so
   * in a comment at the call site — that is the documented fallback, and it
   * keeps the comparison against the real package rather than against an
   * invented colour value.
   */
  renderJoy: (args: { variant?: JoyVariant; color: JoyColor }) => React.ReactElement;
  renderHintoric: (args: { variant?: JoyVariant; color: JoyColor }) => React.ReactElement;
  /** Picks the element whose computed styles carry the look. */
  element: (container: HTMLElement) => HTMLElement;
  /** Extra property comparisons beyond the shared four. */
  assertStyles?: (hintoric: CSSStyleDeclaration, joy: CSSStyleDeclaration) => void;
}

/**
 * The error-state half of a field's visual coverage: the full variant×colour
 * matrix CLAUDE.md requires, against the real @mui/joy package. Pass/fail is
 * the computed-style equality; the screenshots are for a human to look at.
 *
 * Note that an explicit `color` beats the error state in Joy as well — an
 * error-state outlined/neutral field is grey in both libraries, not red. The
 * "error alone turns it danger" path is therefore not covered here; it needs a
 * case that passes no colour at all.
 */
export function describeErrorParity(config: ErrorParityConfig): void {
  const variants: Array<JoyVariant | undefined> = config.variants
    ? [...config.variants]
    : [undefined];

  describe(`${config.slug} error-state parity with @mui/joy`, () => {
    for (const variant of variants) {
      for (const color of config.colors) {
        const key = variant ? `${variant}-${color}` : color;
        it(`${key} in error state matches Joy UI`, async () => {
          const { container: joyContainer } = render(
            <div data-testid={`joy-err-${key}`}>
              <JoyCssVarsProvider>{config.renderJoy({ variant, color })}</JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-err-${key}`}>
              <ColorSchemeProvider>{config.renderHintoric({ variant, color })}</ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          const joyStyle = getComputedStyle(config.element(joyContainer));
          const hintoricStyle = getComputedStyle(config.element(hintoricContainer));

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));
          config.assertStyles?.(hintoricStyle, joyStyle);

          await expect(page.getByTestId(`joy-err-${key}`)).toMatchScreenshot(
            `${config.slug}-error-${key}-joy`,
          );
          await expect(page.getByTestId(`hintoric-err-${key}`)).toMatchScreenshot(
            `${config.slug}-error-${key}-hintoric`,
          );
        });
      }
    }
  });
}
