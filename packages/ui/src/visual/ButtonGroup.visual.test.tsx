import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ButtonGroup as JoyButtonGroup, Button as JoyButton } from '@mui/joy';
import { ButtonGroup as HintoricButtonGroup } from '../components/ButtonGroup';

// Layout-only component (no color/variant axis of its own — see the scope
// note in ButtonGroup.tsx) — tests its actual supported states: orientation
// and connected-vs-spaced layout, per CLAUDE.md's allowance for components
// without a variant/color axis.
describe('ButtonGroup visual parity with @mui/joy', () => {
  it('connected horizontal group matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyButtonGroup data-testid="joy-h">
          <JoyButton>One</JoyButton>
          <JoyButton>Two</JoyButton>
        </JoyButtonGroup>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricButtonGroup data-testid="hintoric-h">
        <button>One</button>
        <button>Two</button>
      </HintoricButtonGroup>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-h').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-h').element());

    expect(hintoricStyle.display).toBe(joyStyle.display);
    expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
    expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);

    await expect(page.getByTestId('joy-h')).toMatchScreenshot('buttongroup-horizontal-joy');
    await expect(page.getByTestId('hintoric-h')).toMatchScreenshot('buttongroup-horizontal-hintoric');
  });

  it('vertical group matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyButtonGroup data-testid="joy-v" orientation="vertical">
          <JoyButton>One</JoyButton>
          <JoyButton>Two</JoyButton>
        </JoyButtonGroup>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricButtonGroup data-testid="hintoric-v" orientation="vertical">
        <button>One</button>
        <button>Two</button>
      </HintoricButtonGroup>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-v').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-v').element());

    expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);

    await expect(page.getByTestId('joy-v')).toMatchScreenshot('buttongroup-vertical-joy');
    await expect(page.getByTestId('hintoric-v')).toMatchScreenshot('buttongroup-vertical-hintoric');
  });
});
