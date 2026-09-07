import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, CircularProgress as JoyCircularProgress } from '@mui/joy';
import { CircularProgress as HintoricCircularProgress } from '../components/CircularProgress';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('CircularProgress visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed dimensions in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyCircularProgress data-testid={`joy-${variant}-${color}`} variant={variant} color={color} determinate value={60} />
            </JoyCssVarsProvider>,
          );
          render(
            <HintoricCircularProgress
              data-testid={`hintoric-${variant}-${color}`}
              variant={variant}
              color={color}
              determinate
              value={60}
            />,
          );

          const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
          const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

          expect(hintoricStyle.width).toBe(joyStyle.width);
          expect(hintoricStyle.height).toBe(joyStyle.height);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`circularprogress-${variant}-${color}-joy-${scheme}`);
          await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`circularprogress-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed dimensions in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyCircularProgress data-testid={`joy-size-${size}`} size={size} />
          </JoyCssVarsProvider>,
        );
        render(<HintoricCircularProgress data-testid={`hintoric-size-${size}`} size={size} />);

        expect(getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element()).width).toBe(
          getComputedStyle(page.getByTestId(`joy-size-${size}`).element()).width,
        );
      });
    }
  }
});
