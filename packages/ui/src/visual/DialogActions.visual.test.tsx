import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, DialogActions as JoyDialogActions, Button as JoyButton } from '@mui/joy';
import { DialogActions as HintoricDialogActions } from '../components/DialogActions';

describe('DialogActions visual parity with @mui/joy', () => {
  it("matches Joy UI's flex layout", async () => {
    render(
      <JoyCssVarsProvider>
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

    await expect(page.getByTestId('joy')).toMatchScreenshot('dialogactions-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('dialogactions-hintoric');
  });
});
