import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';

// No color/variant axis of its own (that's ModalDialog's job) — tests its
// actual supported state: the backdrop, per CLAUDE.md's allowance.
describe('Modal visual parity with @mui/joy', () => {
  it("renders a full-viewport backdrop, matching Joy UI's positioning", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyModal open>
          <JoyModalDialog data-testid="joy">content</JoyModalDialog>
        </JoyModal>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricModal open>
        <HintoricModalDialog data-testid="hintoric">content</HintoricModalDialog>
      </HintoricModal>,
    );

    const joyBackdrop = document.querySelector('.MuiModal-backdrop') as HTMLElement;
    const hintoricBackdrop = document.querySelector('.z-40') as HTMLElement;

    expect(hintoricBackdrop).toBeTruthy();
    expect(joyBackdrop).toBeTruthy();
    expect(getComputedStyle(hintoricBackdrop).position).toBe(getComputedStyle(joyBackdrop).position);

    await expect(page.getByTestId('joy')).toMatchScreenshot('modal-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('modal-hintoric');
  });
});
