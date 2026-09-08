import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Divider as JoyDivider } from '@mui/joy';
import { Divider as HintoricDivider } from '../components/Divider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('Divider visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`bare horizontal divider matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 200 }}>
            <JoyDivider data-testid="joy-h" />
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <div style={{ width: 200 }}>
          <HintoricDivider data-testid="hintoric-h" />
        </div>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-h').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-h').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.height).toBe(joyStyle.height);
      expect(hintoricStyle.border).toBe(joyStyle.border);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy-h')).toMatchScreenshot(`divider-horizontal-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-h')).toMatchScreenshot(`divider-horizontal-hintoric-${scheme}`);
    });

    it(`bare vertical divider matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ height: 100, display: 'flex' }}>
            <JoyDivider data-testid="joy-v" orientation="vertical" />
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <div style={{ height: 100, display: 'flex' }}>
          <HintoricDivider data-testid="hintoric-v" orientation="vertical" />
        </div>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-v').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-v').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.width).toBe(joyStyle.width);

      await expect(page.getByTestId('joy-v')).toMatchScreenshot(`divider-vertical-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-v')).toMatchScreenshot(`divider-vertical-hintoric-${scheme}`);
    });

    it(`divider with children matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 200 }}>
            <JoyDivider data-testid="joy-c">OR</JoyDivider>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <div style={{ width: 200 }}>
          <HintoricDivider data-testid="hintoric-c">OR</HintoricDivider>
        </div>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-c').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-c').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);

      await expect(page.getByTestId('joy-c')).toMatchScreenshot(`divider-children-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-c')).toMatchScreenshot(`divider-children-hintoric-${scheme}`);
    });
  }
});
