import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Sheet as JoySheet } from '@mui/joy';
import { Sheet as HintoricSheet } from '../components/Sheet';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Sheet is a non-interactive surface primitive — no focus/hover states to
// cover, just the variant x color background/border/text matrix.
describe('Sheet visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoySheet data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </JoySheet>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricSheet data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricSheet>
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

        await expect(joyLocator).toMatchScreenshot(`sheet-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`sheet-${variant}-${color}-hintoric`);
      });
    }
  }
});
