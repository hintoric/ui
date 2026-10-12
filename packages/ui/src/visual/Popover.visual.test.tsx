import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { Popover } from '../components/Popover';
import { FloatingBar, FloatingBarButton } from '../components/FloatingBar';
import { COLOR_SCHEMES, setColorScheme, settleUntilStable } from './helpers';

// Popover is exempt from the Joy parity comparison: Joy UI has no popover that
// stands at a rectangle. Instead: a self-baseline per variant x colour x scheme,
// an assertion that the surface actually changes between schemes, and the
// geometry that is the component's reason to exist — never covering the
// rectangle, flipping at the page edge.

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

const rect = { x: 200, y: 200, width: 120, height: 24 };

function popup() {
  return screen.getByTestId('popup');
}

describe('Popover visual (self-baseline)', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches its own ${scheme} baseline`, async () => {
          await setColorScheme(scheme);
          render(
            <Popover open anchorRect={rect} variant={variant} color={color} data-testid="popup">
              <div className="px-3 py-2 text-sm">{color}</div>
            </Popover>,
          );
          await screen.findByTestId('popup');
          await settleUntilStable(() => JSON.stringify(popup().getBoundingClientRect()));
          await expect(page.getByTestId('popup')).toMatchScreenshot(
            `popover-${variant}-${color}-${scheme}`,
          );
        });
      }
    }
  }

  it('hosting a FloatingBar matches its own baseline in each scheme', async () => {
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(scheme);
      const { unmount } = render(
        <Popover open anchorRect={rect} data-testid="popup">
          <FloatingBar>
            <FloatingBarButton aria-label="Bold">B</FloatingBarButton>
            <FloatingBarButton aria-label="Italic">I</FloatingBarButton>
          </FloatingBar>
        </Popover>,
      );
      await screen.findByTestId('popup');
      await settleUntilStable(() => JSON.stringify(popup().getBoundingClientRect()));
      await expect(page.getByTestId('popup')).toMatchScreenshot(`popover-floating-bar-${scheme}`);
      unmount();
    }
  });

  it('reads colour-scheme tokens rather than fixed colours', async () => {
    await setColorScheme('light');
    render(
      <Popover open anchorRect={rect} variant="outlined" data-testid="popup">
        <div>x</div>
      </Popover>,
    );
    await screen.findByTestId('popup');
    const read = () => {
      const s = getComputedStyle(popup());
      return [s.backgroundColor, s.color, s.borderTopColor];
    };
    const light = read();
    await setColorScheme('dark');
    expect(read()).not.toEqual(light);
  });
});

describe('Popover geometry', () => {
  async function place(anchor: typeof rect, placement: 'top' | 'bottom' | 'left' | 'right') {
    render(
      <Popover open anchorRect={anchor} placement={placement} data-testid="popup">
        <div style={{ width: 160, height: 40 }}>bar</div>
      </Popover>,
    );
    await screen.findByTestId('popup');
    await settleUntilStable(() => JSON.stringify(popup().getBoundingClientRect()));
    return popup().getBoundingClientRect();
  }

  it('stands beside the rectangle on the requested side, without covering it', async () => {
    const r = await place(rect, 'top');
    expect(r.bottom).toBeLessThanOrEqual(rect.y);
  });

  it('flips to the other side when there is no room', async () => {
    // At the very top, `top` has no room, so the popup goes below.
    const r = await place({ x: 200, y: 2, width: 120, height: 24 }, 'top');
    expect(r.top).toBeGreaterThanOrEqual(26);
  });

  it('stays inside the viewport at the right edge', async () => {
    const r = await place({ x: window.innerWidth - 30, y: 200, width: 30, height: 24 }, 'bottom');
    expect(r.right).toBeLessThanOrEqual(window.innerWidth);
  });
});
