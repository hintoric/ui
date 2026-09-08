import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ButtonGroup as JoyButtonGroup, Button as JoyButton } from '@mui/joy';
import { ButtonGroup as HintoricButtonGroup } from '../components/ButtonGroup';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Layout-only component (no color/variant axis of its own — see the scope
// note in ButtonGroup.tsx) — tests its actual supported states: orientation
// and connected-vs-spaced layout, per CLAUDE.md's allowance for components
// without a variant/color axis.
describe('ButtonGroup visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`connected horizontal group matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
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
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy-h')).toMatchScreenshot(`buttongroup-horizontal-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-h')).toMatchScreenshot(`buttongroup-horizontal-hintoric-${scheme}`);
    });

    it(`vertical group matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
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

      await expect(page.getByTestId('joy-v')).toMatchScreenshot(`buttongroup-vertical-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-v')).toMatchScreenshot(`buttongroup-vertical-hintoric-${scheme}`);
    });
  }
});
