import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Input as JoyInput } from '@mui/joy';
import { Input as HintoricInput } from '../components/Input';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, lastShadowLayer, setColorScheme, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Both Joy UI and our Input have a root-wrapper + native-<input> split — the
// wrapper carries variant/color/shadow/radius, the inner <input> is naked.
// data-testid forwarding to the wrapper isn't something either library
// guarantees, so we wrap each render in our own tagged <div> and query the
// real <input> inside it directly, rather than relying on prop forwarding.
describe('Input visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          const { container: joyContainer } = render(
            <div data-testid={`joy-${variant}-${color}`} style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyInput variant={variant} color={color} placeholder={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-${variant}-${color}`} style={{ width: 400 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricInput variant={variant} color={color} placeholder={color} />
              </ColorSchemeProvider>
            </div>,
          );

          const joyWrapper = joyContainer.querySelector('input')!.parentElement as HTMLElement;
          const hintoricWrapper = hintoricContainer.querySelector('input')!.parentElement as HTMLElement;

          const joyStyle = getComputedStyle(joyWrapper);
          const hintoricStyle = getComputedStyle(hintoricWrapper);

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
          expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));
          expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
          expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          // Inside the 400px parent: Joy's root is `display: flex` and fills
          // it (P1 of the 2026-09-06 audit — ours used to shrink to 201px).
          expect(hintoricStyle.display).toBe(joyStyle.display);
          expect(hintoricStyle.width).toBe(joyStyle.width);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(
            `input-${variant}-${color}-joy-${scheme}`,
          );
          await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(
            `input-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    // Joy UI's focus ring maps color="neutral" to primary-500 and every other
    // color to its own -500 — this loop is the whole reason that mapping exists.
    for (const color of COLORS) {
      it(`focus ring for color=${color} matches Joy UI's inset ring in ${scheme}`, async () => {
        await setColorScheme(scheme);

        const { container: joyContainer } = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyInput color={color} placeholder="focus" />
          </JoyCssVarsProvider>,
        );
        const { container: hintoricContainer } = render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricInput color={color} placeholder="focus" />
          </ColorSchemeProvider>,
        );

        const joyInput = joyContainer.querySelector('input') as HTMLInputElement;
        const hintoricInput = hintoricContainer.querySelector('input') as HTMLInputElement;
        const joyWrapper = joyInput.parentElement as HTMLElement;
        const hintoricWrapper = hintoricInput.parentElement as HTMLElement;

        joyInput.focus();
        await settleTransitions();
        // Joy's ring lives on a ::before overlay, not the wrapper's own box-shadow.
        const joyRing = getComputedStyle(joyWrapper, '::before').boxShadow;
        joyInput.blur();

        hintoricInput.focus();
        await settleTransitions();
        const hintoricRing = getComputedStyle(hintoricWrapper).boxShadow;
        hintoricInput.blur();

        expect(lastShadowLayer(hintoricRing)).toBe(lastShadowLayer(joyRing));
      });
    }
  }
});

// The root is a wrapper in both libraries, so `:disabled` can't style it —
// this matrix is what proves the data-disabled classes reach the pill.
describe('Input disabled-state parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} disabled matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joyContainer } = render(
            <div data-testid={`joy-dis-${variant}-${color}`} style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyInput disabled variant={variant} color={color} placeholder={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-dis-${variant}-${color}`} style={{ width: 400 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricInput disabled variant={variant} color={color} placeholder={color} />
              </ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          const joyStyle = getComputedStyle(joyContainer.querySelector('input')!.parentElement as HTMLElement);
          const hintoricStyle = getComputedStyle(hintoricContainer.querySelector('input')!.parentElement as HTMLElement);

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
          expect(hintoricStyle.display).toBe(joyStyle.display);
          expect(hintoricStyle.width).toBe(joyStyle.width);

          await expect(page.getByTestId(`joy-dis-${variant}-${color}`)).toMatchScreenshot(`input-disabled-${variant}-${color}-joy-${scheme}`);
          await expect(page.getByTestId(`hintoric-dis-${variant}-${color}`)).toMatchScreenshot(`input-disabled-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }
  }
});

// Error-state pass over the same variant×colour matrix. Written out inline
// rather than through a helper because Task 6b turns exactly this block into
// the shared helper the other eight fields use, and it can only be shown to be
// equivalent if this one exists first.
describe('Input error-state parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} in error state matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joyContainer } = render(
            <div data-testid={`joy-err-${variant}-${color}`}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyInput error variant={variant} color={color} placeholder={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-err-${variant}-${color}`}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricInput error variant={variant} color={color} placeholder={color} />
              </ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          const joyWrapper = joyContainer.querySelector('input')!.parentElement as HTMLElement;
          const hintoricWrapper = hintoricContainer.querySelector('input')!.parentElement as HTMLElement;
          const joyStyle = getComputedStyle(joyWrapper);
          const hintoricStyle = getComputedStyle(hintoricWrapper);

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));

          await expect(page.getByTestId(`joy-err-${variant}-${color}`)).toMatchScreenshot(`input-error-${variant}-${color}-joy-${scheme}`);
          await expect(page.getByTestId(`hintoric-err-${variant}-${color}`)).toMatchScreenshot(`input-error-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }
  }
});

// The matrices above all run at the default size, where Joy's body-md and
// Tailwind's text-base agree on a 24px line. At sm/lg Joy's body-sm/-lg keep
// line-height 1.5 (21px/27px) while text-sm/-lg carry 20px/28px — a gap that
// min-height hid from every height check until this block measured it.
describe('Input size parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed metrics in ${scheme}`, async () => {
        await setColorScheme(scheme);

        const { container: joyContainer } = render(
          <div data-testid={`joy-size-${size}`} style={{ width: 400 }}>
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyInput size={size} placeholder={size} />
            </JoyCssVarsProvider>
          </div>,
        );
        const { container: hintoricContainer } = render(
          <div data-testid={`hintoric-size-${size}`} style={{ width: 400 }}>
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricInput size={size} placeholder={size} />
            </ColorSchemeProvider>
          </div>,
        );

        const joyStyle = getComputedStyle(joyContainer.querySelector('input')!.parentElement as HTMLElement);
        const hintoricStyle = getComputedStyle(hintoricContainer.querySelector('input')!.parentElement as HTMLElement);

        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
        expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(hintoricStyle.height).toBe(joyStyle.height);
        expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
        expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
        expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.display).toBe(joyStyle.display);
        expect(hintoricStyle.width).toBe(joyStyle.width);

        // The <input> itself must fill the pill like Joy's (30/34/42px inside
        // the outlined border), not shrink to one line: it is the click target
        // and the box `:-webkit-autofill` paints, so a line-tall input left a
        // dead band above and below the text and an autofill stripe.
        const joyInput = getComputedStyle(joyContainer.querySelector('input')!);
        const hintoricInput = getComputedStyle(hintoricContainer.querySelector('input')!);
        expect(hintoricInput.height).toBe(joyInput.height);
        expect(hintoricInput.width).toBe(joyInput.width);
        expect(hintoricInput.lineHeight).toBe(joyInput.lineHeight);

        await expect(page.getByTestId(`joy-size-${size}`)).toMatchScreenshot(`input-size-${size}-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-size-${size}`)).toMatchScreenshot(`input-size-${size}-hintoric-${scheme}`);
      });
    }
  }
});
