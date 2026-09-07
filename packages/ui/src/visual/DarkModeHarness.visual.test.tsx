import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, IconButton as JoyIconButton } from '@mui/joy';
import { IconButton as HintoricIconButton } from '../components/IconButton';
import { setColorScheme, settleTransitions } from './helpers';

/*
 * A guard for setColorScheme itself. Every dark assertion in this suite is
 * built on it, so if it silently stopped flipping either side, dozens of tests
 * would keep passing while comparing light against light.
 */
describe('setColorScheme', () => {
  it('flips real Joy, producing a different soft background than light', async () => {
    render(
      <JoyCssVarsProvider defaultMode="light">
        <JoyIconButton data-testid="joy" variant="soft" color="neutral">
          +
        </JoyIconButton>
      </JoyCssVarsProvider>,
    );
    await settleTransitions();
    const light = getComputedStyle(page.getByTestId('joy').element()).backgroundColor;

    await setColorScheme('dark');
    const dark = getComputedStyle(page.getByTestId('joy').element()).backgroundColor;

    // soft/neutral is neutral-100 in light and neutral-800 in dark.
    expect(dark).not.toBe(light);
  });

  it('flips our own components', async () => {
    render(
      <HintoricIconButton data-testid="ours" variant="soft" color="neutral" aria-label="ours">
        +
      </HintoricIconButton>,
    );
    await settleTransitions();
    const light = getComputedStyle(page.getByTestId('ours').element()).backgroundColor;

    await setColorScheme('dark');
    const dark = getComputedStyle(page.getByTestId('ours').element()).backgroundColor;

    expect(dark).not.toBe(light);
  });

  it('reaches portalled content, which a wrapper element cannot', async () => {
    // The mechanism's whole reason for living on <html>: Base UI portals mount
    // onto document.body, a sibling of any wrapper.
    await setColorScheme('dark');

    expect(document.body.closest('[data-color-scheme="dark"]')).not.toBeNull();
  });
});
