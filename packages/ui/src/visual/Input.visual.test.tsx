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
            <div data-testid={`joy-${variant}-${color}`}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyInput variant={variant} color={color} placeholder={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-${variant}-${color}`}>
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
