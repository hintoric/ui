import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CssVarsProvider as JoyCssVarsProvider, IconButton as JoyIconButton } from '@mui/joy';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

// No variant × colour cross-product here, and that is deliberate: this is an
// IconButton composition with no look of its own, and IconButton already
// carries that full Joy-compared matrix. A second cross-product would assert
// the same computed styles twice. What a composition CAN get wrong is
// pass-through, icon choice and sizing — plus its appearance per scheme, which
// is the whole point of this particular component.
describe('ColorSchemeToggle visual', () => {
  it.each(SIZES)('passes size %s through to the button', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid={`toggle-${size}`} size={size} />
      </ColorSchemeProvider>,
    );
    render(
      <JoyCssVarsProvider defaultMode="light">
        <JoyIconButton data-testid={`joy-${size}`} variant="outlined" color="neutral" size={size}>
          +
        </JoyIconButton>
      </JoyCssVarsProvider>,
    );
    await settleTransitions();

    const ours = getComputedStyle(page.getByTestId(`toggle-${size}`).element());
    const joy = getComputedStyle(page.getByTestId(`joy-${size}`).element());

    // Swallowing `size` is the classic composition bug — LocaleSwitcher's
    // visual test exists for the same reason.
    expect(ours.width).toBe(joy.width);
    expect(ours.height).toBe(joy.height);
  });

  it('renders its icon at 24px for the md size', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" size="md" />
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const icon = page.getByTestId('toggle').element().querySelector('svg');
    const iconStyle = getComputedStyle(icon as Element);

    // ICON_SIZE_CLASS.md is `size-6` = 24px. A 1em-based icon with no explicit
    // size would inherit the button's font size and come out visibly small.
    expect(iconStyle.width).toBe('24px');
    expect(iconStyle.height).toBe('24px');
  });

  it.each(COLOR_SCHEMES)('matches Joy UI in %s mode', async (scheme) => {
    render(
      <JoyCssVarsProvider defaultMode={scheme}>
        <JoyIconButton data-testid="joy" variant="outlined" color="neutral">
          +
        </JoyIconButton>
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" />
      </ColorSchemeProvider>,
    );
    await setColorScheme(scheme);

    const ours = getComputedStyle(page.getByTestId('toggle').element());
    const joy = getComputedStyle(page.getByTestId('joy').element());

    expect(ours.backgroundColor).toBe(joy.backgroundColor);
    expect(ours.borderColor).toBe(joy.borderColor);
    expect(ours.color).toBe(joy.color);
  });

  it('shows the same focus-visible outline as Joy UI', async () => {
    render(
      <JoyCssVarsProvider defaultMode="light">
        <JoyIconButton data-testid="joy-focus">+</JoyIconButton>
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle-focus" variant="plain" />
      </ColorSchemeProvider>,
    );

    const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
    const oursEl = page.getByTestId('toggle-focus').element() as HTMLElement;

    joyEl.focus();
    await settleTransitions();
    const joyOutline = getComputedStyle(joyEl).outline;
    joyEl.blur();

    oursEl.focus();
    await settleTransitions();
    const oursOutline = getComputedStyle(oursEl).outline;
    oursEl.blur();

    expect(oursOutline).toBe(joyOutline);
  });

  it('actually changes appearance between the two schemes', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" />
      </ColorSchemeProvider>,
    );

    await setColorScheme('light');
    const light = getComputedStyle(page.getByTestId('toggle').element());
    const lightPair = [light.color, light.borderColor].join('|');

    await setColorScheme('dark');
    const dark = getComputedStyle(page.getByTestId('toggle').element());
    const darkPair = [dark.color, dark.borderColor].join('|');

    // A committed PNG only regresses when a human looks at it. This is the one
    // assertion a screenshot cannot make: that a hardcoded light colour did
    // not sneak in.
    expect(darkPair).not.toBe(lightPair);
  });

  it('shows a distinct icon per mode, each in the scheme that mode produces', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <ColorSchemeToggle data-testid="toggle" />
      </ColorSchemeProvider>,
    );
    const button = screen.getByRole('button');
    await settleTransitions();

    // No computed style can tell whether the right symbol is on screen, so
    // these baselines are the actual signal, not decoration.
    //
    // Each shot is taken in the scheme that mode actually resolves to — the
    // provider mirrors it onto <html> itself. Forcing a scheme that
    // contradicts the mode (mode "dark" on a light page) would photograph a
    // state no user can reach.
    await expect(page.getByTestId('toggle')).toMatchScreenshot('colorschemetoggle-mode-system');
    await userEvent.click(button);
    await settleTransitions();
    await expect(page.getByTestId('toggle')).toMatchScreenshot('colorschemetoggle-mode-light');
    await userEvent.click(button);
    await settleTransitions();
    await expect(page.getByTestId('toggle')).toMatchScreenshot('colorschemetoggle-mode-dark');
  });
});
