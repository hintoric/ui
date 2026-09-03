import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Alert as JoyAlert } from '@mui/joy';
import { Alert as HintoricAlert } from '../components/Alert';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Alert is non-interactive — no focus state to cover, just the variant x
// color x size matrix.
describe('Alert visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyAlert data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </JoyAlert>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricAlert data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricAlert>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
        const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyLocator.element());
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
        expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.padding).toBe(joyStyle.padding);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);

        await expect(joyLocator).toMatchScreenshot(`alert-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`alert-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed padding`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyAlert data-testid={`joy-size-${size}`} size={size}>
            {size}
          </JoyAlert>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <HintoricAlert data-testid={`hintoric-size-${size}`} size={size}>
            {size}
          </HintoricAlert>
        </ColorSchemeProvider>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

      expect(hintoricStyle.padding).toBe(joyStyle.padding);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    });
  }
});
