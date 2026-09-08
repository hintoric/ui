import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, CardContent as JoyCardContent } from '@mui/joy';
import { CardContent as HintoricCardContent } from '../components/CardContent';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('CardContent visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's flex column layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyCardContent data-testid="joy">
            <p>Body</p>
          </JoyCardContent>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricCardContent data-testid="hintoric">
          <p>Body</p>
        </HintoricCardContent>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`cardcontent-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`cardcontent-hintoric-${scheme}`);
    });
  }
});
