import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { Dropdown } from '../components/Dropdown';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { ColorSchemeMenuItems } from '../components/ColorSchemeMenuItems';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

/*
 * The menu is rendered through BaseMenu.Portal, which mounts outside any
 * wrapper element — so the `data-color-scheme` wrapper used elsewhere in this
 * suite cannot reach it. Dark mode has to come from the real provider, driven
 * through the storage key it reads.
 */
function renderInHostMenu(mode: 'light' | 'dark') {
  window.localStorage.setItem('hintoric-color-scheme', mode);
  render(
    <ColorSchemeProvider>
      <Dropdown defaultOpen>
        <MenuButton>Account</MenuButton>
        <Menu>
          <ColorSchemeMenuItems />
        </Menu>
      </Dropdown>
    </ColorSchemeProvider>,
  );
}

function entries(): HTMLElement[] {
  return [...document.querySelectorAll('[role="menuitem"]')] as HTMLElement[];
}

describe('ColorSchemeMenuItems visual', () => {
  it('marks the chosen entry and only that one', async () => {
    renderInHostMenu('dark');
    await screen.findByText('System');
    await settleTransitions();

    const backgrounds = entries().map((entry) => getComputedStyle(entry).backgroundColor);

    expect(backgrounds).toHaveLength(3);
    // Stored mode is 'dark', so the third entry (system, light, dark) is the
    // chosen one and must be the only one with a distinct background.
    expect(backgrounds[2]).not.toBe(backgrounds[0]);
    expect(backgrounds[0]).toBe(backgrounds[1]);
  });

  it('sizes every entry icon identically', async () => {
    renderInHostMenu('light');
    await screen.findByText('System');
    await settleTransitions();

    const widths = entries().map((entry) => {
      const icon = entry.querySelector('svg');
      return getComputedStyle(icon as Element).width;
    });

    // ICON_SIZE_CLASS.sm is `size-5` = 20px. A 1em icon with no explicit size
    // would inherit the entry's font size and vary with `size`.
    expect(widths).toEqual(['20px', '20px', '20px']);
  });

  it('renders all three entries inside a host menu', async () => {
    renderInHostMenu('light');
    await screen.findByText('System');
    await settleTransitions();

    await expect(page.getByRole('menu')).toMatchScreenshot('colorschememenuitems-light');
  });

  it('renders all three entries in dark mode', async () => {
    renderInHostMenu('dark');
    await screen.findByText('System');
    await settleTransitions();

    await expect(page.getByRole('menu')).toMatchScreenshot('colorschememenuitems-dark');
  });
});
