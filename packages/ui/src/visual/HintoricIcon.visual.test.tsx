import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { HintoricIcon } from '../components/HintoricIcon';
import { HintoricLogo } from '../components/HintoricLogo';
import { setColorScheme } from './helpers';

// Where the paths paint, in the svg's own user units: the union of each path's
// geometry box, widened by half the stroke for the stroked rings. getBBox()
// ignores clip-path, so the logo's clipped mark measures as drawn.
function inkBox(svg: SVGSVGElement, keep: (box: DOMRect) => boolean = () => true) {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const path of svg.querySelectorAll('path')) {
    const box = path.getBBox();
    if (!keep(box)) continue;
    const half = path.getAttribute('stroke') ? Number(path.getAttribute('stroke-width')) / 2 : 0;
    minX = Math.min(minX, box.x - half);
    minY = Math.min(minY, box.y - half);
    maxX = Math.max(maxX, box.x + box.width + half);
    maxY = Math.max(maxY, box.y + box.height + half);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// HintoricIcon is exempt from this suite's usual "compare against real
// @mui/joy" rule (see RelativeTime.visual.test.tsx) -- there is no Joy UI
// equivalent, this is the Hintoric brand mark. What matters here is that it
// actually recolors between light and dark instead of staying frozen at
// whichever ink shade it first rendered with, which jsdom can't verify since
// it never resolves `currentColor` against a real computed `color`.
//
// The screenshots render at 96px: at the default 1em the 0.4.0 icon, which
// lacked the mark's right needle, was a 16px image a reviewer could not read.
describe('HintoricIcon visual', () => {
  it('frames the same mark as HintoricLogo, edge to edge', async () => {
    await setColorScheme('light');
    render(
      <>
        <HintoricLogo data-testid="hintoric-logo-frame" />
        <HintoricIcon data-testid="hintoric-icon-frame" />
      </>,
    );
    const logo = page.getByTestId('hintoric-logo-frame').element() as SVGSVGElement;
    const icon = page.getByTestId('hintoric-icon-frame').element() as SVGSVGElement;
    // The wordmark starts at x 376, the mark ends before x 330.
    const mark = inkBox(logo, (box) => box.x < 330);
    const ink = inkBox(icon);
    const { x, y, width, height } = icon.viewBox.baseVal;
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(ink[key], `ink ${key}`).toBeCloseTo(mark[key], 0);
      expect({ x, y, width, height }[key], `viewBox ${key}`).toBeCloseTo(mark[key], 0);
    }
    // The rendered box keeps the viewBox's proportions, so nothing letterboxes.
    const rect = icon.getBoundingClientRect();
    expect(rect.width / rect.height).toBeCloseTo(width / height, 2);
  });

  it('renders neutral-800 ink in light mode', async () => {
    await setColorScheme('light');
    render(<HintoricIcon data-testid="hintoric-icon-light" style={{ fontSize: 96 }} />);
    const el = page.getByTestId('hintoric-icon-light').element() as SVGSVGElement;
    expect(getComputedStyle(el).color).toBe('rgb(23, 26, 28)');
    await expect.element(page.getByTestId('hintoric-icon-light')).toMatchScreenshot('hintoric-icon-light');
  });

  it('renders neutral-100 ink in dark mode', async () => {
    await setColorScheme('dark');
    render(<HintoricIcon data-testid="hintoric-icon-dark" style={{ fontSize: 96 }} />);
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
