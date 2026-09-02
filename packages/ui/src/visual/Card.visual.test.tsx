import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Card as JoyCard } from '@mui/joy';
import { Card as HintoricCard } from '../components/Card';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Card is a non-interactive Sheet composition (adds its own radius + padding
// on top of the bare, radius-less Sheet) — no focus/hover states to cover.
describe('Card visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyCard data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </JoyCard>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricCard data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricCard>
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

        await expect(joyLocator).toMatchScreenshot(`card-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`card-${variant}-${color}-hintoric`);
      });
    }
  }
});
