import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../components/Dropdown';
import { MenuButton as HintoricMenuButton } from '../components/MenuButton';
import { ColorSchemeMenu } from '../components/ColorSchemeMenu';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

// Exempt from the Joy parity cross-product for the same reason LocaleSwitcher
// is: Joy has no equivalent, and this brings no look of its own — it is
// Dropdown + MenuButton + Menu + MenuItem, each already fully Joy-compared.
// What a composition can still get wrong is pass-through and scheme handling.
describe('ColorSchemeMenu visual', () => {
  it.each(SIZES)('passes size %s through to the trigger', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid={`menu-${size}`} size={size} />
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="system">
        {/* A bare MenuButton throws: Base UI's Menu.Trigger needs a
            Menu.Root, which Dropdown provides. */}
        <Dropdown>
          <HintoricMenuButton data-testid={`reference-${size}`} size={size}>
            System
          </HintoricMenuButton>
        </Dropdown>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId(`menu-${size}`).element()).minHeight).toBe(
      getComputedStyle(page.getByTestId(`reference-${size}`).element()).minHeight,
    );
  });

  it('fills a fixed-width parent no wider than its content', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div style={{ width: 240 }}>
          <ColorSchemeMenu data-testid="menu" />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    // A header control must NOT stretch to its container the way a form field
    // does — Select's own regression was the opposite mistake, and this is the
    // sizing assertion the 2026-09-06 audit asked every file to carry.
    const style = getComputedStyle(page.getByTestId('menu').element());
    expect(style.display).toBe('inline-flex');
    expect(Number.parseFloat(style.width)).toBeLessThan(240);
  });

  it.each(COLOR_SCHEMES)('matches its own baseline closed in %s', async (scheme) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid="menu" />
      </ColorSchemeProvider>,
    );
    await setColorScheme(scheme);

    await expect(page.getByTestId('menu')).toMatchScreenshot(`colorschememenu-closed-${scheme}`);
  });

  it.each(COLOR_SCHEMES)('matches its own baseline open in %s', async (scheme) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid="menu" />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button'));
    await screen.findByText('Light');
    await setColorScheme(scheme);

    // The popup is portalled, so the trigger's own box does not contain it —
    // screenshotting the trigger would show a green test and no menu. Reaching
    // the popup at all is why the scheme lives on <html> rather than a wrapper.
    await expect(page.getByRole('menu')).toMatchScreenshot(`colorschememenu-open-${scheme}`);
  });

  it('actually changes appearance between the two schemes', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeMenu data-testid="menu" />
      </ColorSchemeProvider>,
    );

    await setColorScheme('light');
    const light = getComputedStyle(page.getByTestId('menu').element());
    const lightPair = [light.color, light.borderColor].join('|');

    await setColorScheme('dark');
    const dark = getComputedStyle(page.getByTestId('menu').element());
    const darkPair = [dark.color, dark.borderColor].join('|');

    expect(darkPair).not.toBe(lightPair);
  });
});
