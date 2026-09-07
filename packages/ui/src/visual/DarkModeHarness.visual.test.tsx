import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { CssVarsProvider as JoyCssVarsProvider, IconButton as JoyIconButton } from '@mui/joy';
import { IconButton as HintoricIconButton } from '../components/IconButton';
import { renderJoyDark, renderJoyLight, renderHintoricDark, renderHintoricLight } from './darkMode';
import { settleTransitions } from './helpers';

describe('dark mode harness', () => {
  it('puts real Joy into dark mode, producing a different soft background than light', async () => {
    renderJoyLight(<JoyIconButton data-testid="joy-light" variant="soft" color="neutral">+</JoyIconButton>);
    renderJoyDark(<JoyIconButton data-testid="joy-dark" variant="soft" color="neutral">+</JoyIconButton>);
    await settleTransitions();

    const light = getComputedStyle(page.getByTestId('joy-light').element()).backgroundColor;
    const dark = getComputedStyle(page.getByTestId('joy-dark').element()).backgroundColor;

    // soft/neutral is neutral-100 in light and neutral-800 in dark — if these
    // are equal, the dark wrapper did not take effect and every dark
    // comparison built on this helper would silently compare light to light.
    expect(dark).not.toBe(light);
  });

  it('puts our own provider into dark mode the same way', async () => {
    renderHintoricLight(<HintoricIconButton data-testid="ours-light" variant="soft" color="neutral" aria-label="light">+</HintoricIconButton>);
    renderHintoricDark(<HintoricIconButton data-testid="ours-dark" variant="soft" color="neutral" aria-label="dark">+</HintoricIconButton>);
    await settleTransitions();

    const light = getComputedStyle(page.getByTestId('ours-light').element()).backgroundColor;
    const dark = getComputedStyle(page.getByTestId('ours-dark').element()).backgroundColor;

    expect(dark).not.toBe(light);
  });

  it('agrees with Joy on soft/neutral in dark mode', async () => {
    renderJoyDark(<JoyIconButton data-testid="joy" variant="soft" color="neutral">+</JoyIconButton>);
    renderHintoricDark(<HintoricIconButton data-testid="ours" variant="soft" color="neutral" aria-label="ours">+</HintoricIconButton>);
    await settleTransitions();

    expect(getComputedStyle(page.getByTestId('ours').element()).backgroundColor).toBe(
      getComputedStyle(page.getByTestId('joy').element()).backgroundColor,
    );
  });
});
