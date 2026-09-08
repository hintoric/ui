import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListSubheader as JoyListSubheader } from '@mui/joy';
import { ListSubheader as HintoricListSubheader } from '../components/ListSubheader';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('ListSubheader visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListSubheader data-testid="joy">Recent</JoyListSubheader>
        </JoyCssVarsProvider>,
      );
      render(<HintoricListSubheader data-testid="hintoric">Recent</HintoricListSubheader>);

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`listsubheader-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`listsubheader-hintoric-${scheme}`);
    });
  }
});
