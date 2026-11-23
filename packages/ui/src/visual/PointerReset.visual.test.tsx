import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from '@testing-library/react';

/*
 * Every test renders at the top-left of the same page, and the pointer stays
 * wherever the last hover put it — possibly in another file. Whatever renders
 * under it next comes up in :hover, and a computed-style or screenshot check
 * then compares a hovered element against a resting one. It showed up as
 * DarkTokens and MenuList failing in full runs only, a different file each
 * time. setup.ts parks the pointer before every test; this pins that.
 */
const BUTTON = 'block h-10 w-40 bg-primary-solid-bg hover:bg-primary-solid-hover-bg';

describe('pointer between tests', () => {
  it('can be left on an element by a hover', async () => {
    render(<button type="button" data-testid="target" className={BUTTON}>Target</button>);
    await userEvent.hover(page.getByTestId('target'));
    expect(getComputedStyle(page.getByTestId('target').element()).backgroundColor).toBe('rgb(24, 94, 165)');
  });

  it('is parked before the next test, so nothing renders hovered', async () => {
    render(<button type="button" data-testid="target" className={BUTTON}>Target</button>);
    // Chromium re-evaluates :hover for an element that appears under a still
    // pointer on a later, synthetic mouse move — not at once.
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(getComputedStyle(page.getByTestId('target').element()).backgroundColor).toBe('rgb(11, 107, 203)');
  });
});
