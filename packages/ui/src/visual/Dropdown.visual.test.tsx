import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown as HintoricDropdown } from '../components/Dropdown';
import { MenuButton as HintoricMenuButton } from '../components/MenuButton';
import { Menu as HintoricMenu } from '../components/Menu';
import { MenuItem as HintoricMenuItem } from '../components/MenuItem';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Dropdown is exempt from this suite's usual "compare against real @mui/joy"
// rule for the same reason LocaleSwitcher is, only more so: it renders no DOM
// at all. Joy's Dropdown is a re-export of a headless context provider, and
// ours wraps Base UI's Menu.Root — there is no element to compare and no look
// to screenshot. A parity comparison would assert nothing.
//
// It also gets no self-baseline screenshot: there is nothing to photograph.
// What it can get wrong is its actual job — letting a MenuButton and a Menu
// coordinate open state without prop-drilling — so that is what these check,
// in both schemes, because a context provider that behaved differently per
// scheme would be a genuine surprise.

const items = ['Alpha', 'Beta'];

describe('Dropdown visual (no DOM of its own)', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`renders no element of its own in ${scheme}`, async () => {
      await setColorScheme(scheme);

      const { container } = render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricDropdown>
            <HintoricMenuButton data-testid="trigger">Open</HintoricMenuButton>
            <HintoricMenu>
              {items.map((item) => (
                <HintoricMenuItem key={item}>{item}</HintoricMenuItem>
              ))}
            </HintoricMenu>
          </HintoricDropdown>
        </ColorSchemeProvider>,
      );

      // ColorSchemeProvider's own wrapper div, then straight to the trigger:
      // no Dropdown element in between.
      const providerDiv = container.firstElementChild as HTMLElement;
      expect(providerDiv.children).toHaveLength(1);
      expect(providerDiv.firstElementChild).toBe(screen.getByTestId('trigger'));
    });

    it(`connects the trigger to the portalled menu in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const user = userEvent.setup();

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricDropdown>
            <HintoricMenuButton>Open</HintoricMenuButton>
            <HintoricMenu>
              {items.map((item) => (
                <HintoricMenuItem key={item}>{item}</HintoricMenuItem>
              ))}
            </HintoricMenu>
          </HintoricDropdown>
        </ColorSchemeProvider>,
      );

      expect(screen.queryByRole('menu')).toBeNull();

      await user.click(screen.getByRole('button'));
      await screen.findByText('Beta');

      expect(screen.getByRole('menu')).toBeTruthy();
    });

    /**
     * `open` as a controlled prop is the half a consumer reaches for when the
     * menu's state lives in their own store. If it were swallowed, the menu
     * would never open and no styling test would notice.
     */
    it(`honours a controlled open prop in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricDropdown open>
            <HintoricMenuButton>Open</HintoricMenuButton>
            <HintoricMenu>
              {items.map((item) => (
                <HintoricMenuItem key={item}>{item}</HintoricMenuItem>
              ))}
            </HintoricMenu>
          </HintoricDropdown>
        </ColorSchemeProvider>,
      );

      expect(await screen.findByRole('menu')).toBeTruthy();
    });
  }
});
