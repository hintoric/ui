import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  AccordionGroup as JoyAccordionGroup,
  Accordion as JoyAccordion,
  AccordionSummary as JoyAccordionSummary,
  AccordionDetails as JoyAccordionDetails,
} from '@mui/joy';
import { AccordionGroup as HintoricAccordionGroup } from '../components/AccordionGroup';
import { Accordion as HintoricAccordion } from '../components/Accordion';
import { AccordionSummary as HintoricAccordionSummary } from '../components/AccordionSummary';
import { AccordionDetails as HintoricAccordionDetails } from '../components/AccordionDetails';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Composed inside a real AccordionGroup + Accordion rather than a hand-built
// parent — the structural finding of the 2026-09-06 coverage audit.
//
// AccordionDetails takes its own variant/colour props (unlike the summary,
// which inherits them from the Accordion), so the raster is crossed on the
// details element itself. It also only has a box to measure when the accordion
// is expanded, hence `defaultExpanded`.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('AccordionDetails visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyAccordionGroup>
                <JoyAccordion defaultExpanded>
                  <JoyAccordionSummary>Title</JoyAccordionSummary>
                  <JoyAccordionDetails
                    variant={variant}
                    color={color}
                    data-testid={`joy-${variant}-${color}`}
                  >
                    Body
                  </JoyAccordionDetails>
                </JoyAccordion>
              </JoyAccordionGroup>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricAccordionGroup>
                <HintoricAccordion defaultExpanded>
                  <HintoricAccordionSummary>Title</HintoricAccordionSummary>
                  <HintoricAccordionDetails
                    variant={variant}
                    color={color}
                    data-testid={`hintoric-${variant}-${color}`}
                  >
                    Body
                  </HintoricAccordionDetails>
                </HintoricAccordion>
              </HintoricAccordionGroup>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(joyLocator).toMatchScreenshot(
            `accordiondetails-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `accordiondetails-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * Collapsed is the default state, and a details panel that stays visible
     * when collapsed is the most visible way this component can break.
     */
    it(`is hidden while the accordion is collapsed in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricAccordionGroup>
            <HintoricAccordion>
              <HintoricAccordionSummary>Title</HintoricAccordionSummary>
              <HintoricAccordionDetails data-testid="collapsed">Body</HintoricAccordionDetails>
            </HintoricAccordion>
          </HintoricAccordionGroup>
        </ColorSchemeProvider>,
      );

      const el = screen.queryByTestId('collapsed');
      // Either unmounted or laid out with no height — both hide it; what must
      // not happen is a visible box.
      if (el) {
        expect(el.getBoundingClientRect().height).toBe(0);
      }
    });
  }
});
