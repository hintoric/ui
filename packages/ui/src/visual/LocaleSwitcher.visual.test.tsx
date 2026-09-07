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
  // `de-DE` derives its flag from its own region subtag; `en` deliberately
  // belongs to no single country and gets none; `pt` needs an explicit one.
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português', region: 'PT' },
];

describe('LocaleSwitcher visual (self-baseline)', () => {
  it('closed state matches its own baseline screenshot', async () => {
    render(<LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />);

    await expect(page.getByRole('button')).toMatchScreenshot('locale-switcher-closed-light');
  });

  it('open menu matches its own baseline screenshot', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />);

    await user.click(screen.getByRole('button'));
    await screen.findByText('English');

    // The popup lives in a portal, so the button's own box does not contain it
    // — screenshotting the button would show a green test and no menu. The
    // portal is still in the document, reachable by its role.
    await expect(page.getByRole('menu')).toMatchScreenshot('locale-switcher-open-light');
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
        <LocaleSwitcher locales={locales} value="de-DE" size={size} onChange={() => {}} />,
      );
      heights.push(getComputedStyle(screen.getByRole('button')).minHeight);
      unmount();
    }

    expect(new Set(heights).size).toBe(3);
  });

  /**
   * The default is `outlined`, not `plain`: the control should read as a
   * control without the caller having to ask for a border.
   */
  it('is outlined by default', async () => {
    render(<LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />);

    const style = getComputedStyle(screen.getByRole('button'));
    expect(style.borderTopStyle).toBe('solid');
    expect(parseFloat(style.borderTopWidth)).toBeGreaterThan(0);
  });

  /**
   * A flag needs a country, and only some locale tags carry one. Counting
   * <svg> elements is the honest check: the flags are decorative and
   * aria-hidden, so no accessible query can find them.
   */
  it('renders a flag only where a country can be determined', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />);

    await user.click(screen.getByRole('button'));
    await screen.findByText('English');

    const items = screen.getAllByRole('menuitem');
    const hasFlag = (item: HTMLElement) => item.querySelector('svg') !== null;

    expect(hasFlag(items[0])).toBe(true); // de-DE, from the region subtag
    expect(hasFlag(items[1])).toBe(false); // en, no country
    expect(hasFlag(items[2])).toBe(true); // pt, from an explicit region
  });

  /**
   * The flags are round on purpose, which only works while they stay square:
   * a `border-radius` of half the box turns a square into a circle and an
   * oblong into a lozenge. So this asserts both halves — equal width/height,
   * and a radius that actually reaches 50%. Guards against a future switch
   * back to the 3x2 set, or a bare `h-*` that lets the width drift.
   */
  it('renders each flag as a circle', async () => {
    render(<LocaleSwitcher locales={locales} value="de-DE" onChange={() => {}} />);

    const flag = screen.getByRole('button').querySelector('svg') as SVGSVGElement;
    const rect = flag.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(flag).borderRadius);

    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeCloseTo(rect.width, 1);
    expect(radius).toBeGreaterThanOrEqual(rect.width / 2);

    // A square viewBox too: a circular mask over a 3:2 artwork would crop the
    // flag off-centre rather than simply rounding it.
    const [, , vbWidth, vbHeight] = (flag.getAttribute('viewBox') ?? '').split(/\s+/).map(Number);
    expect(vbWidth).toBe(vbHeight);
  });

  it('drops every flag when flags is false', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher locales={locales} value="de-DE" flags={false} onChange={() => {}} />);

    expect(screen.getByRole('button').querySelector('svg')).toBeNull();

    await user.click(screen.getByRole('button'));
    await screen.findByText('English');

    for (const item of screen.getAllByRole('menuitem')) {
      expect(item.querySelector('svg')).toBeNull();
    }
  });

  /**
   * The props that are not part of the component's own API have to survive the
   * trip to the button, or callers cannot label, test or style the trigger.
   */
  it('forwards unrecognised button props to the trigger', () => {
    render(
      <LocaleSwitcher
        locales={locales}
        value="de-DE"
        onChange={() => {}}
        aria-label="Change language"
        data-testid="switcher"
        className="ring-2"
      />,
    );

    const button = screen.getByTestId('switcher');
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('aria-label')).toBe('Change language');
    expect(button.className).toContain('ring-2');
  });
});
