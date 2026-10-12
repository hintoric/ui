import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { FloatingBar, FloatingBarButton, FloatingBarMenuButton } from '../components/FloatingBar';
import { Dropdown } from '../components/Dropdown';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { Divider } from '../components/Divider';
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

  for (const scheme of COLOR_SCHEMES) {
    it(`ends the bar in a menu button that is the same circle, and opens it, in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        // Room below for the popup: it is portalled to body and positioned
        // under the trigger, so the frame has to reach down to where it opens
        // for the shot to show it.
        <div data-testid="frame" style={{ padding: 24, paddingRight: 140, paddingBottom: 120, width: 'max-content' }}>
          <FloatingBar aria-label="Aktionen">
            <FloatingBarButton aria-label="Bearbeiten">B</FloatingBarButton>
            <Dropdown>
              <FloatingBarMenuButton aria-label="Mehr">…</FloatingBarMenuButton>
              <Menu size="sm">
                <MenuItem>Duplizieren</MenuItem>
              </Menu>
            </Dropdown>
          </FloatingBar>
        </div>,
      );

      const plain = page.getByRole('button', { name: 'Bearbeiten' }).element();
      const trigger = page.getByRole('button', { name: 'Mehr' }).element();
      const plainStyle = getComputedStyle(plain);
      const triggerStyle = getComputedStyle(trigger);

      // Indistinguishable from its neighbour at rest: same size, same
      // radius, same paint. Only what it does on click differs.
      expect(triggerStyle.width).toBe(plainStyle.width);
      expect(triggerStyle.height).toBe(plainStyle.height);
      expect(triggerStyle.borderTopLeftRadius).toBe(plainStyle.borderTopLeftRadius);
      expect(triggerStyle.backgroundColor).toBe(plainStyle.backgroundColor);
      expect(triggerStyle.color).toBe(plainStyle.color);

      await page.getByRole('button', { name: 'Mehr' }).click();
      await expect.element(page.getByRole('menuitem', { name: 'Duplizieren' })).toBeVisible();

      await expect(page.getByTestId('frame')).toMatchScreenshot(`floating-bar-menu-${scheme}`);
    });
  }

  for (const scheme of COLOR_SCHEMES) {
    it(`carries text labels, wraps in a narrow space and shows its divider in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <div data-testid="frame" style={{ width: 150, padding: 8 }}>
          <FloatingBar aria-label="Felder" variant="solid" color="neutral" wrap>
            <FloatingBarButton text variant="solid" color="success" selected>
              Datum
            </FloatingBarButton>
            <FloatingBarButton text variant="solid">
              Betrag
            </FloatingBarButton>
            <Divider orientation="vertical" data-testid="divider" />
            <FloatingBarButton text variant="solid">
              Kein Feld
            </FloatingBarButton>
          </FloatingBar>
        </div>,
      );

      const bar = page.getByRole('toolbar').element();
      const label = page.getByRole('button', { name: 'Betrag' }).element();
      const labelBox = label.getBoundingClientRect();
      const labelStyle = getComputedStyle(label);
      const pressed = getComputedStyle(page.getByRole('button', { name: 'Datum' }).element());

      // A label is wider than tall, padded, and still a pill — not a circle.
      expect(labelBox.width).toBeGreaterThan(labelBox.height);
      expect(parseFloat(labelStyle.paddingLeft)).toBeGreaterThanOrEqual(12);
      expect(parseFloat(labelStyle.borderTopLeftRadius)).toBeGreaterThanOrEqual(labelBox.height / 2);
      expect(labelStyle.fontSize).toBe('14px');
      expect(pressed.backgroundColor).not.toBe(labelStyle.backgroundColor);

      // It wraps: taller than one row, and nothing sticks out of the frame.
      const barBox = bar.getBoundingClientRect();
      expect(barBox.height).toBeGreaterThan(labelBox.height * 1.8);
      for (const button of page.getByRole('button').elements()) {
        expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(barBox.right);
      }
      expect(getComputedStyle(bar).flexWrap).toBe('wrap');

      // The divider has to be told apart from the solid fill. It is a
      // translucent white there, never the (invisible) dark divider grey.
      const line = getComputedStyle(page.getByTestId('divider').element()).backgroundColor;
      expect(line).toBe('rgba(255, 255, 255, 0.32)');
      expect(line).not.toBe(getComputedStyle(bar).backgroundColor);

      await expect(page.getByTestId('frame')).toMatchScreenshot(`floating-bar-text-wrap-${scheme}`);
    });
  }
});
