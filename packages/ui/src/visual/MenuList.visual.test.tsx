import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  MenuList as JoyMenuList,
  MenuItem as JoyMenuItem,
} from '@mui/joy';
import { MenuList as HintoricMenuList } from '../components/MenuList';
import { ListItemButton as HintoricListItemButton } from '../components/ListItemButton';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, lastShadowLayers, setColorScheme } from './helpers';

// MenuList is the standalone list surface — the same look as Menu's popup but
// without the portal and positioning, for callers who place it themselves.
// Rendered inline on both sides, which is what distinguishes this file from
// Menu's: no portal is involved, so a wrapper-scoped test would have passed
// here and failed for Menu. Both files exist for that reason.
//
// Its items are plain list items rather than MenuItem on our side, because
// our MenuItem is a Base UI menu part that needs a Menu.Root context;
// MenuList's own contract is the surface, not the items.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('MenuList visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyMenuList
                variant={variant}
                color={color}
                data-testid={`joy-${variant}-${color}`}
              >
                <JoyMenuItem>Item</JoyMenuItem>
              </JoyMenuList>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricMenuList
                variant={variant}
                color={color}
                data-testid={`hintoric-${variant}-${color}`}
              >
                <HintoricListItemButton>Item</HintoricListItemButton>
              </HintoricMenuList>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.padding).toBe(joyStyle.padding);
          expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(
            lastShadowLayers(joyStyle.boxShadow, 2),
          );

          await expect(joyLocator).toMatchScreenshot(`menulist-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricLocator).toMatchScreenshot(
            `menulist-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * A list surface must not shrink to its content — a menu narrower than its
     * items clips them. This is P2 of the 2026-09-06 coverage audit, and a
     * surface component is exactly where it found divergences before.
     */
    it(`matches Joy UI's list semantics and sizing in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 320 }}>
            <JoyMenuList data-testid="joy-sized">
              <JoyMenuItem>Item</JoyMenuItem>
            </JoyMenuList>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 320 }}>
            <HintoricMenuList data-testid="hintoric-sized">
              <HintoricListItemButton>Item</HintoricListItemButton>
            </HintoricMenuList>
          </div>
        </ColorSchemeProvider>,
      );

      const joyEl = page.getByTestId('joy-sized').element();
      const hintoricEl = page.getByTestId('hintoric-sized').element();

      expect(hintoricEl.tagName).toBe(joyEl.tagName);
      expect(getComputedStyle(hintoricEl).listStyleType).toBe(
        getComputedStyle(joyEl).listStyleType,
      );
      expect(hintoricEl.getBoundingClientRect().width).toBeCloseTo(
        joyEl.getBoundingClientRect().width,
        1,
      );
    });
  }
});
