import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Grid as HintoricGrid } from '../components/Grid';

// Joy UI's Grid is flexbox-based internally with a large internal calc
// system for its percentage flex-basis (see Grid.tsx's scope note) — not a
// byte-comparable computed-style target. This tests the ACTUAL achieved
// layout instead: a container with two xs={6} children should split the
// available width evenly, which is Grid's real visual contract.
describe('Grid visual parity (achieved layout)', () => {
  it('splits width evenly between two xs={6} children', async () => {
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

    await expect(page.getByTestId('container')).toMatchScreenshot('grid-two-columns');
  });

  it('spans the full row when xs is true', async () => {
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
});
