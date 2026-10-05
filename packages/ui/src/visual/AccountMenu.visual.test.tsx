import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountMenu } from '../components/AccountMenu';
import { MenuItem } from '../components/MenuItem';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

// AccountMenu is exempt from the "compare against real @mui/joy" rule: Joy has
// no account menu, and the component brings no look of its own. It is
// FloatingBar + Avatar + FloatingBarMenuButton + Menu + MenuItem + ListDivider
// + Typography + ColorSchemeMenuItems, each of which carries its own coverage
// (Joy-compared where Joy has the part; FloatingBar and ColorSchemeMenuItems
// self-baselined, since Joy has neither).
//
// The exemption is from the parity comparison, not from colour-scheme
// coverage. What a composition can still get wrong is layout and passing
// things through, so that is what these check: a self-baseline screenshot per
// view and scheme, that dark differs from light, that the card truncates
// inside the menu's fixed width, and that keyboard focus survives a view swap.

const locales = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en-US', label: 'English' },
];

function Subject() {
  return (
    <AccountMenu
      user={{ email: 'erika.mustermann@example.com' }}
      subtitle="Muster & Söhne GmbH"
      locales={locales}
      locale="de-DE"
      onLocaleChange={() => {}}
      items={<MenuItem>Layouts</MenuItem>}
      onSignOut={() => {}}
    />
  );
}

async function renderOpen(scheme: (typeof COLOR_SCHEMES)[number]) {
  await setColorScheme(scheme);
  const user = userEvent.setup();
  render(
    <ColorSchemeProvider defaultMode={scheme}>
      <Subject />
    </ColorSchemeProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Account' }));
  await screen.findByRole('menu');
  return user;
}

describe('AccountMenu visual (self-baseline)', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`pill matches its own ${scheme} baseline screenshot`, async () => {
      await setColorScheme(scheme);
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <Subject />
        </ColorSchemeProvider>,
      );
      await expect(page.getByRole('toolbar')).toMatchScreenshot(`account-menu-pill-${scheme}`);
    });

    it(`top view matches its own ${scheme} baseline screenshot`, async () => {
      await renderOpen(scheme);
      // The popup is portalled to body, outside the pill's box — hence the
      // menu's own role, and the scheme as document state.
      await expect(page.getByRole('menu')).toMatchScreenshot(`account-menu-root-${scheme}`);
    });

    it(`appearance view matches its own ${scheme} baseline screenshot`, async () => {
      await renderOpen(scheme);
      // A real pointer click, not userEvent's synthetic one: whether the back
      // row then draws a focus ring depends on the browser's input modality.
      await page.getByRole('menuitem', { name: /Appearance/ }).click();
      await screen.findByRole('menuitem', { name: 'Dark' });
      await settleTransitions();
      await expect(page.getByRole('menu')).toMatchScreenshot(`account-menu-appearance-${scheme}`);
    });

    it(`language view matches its own ${scheme} baseline screenshot`, async () => {
      await renderOpen(scheme);
      await page.getByRole('menuitem', { name: /Language/ }).click();
      await screen.findByRole('menuitem', { name: 'English' });
      await settleTransitions();
      await expect(page.getByRole('menu')).toMatchScreenshot(`account-menu-language-${scheme}`);
    });
  }

  /**
   * The assertion a PNG cannot make: that the pill and the popup read scheme
   * tokens. Same elements, only the document's scheme flips.
   */
  it('reads colour-scheme tokens rather than fixed colours', async () => {
    await renderOpen('light');
    const bar = screen.getByRole('toolbar');
    const menu = screen.getByRole('menu');
    const card = screen.getByText('erika.mustermann@example.com');
    const read = () =>
      [bar, menu, card].map((element) => {
        const s = getComputedStyle(element);
        return [s.backgroundColor, s.color, s.borderTopColor].join('|');
      });

    const light = read();
    await setColorScheme('dark');
    await settleTransitions();
    const dark = read();

    for (let i = 0; i < light.length; i++) expect(dark[i]).not.toBe(light[i]);
  });

  /**
   * The menu has a fixed width so the popup does not jump between views; a
   * long address must then end in an ellipsis rather than widen it or spill.
   */
  it('keeps a fixed width and truncates a long address on the card', async () => {
    await setColorScheme('light');
    const user = userEvent.setup();
    render(
      <ColorSchemeProvider defaultMode="light">
        <AccountMenu user={{ email: 'a-very-long-address-that-no-menu-should-grow-for@example.com' }} />
      </ColorSchemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    const menu = await screen.findByRole('menu');
    const email = screen.getByText(/a-very-long-address/);

    expect(getComputedStyle(menu).width).toBe('288px');
    const s = getComputedStyle(email);
    expect(s.display).toBe('block');
    expect(s.textOverflow).toBe('ellipsis');
    expect(s.whiteSpace).toBe('nowrap');
    expect(email.scrollWidth).toBeGreaterThan(email.clientWidth);
    expect(email.getBoundingClientRect().right).toBeLessThanOrEqual(menu.getBoundingClientRect().right);
  });

  /**
   * The card's type scale comes from Typography's levels; this pins that the
   * composition does not override it.
   */
  it('sets the card in title-md over body-sm', async () => {
    await renderOpen('light');
    const title = getComputedStyle(screen.getByText('erika.mustermann@example.com'));
    const subtitle = getComputedStyle(screen.getByText('Muster & Söhne GmbH'));
    expect([title.fontSize, title.fontWeight]).toEqual(['16px', '500']);
    expect([subtitle.fontSize, subtitle.fontWeight]).toEqual(['14px', '400']);
    expect(parseFloat(title.lineHeight)).toBeCloseTo(24, 0);
  });

  /**
   * Keyboard focus is the interactive state this component owns: the row that
   * was activated unmounts with its view. Focus lands on the back row — and is
   * drawn there, as Base UI's highlight — and returns to the row that opened
   * the view, so the arrow keys keep working throughout.
   */
  it('keeps keyboard focus inside the menu across a view swap', async () => {
    const user = await renderOpen('light');
    const row = screen.getByRole('menuitem', { name: /Appearance/ });
    row.focus();
    await user.keyboard('{Enter}');

    const back = await screen.findByRole('menuitem', { name: 'Back' });
    expect(back).toHaveFocus();
    expect(back.matches(':focus-visible')).toBe(true);
    await settleTransitions();
    expect(back).toHaveAttribute('data-highlighted');
    const highlighted = getComputedStyle(back).backgroundColor;
    expect(highlighted).not.toBe(getComputedStyle(screen.getByRole('menuitem', { name: 'Light' })).backgroundColor);

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'System' })).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Appearance/ })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: /Appearance/ })).toHaveTextContent('Light');
  });

  /**
   * Script focus from the body counts as keyboard focus to the browser, so
   * without care a mouse click would leave a focus ring on the back row.
   */
  it('draws no focus ring on the back row after a pointer click', async () => {
    await renderOpen('light');
    await page.getByRole('menuitem', { name: /Appearance/ }).click();
    const back = await screen.findByRole('menuitem', { name: 'Back' });
    expect(back).toHaveFocus();
    expect(back.matches(':focus-visible')).toBe(false);
  });

  /** The pill passes size on to the button beside the avatar. */
  it('passes size through to the menu button', async () => {
    const heights: string[] = [];
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <AccountMenu user={{ email: 'max@example.com' }} appearance={false} size={size} />,
      );
      heights.push(getComputedStyle(screen.getByRole('button', { name: 'Account' })).height);
      unmount();
    }
    expect(new Set(heights).size).toBe(3);
  });
});
