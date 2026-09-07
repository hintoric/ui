import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions, lastShadowLayer } from './helpers';
import type { JoyColor, JoyVariant } from '../utils/colorVariantClasses';

/**
 * Moves the real mouse onto an empty spacer before styles are measured.
 *
 * The browser harness leaves the pointer wherever the last `.hover()` put it,
 * and a freshly rendered element can land under a stationary pointer and be
 * measured in its :hover state. Both sides are affected: Select's own solid
 * background read primary-600 instead of primary-500 for twenty cells, and
 * Joy's outlined danger background read its hover tint (#FCE4E4) in another.
 * Neither was a styling bug — just a mouse nobody had moved.
 *
 * The spacer is `position: fixed` in the bottom-right corner on purpose. An
 * in-flow one shifts the elements measured after it by a sub-pixel, which is
 * invisible to getComputedStyle but enough to make the committed screenshots
 * disagree with a later run by a dozen anti-aliased pixels on a rounded
 * border. Out of flow, it cannot move anything.
 */
export async function parkPointer(key: string): Promise<void> {
  render(
    <div
      data-testid={`park-${key}`}
      style={{ position: 'fixed', right: 0, bottom: 0, width: 120, height: 40 }}
    />,
  );
  await page.getByTestId(`park-${key}`).hover();
}

const JOY_BOX: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: 320 };
const HINTORIC_BOX: React.CSSProperties = { position: 'fixed', top: 120, left: 0, width: 320 };

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
  /**
   * Override for the Joy side when its DOM shape differs from ours — Joy's
   * Textarea wraps the control in a styled root, for instance, while ours is
   * a bare <textarea>. Each side's "visible box" is then a different element,
   * and comparing the same selector on both would compare the wrong things.
   */
  joyElement?: (container: HTMLElement) => HTMLElement;
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
          await parkPointer(key);

          // Both wrappers are taken out of flow at fixed coordinates. In
          // flow, their sub-pixel position depends on however much content
          // earlier tests left in the document, and that varies between the
          // run that writes a baseline and the run that checks it — enough to
          // change a captured element's height by 1px and fail on nothing.
          // (A test aborts at its first failing screenshot, so baselines are
          // always written across more than one run; they have to be
          // position-independent.)
          const { container: joyContainer } = render(
            <div data-testid={`joy-err-${key}`} style={JOY_BOX}>
              <JoyCssVarsProvider>{config.renderJoy({ variant, color })}</JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-err-${key}`} style={HINTORIC_BOX}>
              <ColorSchemeProvider>{config.renderHintoric({ variant, color })}</ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          const joyStyle = getComputedStyle((config.joyElement ?? config.element)(joyContainer));
          const hintoricStyle = getComputedStyle(config.element(hintoricContainer));

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          // borderColor only where there is actually a border. With none, the
          // property falls back to the element's `color`, and comparing that
          // asserts nothing about the border — Switch's track has no border on
          // either side, and the fallback made ours read black against Joy's
          // white.
          if (joyStyle.borderWidth !== '0px') {
            expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          }
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
