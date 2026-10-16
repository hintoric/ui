import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Input as JoyInput } from '@mui/joy';
import { OtpInput as HintoricOtpInput } from '../components/OtpInput';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, lastShadowLayer, setColorScheme, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// @mui/joy has no OTP field. Each of our slots is an Input pill squared off,
// so the oracle per slot is Joy's <Input> root: same colours, border, radius,
// type, height and focus ring. Width is the one deliberate difference — a
// slot is as wide as it is tall — and is asserted on its own below.
const firstSlot = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;
const joyRoot = (container: HTMLElement) => container.querySelector('input')!.parentElement as HTMLElement;

function expectSameBox(ours: HTMLElement, joy: HTMLElement) {
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
  expect(o.height).toBe(j.height);
  expect(o.cursor).toBe(j.cursor);
}

describe('OtpInput slot parity with @mui/joy Input', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} slot matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joy } = render(
            <div data-testid={`joy-${variant}-${color}`}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyInput variant={variant} color={color} defaultValue="4" />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: ours } = render(
            <div data-testid={`hintoric-${variant}-${color}`} style={{ width: 400 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricOtpInput variant={variant} color={color} defaultValue="482" aria-label="Code" />
              </ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          expectSameBox(firstSlot(ours), joyRoot(joy));

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(
            `otp-input-${variant}-${color}-joy-${scheme}`,
          );
          await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(
            `otp-input-${variant}-${color}-hintoric-${scheme}`,
          );
        });

        it(`${variant}/${color} slot in error state matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joy } = render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyInput error variant={variant} color={color} />
            </JoyCssVarsProvider>,
          );
          const { container: ours } = render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricOtpInput error variant={variant} color={color} aria-label="Code" />
            </ColorSchemeProvider>,
          );
          await settleTransitions();
          expectSameBox(firstSlot(ours), joyRoot(joy));
        });
      }
    }

    for (const color of COLORS) {
      it(`focus ring for color=${color} matches Joy UI's inset ring in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { container: joy } = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyInput color={color} />
          </JoyCssVarsProvider>,
        );
        const { container: ours } = render(
          <div data-testid={`hintoric-focus-${color}`}>
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricOtpInput color={color} defaultValue="48" aria-label="Code" />
            </ColorSchemeProvider>
          </div>,
        );

        const joyInput = joy.querySelector('input')!;
        joyInput.focus();
        await settleTransitions();
        // Joy's ring lives on a ::before overlay, not the wrapper's own box-shadow.
        const joyRing = getComputedStyle(joyInput.parentElement!, '::before').boxShadow;
        joyInput.blur();

        const slot = firstSlot(ours);
        slot.focus();
        await settleTransitions();
        expect(lastShadowLayer(getComputedStyle(slot).boxShadow)).toBe(lastShadowLayer(joyRing));

        await expect(page.getByTestId(`hintoric-focus-${color}`)).toMatchScreenshot(
          `otp-input-focus-${color}-hintoric-${scheme}`,
        );
      });
    }

    it(`disabled slots match Joy UI's disabled Input in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { container: joy } = render(
        <div data-testid="joy-disabled">
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyInput disabled defaultValue="4" />
          </JoyCssVarsProvider>
        </div>,
      );
      const { container: ours } = render(
        <div data-testid="hintoric-disabled">
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricOtpInput disabled defaultValue="482" aria-label="Code" />
          </ColorSchemeProvider>
        </div>,
      );
      await settleTransitions();
      const o = getComputedStyle(firstSlot(ours));
      const j = getComputedStyle(joyRoot(joy));
      expect(o.backgroundColor).toBe(j.backgroundColor);
      expect(o.borderColor).toBe(j.borderColor);
      expect(o.color).toBe(j.color);
      await expect(page.getByTestId('joy-disabled')).toMatchScreenshot(`otp-input-disabled-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-disabled')).toMatchScreenshot(`otp-input-disabled-hintoric-${scheme}`);
    });

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} slots are square, as tall as Joy's Input, and keep their width in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { container: joy } = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyInput size={size} />
          </JoyCssVarsProvider>,
        );
        const { container: ours } = render(
          <div style={{ width: 400 }}>
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricOtpInput size={size} aria-label="Code" />
            </ColorSchemeProvider>
          </div>,
        );
        const slot = getComputedStyle(firstSlot(ours));
        const group = getComputedStyle(firstSlot(ours).parentElement!);
        expect(slot.height).toBe(getComputedStyle(joyRoot(joy)).height);
        expect(slot.fontSize).toBe(getComputedStyle(joyRoot(joy)).fontSize);
        expect(slot.width).toBe(slot.height);
        // The group hugs its slots rather than stretching across the parent.
        expect(group.display).toBe('inline-flex');
      });
    }
  }
});
