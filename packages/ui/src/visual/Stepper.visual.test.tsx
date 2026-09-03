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

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Stepper visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`StepIndicator ${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyStepIndicator variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>
              1
            </JoyStepIndicator>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricStepIndicator variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
            1
          </HintoricStepIndicator>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.height).toBe(joyStyle.height);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`stepindicator-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`stepindicator-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed StepIndicator dimensions`, async () => {
      render(
        <JoyCssVarsProvider>
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

  it('a full horizontal Stepper with StepButtons matches Joy UI visually', async () => {
    render(
      <JoyCssVarsProvider>
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

    await expect(page.getByTestId('joy-stepper')).toMatchScreenshot('stepper-full-joy');
    await expect(page.getByTestId('hintoric-stepper')).toMatchScreenshot('stepper-full-hintoric');
  });
});
