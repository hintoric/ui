import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Chip as JoyChip } from '@mui/joy';
import { Chip as HintoricChip } from '../components/Chip';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Chip is non-interactive by default in this implementation (no clickable/
// onClick mode yet, matching what most Joy UI usage looks like) — no focus
// state to cover, just the variant x color x size matrix.
describe('Chip visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyChip data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </JoyChip>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricChip data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricChip>
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
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);

        await expect(joyLocator).toMatchScreenshot(`chip-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`chip-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed height`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyChip data-testid={`joy-size-${size}`} size={size}>
            {size}
          </JoyChip>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <HintoricChip data-testid={`hintoric-size-${size}`} size={size}>
            {size}
          </HintoricChip>
        </ColorSchemeProvider>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

      expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
      expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    });
  }
});
