import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, IconButton as JoyIconButton, Input as JoyInput } from '@mui/joy';
import { NumberInput as HintoricNumberInput } from '../components/NumberInput';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, lastShadowLayer, setColorScheme, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// @mui/joy has no number input. The oracle is the closest thing it does have
// — an <Input> with two IconButtons as its endDecorator, which is what a Joy
// app builds by hand — and the comparison covers the pill only: its colours,
// border, radius, type, height, and how it sits in a fixed-width parent. The
// stepper buttons are our own (they tint with currentColor rather than using
// an IconButton variant, see NumberInput.tsx), so they get self-checks and
// screenshots instead of a parity assertion.
function JoyNumberInput(props: React.ComponentProps<typeof JoyInput>) {
  return (
    <JoyInput
      defaultValue="12"
      endDecorator={
        <>
          <JoyIconButton size="sm" aria-label="Decrease">−</JoyIconButton>
          <JoyIconButton size="sm" aria-label="Increase">+</JoyIconButton>
        </>
      }
      {...props}
    />
  );
}

// The pill is the input's parent in both libraries.
const pillOf = (container: HTMLElement) => container.querySelector('input')!.parentElement as HTMLElement;

function expectSamePill(ours: HTMLElement, joy: HTMLElement) {
  const o = getComputedStyle(ours);
  const j = getComputedStyle(joy);
  expect(o.backgroundColor).toBe(j.backgroundColor);
  expect(o.color).toBe(j.color);
  expect(o.borderColor).toBe(j.borderColor);
  expect(o.borderWidth).toBe(j.borderWidth);
  expect(o.borderRadius).toBe(j.borderRadius);
  expect(o.fontSize).toBe(j.fontSize);
  expect(o.fontWeight).toBe(j.fontWeight);
  expect(o.lineHeight).toBe(j.lineHeight);
  expect(lastShadowLayer(o.boxShadow)).toBe(lastShadowLayer(j.boxShadow));
  expect(o.minHeight).toBe(j.minHeight);
  expect(o.height).toBe(j.height);
  expect(o.paddingLeft).toBe(j.paddingLeft);
  expect(o.cursor).toBe(j.cursor);
  // Unlike Input (still inline-flex, see P1 of the 2026-09-06 audit), this
  // field fills its container the way Joy's does.
  expect(o.display).toBe(j.display);
  expect(o.width).toBe(j.width);
}

describe('NumberInput visual parity with a Joy Input + IconButtons', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} pill matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joy } = render(
            <div data-testid={`joy-${variant}-${color}`} style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyNumberInput variant={variant} color={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: ours } = render(
            <div data-testid={`hintoric-${variant}-${color}`} style={{ width: 400 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricNumberInput variant={variant} color={color} defaultValue={12} aria-label="n" />
              </ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          expectSamePill(pillOf(ours), pillOf(joy));

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(
            `number-input-${variant}-${color}-joy-${scheme}`,
          );
          await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(
            `number-input-${variant}-${color}-hintoric-${scheme}`,
          );
        });

        it(`${variant}/${color} in error state matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joy } = render(
            <div style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyNumberInput error variant={variant} color={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: ours } = render(
            <div style={{ width: 400 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricNumberInput error variant={variant} color={color} defaultValue={12} aria-label="n" />
              </ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();
          expectSamePill(pillOf(ours), pillOf(joy));
        });
      }
    }

    for (const color of COLORS) {
      it(`focus ring for color=${color} matches Joy UI's inset ring in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { container: joy } = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyNumberInput color={color} />
          </JoyCssVarsProvider>,
        );
        const { container: ours } = render(
          <div data-testid={`hintoric-focus-${color}`} style={{ width: 400 }}>
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricNumberInput color={color} defaultValue={12} aria-label="n" />
            </ColorSchemeProvider>
          </div>,
        );

        const joyInput = joy.querySelector('input')!;
        joyInput.focus();
        await settleTransitions();
        // Joy's ring lives on a ::before overlay, not the wrapper's own box-shadow.
        const joyRing = getComputedStyle(joyInput.parentElement!, '::before').boxShadow;
        joyInput.blur();

        ours.querySelector('input')!.focus();
        await settleTransitions();
        const ourRing = getComputedStyle(pillOf(ours)).boxShadow;
        expect(lastShadowLayer(ourRing)).toBe(lastShadowLayer(joyRing));

        await expect(page.getByTestId(`hintoric-focus-${color}`)).toMatchScreenshot(
          `number-input-focus-${color}-hintoric-${scheme}`,
        );
      });
    }

    it(`stepper button tints on hover in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { container } = render(
        <div data-testid="hintoric-hover" style={{ width: 400 }}>
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricNumberInput defaultValue={12} aria-label="n" />
          </ColorSchemeProvider>
        </div>,
      );
      const plus = container.querySelector('button[aria-label="Increase"]') as HTMLElement;
      const resting = getComputedStyle(plus).backgroundColor;
      expect(resting).toBe('rgba(0, 0, 0, 0)');
      await page.elementLocator(plus).hover();
      await settleTransitions();
      expect(getComputedStyle(plus).backgroundColor).not.toBe(resting);
      expect(getComputedStyle(plus).cursor).toBe('pointer');
      await expect(page.getByTestId('hintoric-hover')).toMatchScreenshot(`number-input-hover-hintoric-${scheme}`);
    });

    it(`disabled pill matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { container: joy } = render(
        <div data-testid="joy-disabled" style={{ width: 400 }}>
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyNumberInput disabled />
          </JoyCssVarsProvider>
        </div>,
      );
      const { container: ours } = render(
        <div data-testid="hintoric-disabled" style={{ width: 400 }}>
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricNumberInput disabled defaultValue={12} aria-label="n" />
          </ColorSchemeProvider>
        </div>,
      );
      await settleTransitions();
      const o = getComputedStyle(pillOf(ours));
      const j = getComputedStyle(pillOf(joy));
      expect(o.backgroundColor).toBe(j.backgroundColor);
      expect(o.borderColor).toBe(j.borderColor);
      expect(o.color).toBe(j.color);
      for (const button of ours.querySelectorAll('button')) {
        expect(getComputedStyle(button).cursor).toBe('default');
      }
      await expect(page.getByTestId('joy-disabled')).toMatchScreenshot(`number-input-disabled-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-disabled')).toMatchScreenshot(`number-input-disabled-hintoric-${scheme}`);
    });
  }
});
