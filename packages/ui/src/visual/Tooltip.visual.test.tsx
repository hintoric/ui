import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Modal as JoyModal,
  ModalDialog as JoyModalDialog,
  Tooltip as JoyTooltip,
} from '@mui/joy';
import { Modal as HintoricModal } from '../components/Modal';
import { ModalDialog as HintoricModalDialog } from '../components/ModalDialog';
import { Tooltip as HintoricTooltip } from '../components/Tooltip';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Forcing the popup open (rather than simulating hover) keeps this
// deterministic across jsdom vs a real browser's pointer/hover timing —
// hover behavior itself is covered by Tooltip.test.tsx's interaction test.
//
// No toMatchScreenshot() here: Base UI's floating-ui positioning keeps the
// popup subtly repositioning every frame while two forced-open popups sit on
// screen at once, so the harness's screenshot-stability check never settles
// within its timeout (each attempt costs ~100s). Screenshots are for human
// review only per CLAUDE.md — the computed-style assertions below are the
// actual pass/fail signal, so they stay.
describe('Tooltip visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyTooltip title={color} variant={variant} color={color} open>
                <button>trigger</button>
              </JoyTooltip>
            </JoyCssVarsProvider>,
          );
          render(
            <HintoricTooltip title={color} variant={variant} color={color} defaultOpen>
              <button>trigger</button>
            </HintoricTooltip>,
          );

          const joyPopupLocator = page.getByText(color).nth(0);
          const hintoricPopupLocator = page.getByText(color).nth(1);

          const joyStyle = getComputedStyle(joyPopupLocator.element().closest('[role="tooltip"]') ?? joyPopupLocator.element());
          const hintoricStyle = getComputedStyle(
            hintoricPopupLocator.element().closest('[role="tooltip"]') ?? hintoricPopupLocator.element(),
          );

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
        });
      }
    }
  }
});

// A tooltip on a control inside a Modal must paint above it. Joy stacks the
// tooltip (1500) over the modal (1300); the z-index has to sit on Base UI's
// positioner — the popup inside it is not positioned, so a z-index there is a
// no-op. Hit-testing the popup's centre is the signal: `elementFromPoint`
// returns the popup only if nothing (the modal's layer) covers it.
describe('Tooltip over a Modal', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`paints above the Modal like Joy UI's does in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyModal open>
            <JoyModalDialog data-testid="joy-dialog">
              <JoyTooltip title="joy-tip" placement="top" open>
                <button>joy trigger</button>
              </JoyTooltip>
            </JoyModalDialog>
          </JoyModal>
        </JoyCssVarsProvider>,
      );
      const joyPopup = page.getByText('joy-tip').element() as HTMLElement;
      const joyRect = joyPopup.getBoundingClientRect();
      expect(document.elementFromPoint(joyRect.x + joyRect.width / 2, joyRect.y + joyRect.height / 2)).toBe(joyPopup);
      await expect(page.getByTestId('joy-dialog')).toMatchScreenshot(`tooltip-over-modal-joy-${scheme}`);
    });

    it(`paints above our Modal in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <HintoricModal open>
          <HintoricModalDialog data-testid="hintoric-dialog">
            <HintoricTooltip title="hintoric-tip" placement="top" defaultOpen>
              <button>hintoric trigger</button>
            </HintoricTooltip>
          </HintoricModalDialog>
        </HintoricModal>,
      );
      const popup = page.getByText('hintoric-tip').element() as HTMLElement;
      const rect = popup.getBoundingClientRect();
      expect(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)).toBe(popup);
      await expect(page.getByTestId('hintoric-dialog')).toMatchScreenshot(`tooltip-over-modal-hintoric-${scheme}`);
    });
  }
});
