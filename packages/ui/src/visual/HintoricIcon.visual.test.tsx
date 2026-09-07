import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { HintoricIcon } from '../components/HintoricIcon';
import { setColorScheme } from './helpers';

// HintoricIcon is exempt from this suite's usual "compare against real
// @mui/joy" rule (see RelativeTime.visual.test.tsx) -- there is no Joy UI
// equivalent, this is the Hintoric brand mark. What matters here is that it
// actually recolors between light and dark instead of staying frozen at
// whichever ink shade it first rendered with, which jsdom can't verify since
// it never resolves `currentColor` against a real computed `color`.
describe('HintoricIcon visual', () => {
  it('renders neutral-800 ink in light mode', async () => {
    await setColorScheme('light');
    render(<HintoricIcon data-testid="hintoric-icon-light" />);
    const el = page.getByTestId('hintoric-icon-light').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).toBe('rgb(23, 26, 28)');
    await expect.element(page.getByTestId('hintoric-icon-light')).toMatchScreenshot('hintoric-icon-light');
  });

  it('renders neutral-100 ink in dark mode', async () => {
    await setColorScheme('dark');
    render(<HintoricIcon data-testid="hintoric-icon-dark" />);
    const el = page.getByTestId('hintoric-icon-dark').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).toBe('rgb(240, 244, 248)');
    await expect.element(page.getByTestId('hintoric-icon-dark')).toMatchScreenshot('hintoric-icon-dark');
  });

  it('lets a caller override the color via className', async () => {
    await setColorScheme('light');
    render(<HintoricIcon className="text-danger-500" data-testid="hintoric-icon-override" />);
    const el = page.getByTestId('hintoric-icon-override').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).not.toBe('rgb(23, 26, 28)');
  });
});
