import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, LinearProgress as JoyLinearProgress } from '@mui/joy';
import { LinearProgress as HintoricLinearProgress } from '../components/LinearProgress';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('LinearProgress visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed thickness in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyLinearProgress data-testid={`joy-${variant}-${color}`} variant={variant} color={color} determinate value={50} />
            </JoyCssVarsProvider>,
          );
          render(
            <HintoricLinearProgress
              data-testid={`hintoric-${variant}-${color}`}
              variant={variant}
              color={color}
              determinate
              value={50}
            />,
          );

          const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
          const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

          expect(hintoricStyle.minBlockSize).toBe(joyStyle.minBlockSize);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`linearprogress-${variant}-${color}-joy-${scheme}`);
          await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`linearprogress-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }
  }
});
