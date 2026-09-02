import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Button as JoyButton } from '@mui/joy';
import { Button as HintoricButton } from '../components/Button';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
// A representative subset, not the full 4x5 matrix — colors mostly just swap
// which token the same formula reads from (already covered exhaustively by
// colorVariantClasses.test.ts), so this checks that the formula itself
// renders correctly against real Joy UI for two colors, not all five.
const COLORS = ['primary', 'neutral'] as const;

describe('Button visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyButton data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </JoyButton>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricButton data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricButton>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
        const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyLocator.element());
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        // The actual pass/fail: exact computed CSS values must match. Two
        // different styling engines (Emotion vs Tailwind utilities) can and
        // do produce byte-identical computed styles when they encode the
        // same underlying values — that's the whole point of this check.
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
        expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
        expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

        // Real, committed screenshots via Vitest's own visual regression
        // feature — for humans to review, not the pass/fail signal above.
        await expect(joyLocator).toMatchScreenshot(`button-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`button-${variant}-${color}-hintoric`);
      });
    }
  }
});
