import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog, DialogContent as JoyDialogContent } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { DialogContent as HintoricDialogContent } from '../components/DialogContent';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('DialogContent visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyModal open>
            <JoyModalDialog>
              <JoyDialogContent data-testid="joy">Are you sure?</JoyDialogContent>
            </JoyModalDialog>
          </JoyModal>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricModal open>
          <HintoricModalDialog>
            <HintoricDialogContent data-testid="hintoric">Are you sure?</HintoricDialogContent>
          </HintoricModalDialog>
        </HintoricModal>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.overflow).toBe(joyStyle.overflow);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`dialogcontent-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`dialogcontent-hintoric-${scheme}`);
    });
  }
});
