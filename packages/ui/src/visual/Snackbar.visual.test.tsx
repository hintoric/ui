import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Snackbar as JoySnackbar } from '@mui/joy';
import { Snackbar as HintoricSnackbar } from '../components/Snackbar';
import { lastShadowLayers } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Snackbar visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoySnackbar open variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>
              {color}
            </JoySnackbar>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricSnackbar open variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
            {color}
          </HintoricSnackbar>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.padding).toBe(joyStyle.padding);
        expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(lastShadowLayers(joyStyle.boxShadow, 2));

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`snackbar-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`snackbar-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed padding and min-width`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoySnackbar open size={size} data-testid={`joy-size-${size}`}>
            {size}
          </JoySnackbar>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricSnackbar open size={size} data-testid={`hintoric-size-${size}`}>
          {size}
        </HintoricSnackbar>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

      expect(hintoricStyle.padding).toBe(joyStyle.padding);
      expect(hintoricStyle.minWidth).toBe(joyStyle.minWidth);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    });
  }

  const ANCHORS = [
    { vertical: 'top', horizontal: 'left' },
    { vertical: 'top', horizontal: 'center' },
    { vertical: 'bottom', horizontal: 'right' },
  ] as const;

  for (const anchorOrigin of ANCHORS) {
    it(`anchorOrigin=${anchorOrigin.vertical}/${anchorOrigin.horizontal} matches Joy UI's computed position`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoySnackbar open anchorOrigin={anchorOrigin} data-testid={`joy-anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`}>
            anchor
          </JoySnackbar>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricSnackbar
          open
          anchorOrigin={anchorOrigin}
          data-testid={`hintoric-anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`}
        >
          anchor
        </HintoricSnackbar>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`).element());
      const hintoricStyle = getComputedStyle(
        page.getByTestId(`hintoric-anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`).element(),
      );

      // Only assert the offset each anchor actually sets (matching Joy's own
      // conditional CSS) — the opposite, unset side resolves to `auto` and its
      // "used value" is derived from the element's rendered box height/width,
      // which can differ by a sub-pixel rounding between two independently
      // rendered elements even when every real style is identical.
      if (anchorOrigin.vertical === 'top') {
        expect(hintoricStyle.top).toBe(joyStyle.top);
      } else {
        expect(hintoricStyle.bottom).toBe(joyStyle.bottom);
      }
      if (anchorOrigin.horizontal === 'left') {
        expect(hintoricStyle.left).toBe(joyStyle.left);
      } else if (anchorOrigin.horizontal === 'right') {
        expect(hintoricStyle.right).toBe(joyStyle.right);
      } else {
        // Tailwind v4's `-translate-x-1/2` sets the standalone `translate`
        // CSS property, not the `transform` shorthand Joy's own CSS uses —
        // comparing bounding-rect horizontal centers verifies the same
        // visual result regardless of which mechanism produced it.
        const joyRect = page.getByTestId(`joy-anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`).element().getBoundingClientRect();
        const hintoricRect = page
          .getByTestId(`hintoric-anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`)
          .element()
          .getBoundingClientRect();
        expect(Math.round(hintoricRect.left + hintoricRect.width / 2)).toBe(Math.round(joyRect.left + joyRect.width / 2));
      }
    });
  }
});
