import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, DialogActions as JoyDialogActions, Button as JoyButton } from '@mui/joy';
import { DialogActions as HintoricDialogActions } from '../components/DialogActions';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('DialogActions visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's flex layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyDialogActions data-testid="joy">
            <JoyButton>Cancel</JoyButton>
          </JoyDialogActions>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricDialogActions data-testid="hintoric">
          <button>Cancel</button>
        </HintoricDialogActions>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`dialogactions-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`dialogactions-hintoric-${scheme}`);
    });
  }
});
