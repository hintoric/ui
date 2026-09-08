import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { Grid as HintoricGrid } from '../components/Grid';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Joy UI's Grid is flexbox-based internally with a large internal calc
// system for its percentage flex-basis (see Grid.tsx's scope note) — not a
// byte-comparable computed-style target. This tests the ACTUAL achieved
// layout instead: a container with two xs={6} children should split the
// available width evenly, which is Grid's real visual contract.
describe('Grid visual parity (achieved layout)', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`splits width evenly between two xs={6} children in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <div style={{ width: 300 }}>
          <HintoricGrid container data-testid="container">
            <HintoricGrid xs={6} data-testid="a">
              A
            </HintoricGrid>
            <HintoricGrid xs={6} data-testid="b">
              B
            </HintoricGrid>
          </HintoricGrid>
        </div>,
      );

      const aRect = page.getByTestId('a').element().getBoundingClientRect();
      const bRect = page.getByTestId('b').element().getBoundingClientRect();

      expect(aRect.width).toBeCloseTo(bRect.width, 0);
      expect(aRect.width).toBeCloseTo(150, 0);

      await expect(page.getByTestId('container')).toMatchScreenshot(
        `grid-two-columns-${scheme}`,
      );
    });

    it(`spans the full row when xs is true in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <div style={{ width: 300 }}>
          <HintoricGrid container data-testid="container-full">
            <HintoricGrid xs data-testid="full">
              Full width
            </HintoricGrid>
          </HintoricGrid>
        </div>,
      );

      const rect = page.getByTestId('full').element().getBoundingClientRect();
      expect(rect.width).toBeCloseTo(300, 0);
    });
  }

  /**
   * The layout-only exception in CLAUDE.md. Grid sets no `bg-*`/`text-*`/
   * `border-*` colour utility of its own, so it paints nothing and the
   * "dark must differ from light" assertion every other Joy-exempt component
   * carries is unsatisfiable here.
   *
   * The meaningful assertion is the inverse: a scheme flip must not move
   * anything. Grid stays mounted across the flip — only CSS custom properties
   * change — so this compares the same elements with themselves.
   */
  it('lays out identically in both colour schemes', async () => {
    await setColorScheme('light');
    render(
      <div style={{ width: 300 }}>
        <HintoricGrid container data-testid="layout-container" spacing={2}>
          <HintoricGrid xs={6} data-testid="layout-a">
            A
          </HintoricGrid>
          <HintoricGrid xs={6} data-testid="layout-b">
            B
          </HintoricGrid>
        </HintoricGrid>
      </div>,
    );

    const read = () =>
      ['layout-container', 'layout-a', 'layout-b'].map((id) => {
        const el = screen.getByTestId(id);
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return [s.display, s.flexDirection, s.gap, s.padding, r.width, r.height].join('|');
      });

    const light = read();
    await setColorScheme('dark');

    expect(read()).toEqual(light);
  });
});
