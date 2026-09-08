import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Stepper as JoyStepper,
  Step as JoyStep,
  StepIndicator as JoyStepIndicator,
} from '@mui/joy';
import { Stepper as HintoricStepper } from '../components/Stepper';
import { Step as HintoricStep } from '../components/Step';
import { StepIndicator as HintoricStepIndicator } from '../components/StepIndicator';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Composed inside a real Stepper + Step, unlike the bare rendering in
// Stepper.visual.test.tsx: StepIndicator takes its size from Stepper's
// context, so a bare render verifies it against a default the real component
// tree may never provide. This is the audit's structural finding applied to
// the one component that already had partial coverage without its own file.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('StepIndicator visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyStepper>
                <JoyStep
                  indicator={
                    <JoyStepIndicator
                      variant={variant}
                      color={color}
                      data-testid={`joy-${variant}-${color}`}
                    >
                      1
                    </JoyStepIndicator>
                  }
                >
                  One
                </JoyStep>
              </JoyStepper>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricStepper>
                <HintoricStep>
                  <HintoricStepIndicator
                    variant={variant}
                    color={color}
                    data-testid={`hintoric-${variant}-${color}`}
                  >
                    1
                  </HintoricStepIndicator>
                  One
                </HintoricStep>
              </HintoricStepper>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.width).toBe(joyStyle.width);
          expect(hintoricStyle.height).toBe(joyStyle.height);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);

          await expect(joyLocator).toMatchScreenshot(
            `stepindicator-part-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `stepindicator-part-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * The indicator is a circle, and it only stays a circle while it stays
     * square. Its size comes from Stepper's context, so every size is checked
     * against Joy's — a single wrong entry shows up nowhere else.
     */
    it(`matches Joy UI's dimensions at every Stepper size in ${scheme}`, async () => {
      await setColorScheme(scheme);

      for (const size of SIZES) {
        const joy = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyStepper size={size}>
              <JoyStep indicator={<JoyStepIndicator data-testid="joy-size">1</JoyStepIndicator>}>
                One
              </JoyStep>
            </JoyStepper>
          </JoyCssVarsProvider>,
        );
        const joyEl = page.getByTestId('joy-size').element();
        const joyBox = [
          getComputedStyle(joyEl).width,
          getComputedStyle(joyEl).height,
          getComputedStyle(joyEl).fontSize,
        ].join('|');
        joy.unmount();

        const ours = render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricStepper size={size}>
              <HintoricStep>
                <HintoricStepIndicator data-testid="hintoric-size">1</HintoricStepIndicator>
                One
              </HintoricStep>
            </HintoricStepper>
          </ColorSchemeProvider>,
        );
        const el = page.getByTestId('hintoric-size').element();
        const ourBox = [
          getComputedStyle(el).width,
          getComputedStyle(el).height,
          getComputedStyle(el).fontSize,
        ].join('|');
        ours.unmount();

        expect(ourBox, `size=${size}`).toBe(joyBox);
      }
    });
  }
});
