import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog, ModalClose as JoyModalClose } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { ModalClose as HintoricModalClose } from '../components/ModalClose';

describe('ModalClose visual parity with @mui/joy', () => {
  it("matches Joy UI's computed styles", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyModal open>
          <JoyModalDialog>
            <JoyModalClose data-testid="joy" />
          </JoyModalDialog>
        </JoyModal>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricModal open>
        <HintoricModalDialog>
          <HintoricModalClose data-testid="hintoric" />
        </HintoricModalDialog>
      </HintoricModal>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.position).toBe(joyStyle.position);
    expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

    await expect(page.getByTestId('joy')).toMatchScreenshot('modalclose-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('modalclose-hintoric');
  });
});
