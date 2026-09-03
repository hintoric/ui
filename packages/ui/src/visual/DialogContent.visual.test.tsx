import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog, DialogContent as JoyDialogContent } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { DialogContent as HintoricDialogContent } from '../components/DialogContent';

describe('DialogContent visual parity with @mui/joy', () => {
  it("matches Joy UI's computed styles", async () => {
    render(
      <JoyCssVarsProvider>
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

    await expect(page.getByTestId('joy')).toMatchScreenshot('dialogcontent-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('dialogcontent-hintoric');
  });
});
