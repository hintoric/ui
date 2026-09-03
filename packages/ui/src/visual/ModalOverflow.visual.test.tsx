import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalOverflow as JoyModalOverflow, ModalDialog as JoyModalDialog } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalOverflow as HintoricModalOverflow } from '../components/ModalOverflow';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';

describe('ModalOverflow visual parity with @mui/joy', () => {
  it("scrolls tall content, matching Joy UI's overflow behavior", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyModal open>
          <JoyModalOverflow data-testid="joy">
            <JoyModalDialog>content</JoyModalDialog>
          </JoyModalOverflow>
        </JoyModal>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricModal open>
        <HintoricModalOverflow data-testid="hintoric">
          <HintoricModalDialog>content</HintoricModalDialog>
        </HintoricModalOverflow>
      </HintoricModal>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.overflowY).toBe(joyStyle.overflowY);

    await expect(page.getByTestId('joy')).toMatchScreenshot('modaloverflow-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('modaloverflow-hintoric');
  });
});
