import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Drawer as JoyDrawer } from '@mui/joy';
import { Drawer as HintoricDrawer } from '../components/Drawer';
import { lastShadowLayers } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Drawer visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyDrawer open anchor="left" variant={variant} color={color} slotProps={{ content: { 'data-testid': `joy-${variant}-${color}` } }}>
              {color}
            </JoyDrawer>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricDrawer open anchor="left" variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
            {color}
          </HintoricDrawer>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(lastShadowLayers(joyStyle.boxShadow, 2));

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`drawer-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`drawer-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const anchor of ['left', 'right', 'top', 'bottom'] as const) {
    it(`anchor=${anchor} matches Joy UI's computed dimensions`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyDrawer open anchor={anchor} slotProps={{ content: { 'data-testid': `joy-anchor-${anchor}` } }}>
            {anchor}
          </JoyDrawer>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricDrawer open anchor={anchor} data-testid={`hintoric-anchor-${anchor}`}>
          {anchor}
        </HintoricDrawer>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-anchor-${anchor}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-anchor-${anchor}`).element());

      expect(hintoricStyle.width).toBe(joyStyle.width);
      expect(hintoricStyle.height).toBe(joyStyle.height);
    });
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed width (horizontal anchor)`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyDrawer open anchor="left" size={size} slotProps={{ content: { 'data-testid': `joy-size-${size}` } }}>
            {size}
          </JoyDrawer>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricDrawer open anchor="left" size={size} data-testid={`hintoric-size-${size}`}>
          {size}
        </HintoricDrawer>,
      );

      expect(getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element()).width).toBe(
        getComputedStyle(page.getByTestId(`joy-size-${size}`).element()).width,
      );
    });
  }
});
