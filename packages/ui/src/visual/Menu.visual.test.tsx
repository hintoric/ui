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
import { lastShadowLayers } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Menu visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyDropdown open>
              <JoyMenuButton>Open</JoyMenuButton>
              <JoyMenu variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>
                <JoyMenuItem>Item 1</JoyMenuItem>
              </JoyMenu>
            </JoyDropdown>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricDropdown open>
            <HintoricMenuButton>Open</HintoricMenuButton>
            <HintoricMenu variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
              <HintoricMenuItem>Item 1</HintoricMenuItem>
            </HintoricMenu>
          </HintoricDropdown>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(lastShadowLayers(joyStyle.boxShadow, 2));

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`menu-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`menu-${variant}-${color}-hintoric`);
      });
    }
  }

  it('MenuButton defaults to the same styling as Button (outlined/neutral/md)', async () => {
    render(
      <JoyCssVarsProvider>
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

  it('MenuItem resting/selected states match Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
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
});
