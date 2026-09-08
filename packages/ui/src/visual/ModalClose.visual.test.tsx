import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog, ModalClose as JoyModalClose } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { ModalClose as HintoricModalClose } from '../components/ModalClose';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('ModalClose visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
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
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`modalclose-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`modalclose-hintoric-${scheme}`);
    });
  }
});
