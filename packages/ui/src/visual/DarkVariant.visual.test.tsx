import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { renderHintoricDark, renderHintoricLight } from './darkMode';
import { settleTransitions } from './helpers';

// A consumer writing `dark:` in their own markup must follow OUR switcher, not
// the raw OS preference — otherwise the app they built disagrees with the
// button we gave them. Tailwind's stock `dark:` reads prefers-color-scheme, so
// this only holds once index.css declares a custom variant.
//
// The expected values are --color-neutral-100 (#f0f4f8) and --color-neutral-800
// (#171a1c) from theme.css.
describe('the dark: variant follows data-color-scheme', () => {
  it('does not apply inside a light subtree', async () => {
    renderHintoricLight(<div data-testid="light-box" className="bg-neutral-100 dark:bg-neutral-800" />);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('light-box').element()).backgroundColor).toBe(
      'rgb(240, 244, 248)',
    );
  });

  it('applies inside a dark subtree', async () => {
    renderHintoricDark(<div data-testid="dark-box" className="bg-neutral-100 dark:bg-neutral-800" />);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('dark-box').element()).backgroundColor).toBe(
      'rgb(23, 26, 28)',
    );
  });
});
