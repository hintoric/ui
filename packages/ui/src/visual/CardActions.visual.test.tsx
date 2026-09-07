import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, CardActions as JoyCardActions, Button as JoyButton } from '@mui/joy';
import { CardActions as HintoricCardActions } from '../components/CardActions';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('CardActions visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's flex row layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyCardActions data-testid="joy">
            <JoyButton>Save</JoyButton>
          </JoyCardActions>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricCardActions data-testid="hintoric">
          <button>Save</button>
        </HintoricCardActions>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.alignItems).toBe(joyStyle.alignItems);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`cardactions-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`cardactions-hintoric-${scheme}`);
    });
  }
});
