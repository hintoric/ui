import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Radio as JoyRadio } from '@mui/joy';
import { Radio as HintoricRadio } from '../components/Radio';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Radio visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyRadio data-testid={`joy-${variant}-${color}`} variant={variant} color={color} />
            </JoyCssVarsProvider>,
          );
          render(<HintoricRadio data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color} />);

          const joyBox = page.getByTestId(`joy-${variant}-${color}`).element().querySelector('.MuiRadio-radio') as HTMLElement;
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyBox);
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.width).toBe(joyStyle.width);
          expect(hintoricStyle.height).toBe(joyStyle.height);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`radio-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricLocator).toMatchScreenshot(`radio-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    it(`keeps outlined fixed, only color toggles on checked (no variant/color props) in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyRadio data-testid="joy-default-checked" defaultChecked />
        </JoyCssVarsProvider>,
      );
      render(<HintoricRadio data-testid="hintoric-default-checked" defaultChecked />);

      const joyBox = page.getByTestId('joy-default-checked').element().querySelector('.MuiRadio-radio') as HTMLElement;
      const hintoricBox = page.getByTestId('hintoric-default-checked').element();

      expect(getComputedStyle(hintoricBox).borderColor).toBe(getComputedStyle(joyBox).borderColor);
    });

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed dimensions in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyRadio data-testid={`joy-size-${size}`} size={size} />
          </JoyCssVarsProvider>,
        );
        render(<HintoricRadio data-testid={`hintoric-size-${size}`} size={size} />);

        const joyBox = page.getByTestId(`joy-size-${size}`).element().querySelector('.MuiRadio-radio') as HTMLElement;
        const hintoricBox = page.getByTestId(`hintoric-size-${size}`).element();

        expect(getComputedStyle(hintoricBox).width).toBe(getComputedStyle(joyBox).width);
      });
    }

    it(`shows the same focus-visible outline as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyRadio data-testid="joy-focus" />
        </JoyCssVarsProvider>,
      );
      render(<HintoricRadio data-testid="hintoric-focus" />);

      const joyEl = page.getByTestId('joy-focus').element().querySelector('input') as HTMLInputElement;
      const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

      joyEl.focus();
      await settleTransitions();
      const joyOutline = getComputedStyle(joyEl.parentElement!).outline;
      joyEl.blur();

      hintoricEl.focus();
      await settleTransitions();
      const hintoricOutline = getComputedStyle(hintoricEl).outline;
      hintoricEl.blur();

      expect(hintoricOutline).toBe(joyOutline);
    });
  }
});
