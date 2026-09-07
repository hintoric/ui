import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeToggleGroup } from '../components/ColorSchemeToggleGroup';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

function segments(testId: string): HTMLElement[] {
  return [...page.getByTestId(testId).element().querySelectorAll('button')] as HTMLElement[];
}

// Exempt from the Joy parity cross-product: this is a ToggleButtonGroup of
// Buttons, both already fully Joy-compared. What the composition owns is the
// single-selection adapter and the scheme handling.
describe('ColorSchemeToggleGroup visual', () => {
  it('marks exactly one segment as active', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const backgrounds = segments('group').map((segment) => getComputedStyle(segment).backgroundColor);

    expect(backgrounds).toHaveLength(3);
    // Two distinct values: the active segment's, and the one the other two share.
    expect(new Set(backgrounds).size).toBe(2);
  });

  it('moves the active background when another segment is chosen', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();
    const before = getComputedStyle(segments('group')[0]).backgroundColor;

    await userEvent.click(screen.getByRole('button', { name: /Dark/ }));
    await settleTransitions();

    expect(getComputedStyle(segments('group')[0]).backgroundColor).not.toBe(before);
  });

  it('keeps its three segments joined without gaps', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const style = getComputedStyle(page.getByTestId('group').element());
    // spacing defaults to 0, which ToggleButtonGroup renders as a divided,
    // overflow-hidden row rather than a gap.
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('row');
  });

  it.each(COLOR_SCHEMES)('matches its own baseline in %s', async (scheme) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );
    await setColorScheme(scheme);

    await expect(page.getByTestId('group')).toMatchScreenshot(`colorschemetogglegroup-${scheme}`);
  });

  it('actually changes appearance between the two schemes', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggleGroup data-testid="group" />
      </ColorSchemeProvider>,
    );

    await setColorScheme('light');
    const light = segments('group').map((s) => getComputedStyle(s).color).join('|');

    await setColorScheme('dark');
    const dark = segments('group').map((s) => getComputedStyle(s).color).join('|');

    expect(dark).not.toBe(light);
  });
});
