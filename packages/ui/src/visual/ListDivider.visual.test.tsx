import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListDivider as JoyListDivider } from '@mui/joy';
import { ListDivider as HintoricListDivider } from '../components/ListDivider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('ListDivider visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's divider line in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 200 }}>
            <JoyListDivider data-testid="joy" />
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <div style={{ width: 200 }}>
          <HintoricListDivider data-testid="hintoric" />
        </div>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.height).toBe(joyStyle.height);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`listdivider-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`listdivider-hintoric-${scheme}`);
    });
  }
});
