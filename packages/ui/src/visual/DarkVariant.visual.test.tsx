import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { setColorScheme } from './helpers';

// A consumer writing `dark:` in their own markup must follow OUR switcher, not
// the raw OS preference — otherwise the app they built disagrees with the
// button we gave them. Tailwind's stock `dark:` reads prefers-color-scheme, so
// this only holds once index.css declares a custom variant.
//
// The expected values are --color-neutral-100 (#F5F1ED, light) and --color-neutral-800
// (#171A1C, dark — Joy's) from theme.css.
describe('the dark: variant follows data-color-scheme', () => {
  it('does not apply inside a light subtree', async () => {
    render(<div data-testid="light-box" className="bg-neutral-100 dark:bg-neutral-800" />);
    await setColorScheme('light');

    expect(getComputedStyle(page.getByTestId('light-box').element()).backgroundColor).toBe(
      'rgb(245, 241, 237)',
    );
  });

  it('applies inside a dark subtree', async () => {
    render(<div data-testid="dark-box" className="bg-neutral-100 dark:bg-neutral-800" />);
    await setColorScheme('dark');

    expect(getComputedStyle(page.getByTestId('dark-box').element()).backgroundColor).toBe(
      'rgb(23, 26, 28)',
    );
  });
});
