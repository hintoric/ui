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
import { COLOR_SCHEMES, lastShadowLayers, setColorScheme, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Menu visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          // Rendered one at a time, not side by side. Both popups portal to
          // <body> and are positioned against their own trigger, so with both
          // mounted they overlap — and an element screenshot captures the real
          // page, so each one's image picked up a sliver of the other. That is
          // why twenty of Joy's reference images changed when only our Button
          // changed (2026-09-07). Joy is the oracle; its baselines must not
          // contain our pixels.
          const joyRender = render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyDropdown open>
                <JoyMenuButton>Open</JoyMenuButton>
                <JoyMenu variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>
                  <JoyMenuItem>Item 1</JoyMenuItem>
                </JoyMenu>
              </JoyDropdown>
            </JoyCssVarsProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const joyComputed = getComputedStyle(joyLocator.element());
          const joyStyle = {
            backgroundColor: joyComputed.backgroundColor,
            color: joyComputed.color,
            borderRadius: joyComputed.borderRadius,
            boxShadow: joyComputed.boxShadow,
            fontSize: joyComputed.fontSize,
            fontWeight: joyComputed.fontWeight,
            lineHeight: joyComputed.lineHeight,
          };
          // Base UI's popup animates on open, so a capture taken straight
          // after mount races it — 107 pixels of drift between runs,
          // measured 2026-09-07, repeatably and on solid variants first.
          await settleTransitions();
          await expect(joyLocator).toMatchScreenshot(`menu-${variant}-${color}-joy-${scheme}`);
          joyRender.unmount();

          render(
            <HintoricDropdown open>
              <HintoricMenuButton>Open</HintoricMenuButton>
              <HintoricMenu variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
                <HintoricMenuItem>Item 1</HintoricMenuItem>
              </HintoricMenu>
            </HintoricDropdown>,
          );

          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(
            lastShadowLayers(joyStyle.boxShadow, 2),
          );
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await settleTransitions();
          await expect(hintoricLocator).toMatchScreenshot(`menu-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    it(`MenuButton defaults to the same styling as Button (outlined/neutral/md) in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyDropdown>
            <JoyMenuButton data-testid="joy-button">Open</JoyMenuButton>
            <JoyMenu>
              <JoyMenuItem>Item 1</JoyMenuItem>
            </JoyMenu>
          </JoyDropdown>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricDropdown>
          <HintoricMenuButton data-testid="hintoric-button">Open</HintoricMenuButton>
          <HintoricMenu>
            <HintoricMenuItem>Item 1</HintoricMenuItem>
          </HintoricMenu>
        </HintoricDropdown>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-button').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-button').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
      expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
    });

    it(`MenuItem resting/selected states match Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyDropdown open>
            <JoyMenuButton>Open</JoyMenuButton>
            <JoyMenu>
              <JoyMenuItem data-testid="joy-resting">Alpha</JoyMenuItem>
              <JoyMenuItem selected data-testid="joy-selected">
                Beta
              </JoyMenuItem>
            </JoyMenu>
          </JoyDropdown>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricDropdown open>
          <HintoricMenuButton>Open</HintoricMenuButton>
          <HintoricMenu>
            <HintoricMenuItem data-testid="hintoric-resting">Alpha</HintoricMenuItem>
            <HintoricMenuItem selected data-testid="hintoric-selected">
              Beta
            </HintoricMenuItem>
          </HintoricMenu>
        </HintoricDropdown>,
      );

      const joyRestingStyle = getComputedStyle(page.getByTestId('joy-resting').element());
      const hintoricRestingStyle = getComputedStyle(page.getByTestId('hintoric-resting').element());
      expect(hintoricRestingStyle.backgroundColor).toBe(joyRestingStyle.backgroundColor);
      expect(hintoricRestingStyle.color).toBe(joyRestingStyle.color);

      const joySelectedStyle = getComputedStyle(page.getByTestId('joy-selected').element());
      const hintoricSelectedStyle = getComputedStyle(page.getByTestId('hintoric-selected').element());
      expect(hintoricSelectedStyle.backgroundColor).toBe(joySelectedStyle.backgroundColor);
      expect(hintoricSelectedStyle.backgroundColor).not.toBe(hintoricRestingStyle.backgroundColor);
    });
  }
});
