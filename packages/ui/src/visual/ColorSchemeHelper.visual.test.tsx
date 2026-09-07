import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Sheet as JoySheet } from '@mui/joy';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { Dropdown } from '../components/Dropdown';
import { MenuButton } from '../components/MenuButton';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// This file tests the test infrastructure, not a component. It exists because
// the whole 80-file retrofit rests on two claims that are cheap to assert once
// and expensive to discover wrong in file 47.
describe('setColorScheme', () => {
  it('exposes exactly light and dark', () => {
    expect([...COLOR_SCHEMES]).toEqual(['light', 'dark']);
  });

  it("puts both our tokens and Joy's on the document element", async () => {
    await setColorScheme('dark');

    const root = document.documentElement;
    expect(root.getAttribute('data-color-scheme')).toBe('dark');
    expect(root.getAttribute('data-joy-color-scheme')).toBe('dark');
  });

  /**
   * The reason this mechanism was chosen over the wrapper-div scopes in
   * darkMode.tsx. A portalled popup mounts on <body>, outside any wrapper, so
   * only a document-level attribute reaches it. If this ever regresses, every
   * overlay component's dark coverage silently becomes light coverage.
   */
  it('reaches portalled content', async () => {
    await setColorScheme('dark');
    render(
      <ColorSchemeProvider defaultMode="dark">
        <Dropdown defaultOpen>
          <MenuButton>open</MenuButton>
          <Menu data-testid="portalled-menu">
            <MenuItem>item</MenuItem>
          </Menu>
        </Dropdown>
      </ColorSchemeProvider>,
    );

    const menu = page.getByTestId('portalled-menu').element();
    // The popup is outside the provider's own wrapper div...
    expect(menu.closest('[data-color-scheme]')).toBe(document.documentElement);
    // ...and still resolves the dark surface token rather than the light one.
    // Menu's default outlined/neutral uses `bg-surface-popup`, which is
    // --color-common-black in dark mode (theme.css) and white in light.
    expect(getComputedStyle(menu).backgroundColor).toBe('rgb(0, 0, 0)');
  });

  /**
   * Joy is the oracle for Flavour A, so Joy has to actually be dark when we
   * say dark — not merely carry the attribute.
   */
  it('switches real @mui/joy too', async () => {
    await setColorScheme('light');
    render(
      <JoyCssVarsProvider defaultMode="light">
        <JoySheet data-testid="joy-light">x</JoySheet>
      </JoyCssVarsProvider>,
    );
    const lightBg = getComputedStyle(page.getByTestId('joy-light').element()).backgroundColor;

    await setColorScheme('dark');
    const darkBg = getComputedStyle(page.getByTestId('joy-light').element()).backgroundColor;

    expect(darkBg).not.toBe(lightBg);
  });
});
