import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { HintoricLogo } from '../components/HintoricLogo';
import { setColorScheme } from './helpers';

// HintoricLogo is exempt from this suite's usual "compare against real
// @mui/joy" rule (see RelativeTime.visual.test.tsx) -- there is no Joy UI
// equivalent, this is the Hintoric brand logo. What matters here is that it
// actually recolors between light and dark instead of staying frozen at
// whichever ink shade it first rendered with, which jsdom can't verify since
// it never resolves `currentColor` against a real computed `color`.
describe('HintoricLogo visual', () => {
  it('renders neutral-800 ink in light mode', async () => {
    await setColorScheme('light');
    render(<HintoricLogo data-testid="hintoric-logo-light" />);
    const el = page.getByTestId('hintoric-logo-light').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).toBe('rgb(23, 26, 28)');
    await expect.element(page.getByTestId('hintoric-logo-light')).toMatchScreenshot('hintoric-logo-light');
  });

  it('renders neutral-100 ink in dark mode', async () => {
    await setColorScheme('dark');
    render(<HintoricLogo data-testid="hintoric-logo-dark" />);
    const el = page.getByTestId('hintoric-logo-dark').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).toBe('rgb(240, 244, 248)');
    await expect.element(page.getByTestId('hintoric-logo-dark')).toMatchScreenshot('hintoric-logo-dark');
  });

  it('lets a caller override the color via className', async () => {
    await setColorScheme('light');
    render(<HintoricLogo className="text-danger-500" data-testid="hintoric-logo-override" />);
    const el = page.getByTestId('hintoric-logo-override').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).not.toBe('rgb(23, 26, 28)');
  });

  it('gives two logos on the same page distinct clip-path ids', async () => {
    await setColorScheme('light');
    render(
      <>
        <HintoricLogo data-testid="hintoric-logo-a" />
        <HintoricLogo data-testid="hintoric-logo-b" />
      </>,
    );
    const clipIdOf = (testId: string) => {
      const svg = page.getByTestId(testId).element() as SVGSVGElement;
      return svg.querySelector('clipPath')!.id;
    };
    expect(clipIdOf('hintoric-logo-a')).not.toBe(clipIdOf('hintoric-logo-b'));
  });
});
