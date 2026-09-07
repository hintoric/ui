import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Stepper as JoyStepper,
  Step as JoyStep,
  StepButton as JoyStepButton,
  StepIndicator as JoyStepIndicator,
} from '@mui/joy';
import { Stepper as HintoricStepper } from '../components/Stepper';
import { Step as HintoricStep } from '../components/Step';
import { StepButton as HintoricStepButton } from '../components/StepButton';
import { StepIndicator as HintoricStepIndicator } from '../components/StepIndicator';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, settleTransitions, setColorScheme } from './helpers';

// StepButton has no variant or colour of its own — StepButton.tsx documents it
// as a transparent clickable wrapper, with the colouring living on the child
// StepIndicator. So there is no variant/colour raster; what it must get right
// is being an actual button that inherits the step's typography and shows a
// focus ring.
//
// Composed inside a real Stepper + Step, which is also where its typography
// comes from (Stepper applies the `title-{size}` level and children inherit).
const SIZES = ['sm', 'md', 'lg'] as const;

describe('StepButton visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 320 }}>
            <JoyStepper>
              <JoyStep indicator={<JoyStepIndicator>1</JoyStepIndicator>}>
                <JoyStepButton data-testid="joy-button">One</JoyStepButton>
              </JoyStep>
            </JoyStepper>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 320 }}>
            <HintoricStepper>
              <HintoricStep>
                <HintoricStepIndicator>1</HintoricStepIndicator>
                <HintoricStepButton data-testid="hintoric-button">One</HintoricStepButton>
              </HintoricStep>
            </HintoricStepper>
          </div>
        </ColorSchemeProvider>,
      );

      const joyLocator = page.getByTestId('joy-button');
      const hintoricLocator = page.getByTestId('hintoric-button');
      const joyEl = joyLocator.element();
      const hintoricEl = hintoricLocator.element();

      const joyStyle = getComputedStyle(joyEl);
      const hintoricStyle = getComputedStyle(hintoricEl);

      expect(hintoricEl.tagName).toBe(joyEl.tagName);
      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);

      await expect(joyLocator).toMatchScreenshot(`stepbutton-joy-${scheme}`);
      await expect(hintoricLocator).toMatchScreenshot(`stepbutton-hintoric-${scheme}`);
    });

    /**
     * Typography is inherited from Stepper, not set here, so every Stepper
     * size has to reach the button. A hardcoded size would look right at `md`
     * and wrong at the other two — which is exactly how StepIndicator's own
     * divergence hid until this pass.
     */
    it(`inherits Joy UI's typography at every Stepper size in ${scheme}`, async () => {
      await setColorScheme(scheme);

      for (const size of SIZES) {
        const joy = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyStepper size={size}>
              <JoyStep indicator={<JoyStepIndicator>1</JoyStepIndicator>}>
                <JoyStepButton data-testid="joy-size">One</JoyStepButton>
              </JoyStep>
            </JoyStepper>
          </JoyCssVarsProvider>,
        );
        const j = getComputedStyle(screen.getByTestId('joy-size'));
        const joyType = [j.fontSize, j.fontWeight].join('|');
        joy.unmount();

        const ours = render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricStepper size={size}>
              <HintoricStep>
                <HintoricStepIndicator>1</HintoricStepIndicator>
                <HintoricStepButton data-testid="hintoric-size">One</HintoricStepButton>
              </HintoricStep>
            </HintoricStepper>
          </ColorSchemeProvider>,
        );
        const h = getComputedStyle(screen.getByTestId('hintoric-size'));
        const ourType = [h.fontSize, h.fontWeight].join('|');
        ours.unmount();

        expect(ourType, `size=${size}`).toBe(joyType);
      }
    });

    it(`shows a focus-visible ring in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricStepper>
            <HintoricStep>
              <HintoricStepIndicator>1</HintoricStepIndicator>
              <HintoricStepButton data-testid="focus-button">One</HintoricStepButton>
            </HintoricStep>
          </HintoricStepper>
        </ColorSchemeProvider>,
      );

      const el = screen.getByTestId('focus-button');
      const resting = getComputedStyle(el).outlineWidth;

      el.focus();
      await settleTransitions();
      const focused = getComputedStyle(el).outlineWidth;
      el.blur();

      // A clickable step with no visible focus indicator is unusable by
      // keyboard — the same defect this pass found on AccordionSummary.
      expect(focused).not.toBe(resting);
      expect(parseFloat(focused)).toBeGreaterThan(0);
    });
  }
});
