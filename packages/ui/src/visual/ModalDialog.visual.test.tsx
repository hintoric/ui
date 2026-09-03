import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Modal as JoyModal, ModalDialog as JoyModalDialog } from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { lastShadowLayers } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('ModalDialog visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyModal open>
              <JoyModalDialog data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
                {color}
              </JoyModalDialog>
            </JoyModal>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricModal open>
            <HintoricModalDialog data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricModalDialog>
          </HintoricModal>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.padding).toBe(joyStyle.padding);
        expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(lastShadowLayers(joyStyle.boxShadow, 2));

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`modaldialog-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`modaldialog-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed padding`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyModal open>
            <JoyModalDialog data-testid={`joy-size-${size}`} size={size}>
              {size}
            </JoyModalDialog>
          </JoyModal>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricModal open>
          <HintoricModalDialog data-testid={`hintoric-size-${size}`} size={size}>
            {size}
          </HintoricModalDialog>
        </HintoricModal>,
      );

      expect(getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element()).padding).toBe(
        getComputedStyle(page.getByTestId(`joy-size-${size}`).element()).padding,
      );
    });
  }
});
