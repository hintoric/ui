import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
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
import { COLOR_SCHEMES, settleTransitions, setColorScheme } from './helpers';

// MenuButton is the dropdown's trigger, and it reuses Button's variants
// wholesale (`buttonVariants` in MenuButton.tsx) — which is exactly why it
// needs its own file rather than relying on Button's. When Button's type scale
// was fixed on 2026-09-07, MenuButton's width changed with it and four test
// files went red; nothing had been asserting MenuButton itself.
//
// Composed inside a real Dropdown, since the trigger only exists there.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('MenuButton visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyDropdown>
                <JoyMenuButton
                  variant={variant}
                  color={color}
                  data-testid={`joy-${variant}-${color}`}
                >
                  Open
                </JoyMenuButton>
                <JoyMenu>
                  <JoyMenuItem>Item</JoyMenuItem>
                </JoyMenu>
              </JoyDropdown>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricDropdown>
                <HintoricMenuButton
                  variant={variant}
                  color={color}
                  data-testid={`hintoric-${variant}-${color}`}
                >
                  Open
                </HintoricMenuButton>
                <HintoricMenu>
                  <HintoricMenuItem>Item</HintoricMenuItem>
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
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(joyLocator).toMatchScreenshot(
            `menubutton-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `menubutton-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * `size` reaching the trigger is what LocaleSwitcher's own test checks
     * indirectly; here it is checked against Joy's actual dimensions, per
     * size, because the type scale differs per step and a single wrong entry
     * shows up nowhere else.
     */
    it(`matches Joy UI's dimensions at every size in ${scheme}`, async () => {
      await setColorScheme(scheme);

      for (const size of SIZES) {
        const joy = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyDropdown>
              <JoyMenuButton size={size} data-testid="joy-size">
                Open
              </JoyMenuButton>
              <JoyMenu>
                <JoyMenuItem>Item</JoyMenuItem>
              </JoyMenu>
            </JoyDropdown>
          </JoyCssVarsProvider>,
        );
        const joyStyle = getComputedStyle(screen.getByTestId('joy-size'));
        const joyMetrics = [joyStyle.minHeight, joyStyle.fontSize, joyStyle.fontWeight].join('|');
        joy.unmount();

        const ours = render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricDropdown>
              <HintoricMenuButton size={size} data-testid="hintoric-size">
                Open
              </HintoricMenuButton>
              <HintoricMenu>
                <HintoricMenuItem>Item</HintoricMenuItem>
              </HintoricMenu>
            </HintoricDropdown>
          </ColorSchemeProvider>,
        );
        const s = getComputedStyle(screen.getByTestId('hintoric-size'));
        const hintoricMetrics = [s.minHeight, s.fontSize, s.fontWeight].join('|');
        ours.unmount();

        expect(hintoricMetrics, `size=${size}`).toBe(joyMetrics);
      }
    });

    it(`shows the same focus-visible outline as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyDropdown>
            <JoyMenuButton data-testid="joy-focus">Open</JoyMenuButton>
            <JoyMenu>
              <JoyMenuItem>Item</JoyMenuItem>
            </JoyMenu>
          </JoyDropdown>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricDropdown>
            <HintoricMenuButton data-testid="hintoric-focus">Open</HintoricMenuButton>
            <HintoricMenu>
              <HintoricMenuItem>Item</HintoricMenuItem>
            </HintoricMenu>
          </HintoricDropdown>
        </ColorSchemeProvider>,
      );

      const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
      const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

      joyEl.focus();
      await settleTransitions();
      const joyOutline = getComputedStyle(joyEl).outlineWidth;
      joyEl.blur();

      hintoricEl.focus();
      await settleTransitions();
      const hintoricOutline = getComputedStyle(hintoricEl).outlineWidth;
      hintoricEl.blur();

      expect(hintoricOutline).toBe(joyOutline);
    });
  }
});
