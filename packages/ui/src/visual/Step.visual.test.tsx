import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
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

// Step is layout-only: no variant or colour of its own (confirmed in
// Step.tsx against Joy's Step.js). What it does contribute is the connector
// line between steps — a `::after` pseudo-element — and the distribution that
// makes steps share the row. Both need a real Stepper above them and a real
// sibling beside them, so every case here renders two steps.
//
// `display` is NOT comparable between the two: Joy's Step is a CSS grid with a
// template placing indicator and label, ours is flex. Same contract, different
// internals — the same situation as Stack (margins vs gap), and the honest
// comparison is the ACHIEVED layout: how much of the row the step occupies and
// where its children sit.
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

describe('Step visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const orientation of ORIENTATIONS) {
      it(`orientation=${orientation} matches Joy UI's computed layout in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <div style={{ width: 320 }}>
              <JoyStepper orientation={orientation}>
                <JoyStep
                  orientation={orientation}
                  indicator={<JoyStepIndicator>1</JoyStepIndicator>}
                  data-testid={`joy-${orientation}`}
                >
                  One
                </JoyStep>
                <JoyStep orientation={orientation} indicator={<JoyStepIndicator>2</JoyStepIndicator>}>
                  Two
                </JoyStep>
              </JoyStepper>
            </div>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <div style={{ width: 320 }}>
              <HintoricStepper orientation={orientation}>
                <HintoricStep orientation={orientation} data-testid={`hintoric-${orientation}`}>
                  <HintoricStepIndicator>1</HintoricStepIndicator>
                  One
                </HintoricStep>
                <HintoricStep orientation={orientation}>
                  <HintoricStepIndicator>2</HintoricStepIndicator>
                  Two
                </HintoricStep>
              </HintoricStepper>
            </div>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${orientation}`);
        const hintoricLocator = page.getByTestId(`hintoric-${orientation}`);
        const joyEl = joyLocator.element();
        const hintoricEl = hintoricLocator.element();

        const joyStyle = getComputedStyle(joyEl);
        const hintoricStyle = getComputedStyle(hintoricEl);

        expect(hintoricEl.tagName).toBe(joyEl.tagName);
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);

        // Achieved layout rather than `display`: the share of the row (or
        // column) this step takes, and whether its indicator sits before its
        // label along the orientation's axis.
        const joyBox = joyEl.getBoundingClientRect();
        const ourBox = hintoricEl.getBoundingClientRect();
        expect(ourBox.width).toBeCloseTo(joyBox.width, 0);

        const joyIndicator = joyEl.firstElementChild as HTMLElement;
        const ourIndicator = hintoricEl.firstElementChild as HTMLElement;
        const axis = orientation === 'vertical' ? 'top' : 'left';
        expect(ourIndicator.getBoundingClientRect()[axis] - ourBox[axis]).toBeCloseTo(
          joyIndicator.getBoundingClientRect()[axis] - joyBox[axis],
          0,
        );

        await expect(joyLocator).toMatchScreenshot(`step-${orientation}-joy-${scheme}`);
        await expect(hintoricLocator).toMatchScreenshot(`step-${orientation}-hintoric-${scheme}`);
      });
    }

    /**
     * The connector is drawn with `::after` and hidden on the last step. If it
     * were not hidden, a stray line would hang off the end of every stepper —
     * and `::after` content is invisible to every assertion except a
     * getComputedStyle on the pseudo-element itself.
     */
    it(`hides the connector on the last step in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricStepper>
            <HintoricStep data-testid="first">
              <HintoricStepIndicator>1</HintoricStepIndicator>
              One
            </HintoricStep>
            <HintoricStep data-testid="last">
              <HintoricStepIndicator>2</HintoricStepIndicator>
              Two
            </HintoricStep>
          </HintoricStepper>
        </ColorSchemeProvider>,
      );

      const first = getComputedStyle(screen.getByTestId('first'), '::after');
      const last = getComputedStyle(screen.getByTestId('last'), '::after');

      expect(first.display).not.toBe('none');
      expect(last.display).toBe('none');
    });

    /**
     * The connector's colour is the only thing Step paints, so it is the one
     * thing that must follow the scheme.
     */
    it(`draws a scheme-aware connector in ${scheme}`, async () => {
      await setColorScheme('light');
      render(
        <ColorSchemeProvider defaultMode="light">
          <HintoricStepper>
            <HintoricStep data-testid={`connector-${scheme}`}>
              <HintoricStepIndicator>1</HintoricStepIndicator>
              One
            </HintoricStep>
            <HintoricStep>
              <HintoricStepIndicator>2</HintoricStepIndicator>
              Two
            </HintoricStep>
          </HintoricStepper>
        </ColorSchemeProvider>,
      );

      const el = screen.getByTestId(`connector-${scheme}`);
      const read = () => getComputedStyle(el, '::after').backgroundColor;

      const light = read();
      await setColorScheme('dark');

      expect(read()).not.toBe(light);
    });
  }
});
