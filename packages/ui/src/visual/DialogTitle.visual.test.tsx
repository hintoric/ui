import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog, DialogTitle as JoyDialogTitle } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { DialogTitle as HintoricDialogTitle } from '../components/DialogTitle';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('DialogTitle visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyModal open>
            <JoyModalDialog>
              <JoyDialogTitle data-testid="joy">Confirm</JoyDialogTitle>
            </JoyModalDialog>
          </JoyModal>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricModal open>
          <HintoricModalDialog>
            <HintoricDialogTitle data-testid="hintoric">Confirm</HintoricDialogTitle>
          </HintoricModalDialog>
        </HintoricModal>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`dialogtitle-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`dialogtitle-hintoric-${scheme}`);
    });
  }
});
