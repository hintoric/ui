import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { FloatingBar, FloatingBarButton } from '../components/FloatingBar';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

/**
 * No `@mui/joy` counterpart, so no parity comparison — but scheme coverage
 * applies, and so does the reason the component exists: a selected button has
 * to read as a circle inside the pill, not as a rounded square.
 */
describe('FloatingBar', () => {
  const pill: Record<string, { backgroundColor: string; borderColor: string }> = {};

  for (const scheme of COLOR_SCHEMES) {
    it(`draws the bar and its selected button in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <FloatingBar aria-label="Ansicht">
          <FloatingBarButton selected aria-label="Raster">
            R
          </FloatingBarButton>
          <FloatingBarButton aria-label="Liste">L</FloatingBarButton>
          <FloatingBarButton aria-label="Karte" disabled>
            K
          </FloatingBarButton>
        </FloatingBar>,
      );

      const bar = page.getByRole('toolbar').element();
      const barStyle = getComputedStyle(bar);
      pill[scheme] = { backgroundColor: barStyle.backgroundColor, borderColor: barStyle.borderTopColor };

      const selected = page.getByRole('button', { name: 'Raster' }).element();
      const resting = page.getByRole('button', { name: 'Liste' }).element();
      const selectedStyle = getComputedStyle(selected);

      // The point of the component: the highlight is a circle, and the pill
      // it sits in is one too. A `rounded-sm` corner here is the bug.
      const { width, height } = selected.getBoundingClientRect();
      expect(width).toBeCloseTo(height, 1);
      expect(parseFloat(selectedStyle.borderTopLeftRadius)).toBeGreaterThanOrEqual(height / 2);
      expect(parseFloat(barStyle.borderTopLeftRadius)).toBeGreaterThanOrEqual(bar.getBoundingClientRect().height / 2);

      // Selected has to be visible as selected, in both schemes.
      expect(selectedStyle.backgroundColor).not.toBe(getComputedStyle(resting).backgroundColor);

      await expect(page.getByRole('toolbar')).toMatchScreenshot(`floating-bar-${scheme}`);
    });
  }

  it('paints the pill differently in dark than in light', () => {
    // A committed PNG only catches a regression once somebody looks at it;
    // this catches a hardcoded light colour on the next run.
    expect(pill.dark.backgroundColor).not.toBe(pill.light.backgroundColor);
    expect(pill.dark.borderColor).not.toBe(pill.light.borderColor);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`hangs upright over the right edge of its container in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { container } = render(
        // The outer box is only there so the screenshot shows the half of the
        // bar that hangs outside; an element shot of the stage clips it away.
        <div data-testid="frame" style={{ padding: 24, width: 'max-content' }}>
        <div
          data-testid="stage"
          style={{ position: 'relative', width: 240, height: 160, background: 'var(--color-surface)' }}
        >
          <FloatingBar aria-label="Aktionen" placement="right" align="start" straddle size="sm">
            <FloatingBarButton selected aria-label="Bearbeiten">
              B
            </FloatingBarButton>
            <FloatingBarButton aria-label="Drucken">D</FloatingBarButton>
          </FloatingBar>
        </div>
        </div>,
      );

      const stage = container.querySelector('[data-testid="stage"]') as HTMLElement;
      const bar = page.getByRole('toolbar').element();
      const stageBox = stage.getBoundingClientRect();
      const barBox = bar.getBoundingClientRect();

      // Half in, half out: the bar's centre sits on the container's edge.
      expect(barBox.left + barBox.width / 2).toBeCloseTo(stageBox.right, 0);

      await expect(page.getByTestId('frame')).toMatchScreenshot(`floating-bar-straddle-${scheme}`);
    });
  }
});
