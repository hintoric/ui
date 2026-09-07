import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Stepper as JoyStepper,
  Step as JoyStep,
  StepIndicator as JoyStepIndicator,
  StepButton as JoyStepButton,
} from '@mui/joy';
import { Stepper as HintoricStepper } from '../components/Stepper';
import { Step as HintoricStep } from '../components/Step';
import { StepIndicator as HintoricStepIndicator } from '../components/StepIndicator';
import { StepButton as HintoricStepButton } from '../components/StepButton';
import { COLOR_SCHEMES, setColorScheme } from './helpers';


describe('Stepper visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    // The bare StepIndicator raster that used to live here has moved to
    // StepIndicator.visual.test.tsx, which composes it inside a real Stepper
    // and Step. Rendering it bare was not merely redundant, it was a
    // misleading oracle: with no Stepper above it, Joy's indicator inherits
    // the page's defaults, and comparing against that produced a wrong fix on
    // 2026-09-07 (a hardcoded 16px) that had to be undone. This file keeps
    // what is genuinely Stepper's own: its sizes and the full composition.
    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed StepIndicator dimensions in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyStepper size={size}>
              <JoyStep>
                <JoyStepIndicator data-testid={`joy-${size}`}>1</JoyStepIndicator>
              </JoyStep>
            </JoyStepper>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricStepper size={size}>
            <HintoricStep>
              <HintoricStepIndicator data-testid={`hintoric-${size}`}>1</HintoricStepIndicator>
            </HintoricStep>
          </HintoricStepper>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${size}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${size}`).element());
        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.height).toBe(joyStyle.height);
      });
    }

    it(`a full horizontal Stepper with StepButtons matches Joy UI visually in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyStepper data-testid="joy-stepper">
            <JoyStep>
              <JoyStepButton>
                <JoyStepIndicator variant="solid" color="primary">
                  1
                </JoyStepIndicator>
              </JoyStepButton>
            </JoyStep>
            <JoyStep>
              <JoyStepButton>
                <JoyStepIndicator variant="soft" color="neutral">
                  2
                </JoyStepIndicator>
              </JoyStepButton>
            </JoyStep>
            <JoyStep>
              <JoyStepButton>
                <JoyStepIndicator variant="soft" color="neutral">
                  3
                </JoyStepIndicator>
              </JoyStepButton>
            </JoyStep>
          </JoyStepper>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricStepper data-testid="hintoric-stepper">
          <HintoricStep>
            <HintoricStepButton>
              <HintoricStepIndicator variant="solid" color="primary">
                1
              </HintoricStepIndicator>
            </HintoricStepButton>
          </HintoricStep>
          <HintoricStep>
            <HintoricStepButton>
              <HintoricStepIndicator variant="soft" color="neutral">
                2
              </HintoricStepIndicator>
            </HintoricStepButton>
          </HintoricStep>
          <HintoricStep>
            <HintoricStepButton>
              <HintoricStepIndicator variant="soft" color="neutral">
                3
              </HintoricStepIndicator>
            </HintoricStepButton>
          </HintoricStep>
        </HintoricStepper>,
      );

      await expect(page.getByTestId('joy-stepper')).toMatchScreenshot(`stepper-full-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-stepper')).toMatchScreenshot(`stepper-full-hintoric-${scheme}`);
    });
  }
});
