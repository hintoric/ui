import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleSwitcher } from '../components/LocaleSwitcher';

// LocaleSwitcher is exempt from this suite's usual "compare against real
// @mui/joy" rule (see docs/superpowers/specs/2026-09-06-locale-switcher-design.md):
// Joy UI has no equivalent, and more to the point the component brings no look
// of its own — it is Dropdown + MenuButton + Menu + MenuItem, each of which
// already carries full Joy-compared coverage. A second comparison would assert
// the same computed styles twice.
//
// What a composition can still get wrong is passing things through, so that is
// what these check: self-baseline screenshots, plus size actually reaching the
// button.

const locales = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

describe('LocaleSwitcher visual (self-baseline)', () => {
  it('closed state matches its own baseline screenshot', async () => {
    render(<LocaleSwitcher locales={locales} value="de" onChange={() => {}} />);

    await expect(page.getByRole('button')).toMatchScreenshot('locale-switcher-closed');
  });

  it('open menu matches its own baseline screenshot', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher locales={locales} value="de" onChange={() => {}} />);

    await user.click(screen.getByRole('button'));
    await screen.findByText('English');

    // The popup lives in a portal, so the button's own box does not contain it
    // — screenshotting the button would show a green test and no menu. The
    // portal is still in the document, reachable by its role.
    await expect(page.getByRole('menu')).toMatchScreenshot('locale-switcher-open');
  });

  /**
   * The one thing a composition genuinely gets wrong: swallowing a prop
   * instead of passing it on. If `size` never reached MenuButton, all three
   * would render at the same height.
   */
  it('passes size through to the button', async () => {
    const heights: string[] = [];

    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <LocaleSwitcher locales={locales} value="de" size={size} onChange={() => {}} />,
      );
      heights.push(getComputedStyle(screen.getByRole('button')).minHeight);
      unmount();
    }

    expect(new Set(heights).size).toBe(3);
  });
});
