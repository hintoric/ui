import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, CardCover as JoyCardCover } from '@mui/joy';
import { CardCover as HintoricCardCover } from '../components/CardCover';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('CardCover visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's absolute-fill positioning in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <JoyCardCover data-testid="joy">
              <img src="/a.jpg" alt="a" />
            </JoyCardCover>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <HintoricCardCover data-testid="hintoric">
            <img src="/a.jpg" alt="a" />
          </HintoricCardCover>
        </div>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.position).toBe(joyStyle.position);
      expect(hintoricStyle.top).toBe(joyStyle.top);
      expect(hintoricStyle.left).toBe(joyStyle.left);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`cardcover-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`cardcover-hintoric-${scheme}`);
    });
  }
});
