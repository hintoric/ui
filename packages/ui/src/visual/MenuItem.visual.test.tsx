import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Dropdown as JoyDropdown,
  MenuButton as JoyMenuButton,
  Menu as JoyMenu,
  MenuItem as JoyMenuItem,
} from '@mui/joy';
import { Dropdown as HintoricDropdown } from '../components/Dropdown';
import { MenuButton as HintoricMenuButton } from '../components/MenuButton';
import { Menu as HintoricMenu } from '../components/Menu';
import { MenuItem as HintoricMenuItem } from '../components/MenuItem';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// MenuItem only exists inside an open Menu, and that Menu is portalled to
// <body> — which makes this file one of the direct reasons the colour scheme
// is document state rather than a wrapper. A wrapper scope would leave these
// items rendering light inside every dark test, and the test would pass.
//
// Both dropdowns are rendered `open` so the items are in the document.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('MenuItem visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyDropdown open>
                <JoyMenuButton>Open</JoyMenuButton>
                <JoyMenu>
                  <JoyMenuItem
                    variant={variant}
                    color={color}
                    data-testid={`joy-${variant}-${color}`}
                  >
                    Item
                  </JoyMenuItem>
                </JoyMenu>
              </JoyDropdown>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricDropdown open>
                <HintoricMenuButton>Open</HintoricMenuButton>
                <HintoricMenu>
                  <HintoricMenuItem
                    variant={variant}
                    color={color}
                    data-testid={`hintoric-${variant}-${color}`}
                  >
                    Item
                  </HintoricMenuItem>
                </HintoricMenu>
              </HintoricDropdown>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(joyLocator).toMatchScreenshot(`menuitem-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricLocator).toMatchScreenshot(
            `menuitem-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * `selected` is MenuItem's own state — the one thing it adds over the
     * ListItemButton it is built from. If it collapsed to the resting style,
     * a menu would give no feedback about the current choice.
     */
    it(`renders the selected state differently from resting in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricDropdown open>
            <HintoricMenuButton>Open</HintoricMenuButton>
            <HintoricMenu>
              <HintoricMenuItem data-testid="resting">Resting</HintoricMenuItem>
              <HintoricMenuItem selected data-testid="selected">
                Selected
              </HintoricMenuItem>
            </HintoricMenu>
          </HintoricDropdown>
        </ColorSchemeProvider>,
      );

      const resting = getComputedStyle(page.getByTestId('resting').element());
      const selected = getComputedStyle(page.getByTestId('selected').element());

      expect([selected.backgroundColor, selected.color]).not.toEqual([
        resting.backgroundColor,
        resting.color,
      ]);
    });
  }

  /**
   * The assertion that justifies document-level scheme state: this element is
   * inside a portal on <body>, outside every provider wrapper. If the scheme
   * ever stops reaching portals, this fails while the resting-state tests
   * above keep passing.
   */
  it('resolves dark tokens inside its portal', async () => {
    await setColorScheme('light');
    render(
      <ColorSchemeProvider defaultMode="light">
        <HintoricDropdown open>
          <HintoricMenuButton>Open</HintoricMenuButton>
          <HintoricMenu>
            <HintoricMenuItem data-testid="portal-item">Item</HintoricMenuItem>
          </HintoricMenu>
        </HintoricDropdown>
      </ColorSchemeProvider>,
    );

    const el = page.getByTestId('portal-item').element();
    expect(el.closest('[data-color-scheme]')).toBe(document.documentElement);

    const light = getComputedStyle(el).color;
    await setColorScheme('dark');

    expect(getComputedStyle(el).color).not.toBe(light);
  });
});
