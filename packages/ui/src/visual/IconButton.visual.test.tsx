import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, IconButton as JoyIconButton } from '@mui/joy';
import { IconButton as HintoricIconButton } from '../components/IconButton';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('IconButton visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyIconButton data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              +
            </JoyIconButton>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricIconButton
              data-testid={`hintoric-${variant}-${color}`}
              variant={variant}
              color={color}
              aria-label={`${variant}-${color}`}
            >
              +
            </HintoricIconButton>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
        const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyLocator.element());
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.height).toBe(joyStyle.height);
        expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

        await expect(joyLocator).toMatchScreenshot(`iconbutton-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`iconbutton-${variant}-${color}-hintoric`);
      });
    }
  }

  it('shows the same focus-visible outline as Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyIconButton data-testid="joy-focus">+</JoyIconButton>
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider>
        <HintoricIconButton data-testid="hintoric-focus" aria-label="focus">
          +
        </HintoricIconButton>
      </ColorSchemeProvider>,
    );

    const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
    const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

    joyEl.focus();
    await settleTransitions();
    const joyOutline = getComputedStyle(joyEl).outline;
    joyEl.blur();

    hintoricEl.focus();
    await settleTransitions();
    const hintoricOutline = getComputedStyle(hintoricEl).outline;
    hintoricEl.blur();

    expect(hintoricOutline).toBe(joyOutline);
  });
});
