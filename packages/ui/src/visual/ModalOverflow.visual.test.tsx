import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalOverflow as JoyModalOverflow, ModalDialog as JoyModalDialog } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalOverflow as HintoricModalOverflow } from '../components/ModalOverflow';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('ModalOverflow visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`scrolls tall content, matching Joy UI's overflow behavior in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
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
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`modaloverflow-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`modaloverflow-hintoric-${scheme}`);
    });
  }
});
