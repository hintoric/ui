import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
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
import { COLOR_SCHEMES, settleTransitions, setColorScheme } from './helpers';

// Composed inside a real AccordionGroup + Accordion, never in a hand-built
// parent. That is the structural finding of the 2026-09-06 coverage audit:
// CardCover's test built its own `position: relative` wrapper and therefore
// verified CardCover against a parent the real Card never provided, which is
// how Card's missing `position: relative` survived.
//
// AccordionSummary renders the clickable header. Its variant/colour come from
// the enclosing Accordion, so the raster is crossed on the Accordion and read
// off the summary — which is exactly the composition a consumer writes.
// The two implementations put the summary's look on different slots: ours is
// `BaseAccordion.Trigger`, which IS the <button> and receives the test id,
// while Joy wraps a styled ListItemButton inside a root element that receives
// the id. Comparing the id'd elements directly would compare a button against
// a wrapper — the audit's third mechanism. Resolve to the button on both sides
// instead, since that is the element carrying the appearance in both.
function summaryButton(testId: string): HTMLElement {
  const el = page.getByTestId(testId).element() as HTMLElement;
  return el.tagName === 'BUTTON' ? el : (el.querySelector('button') as HTMLElement);
}

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('AccordionSummary visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyAccordionGroup>
                <JoyAccordion variant={variant} color={color}>
                  <JoyAccordionSummary data-testid={`joy-${variant}-${color}`}>
                    Title
                  </JoyAccordionSummary>
                  <JoyAccordionDetails>Body</JoyAccordionDetails>
                </JoyAccordion>
              </JoyAccordionGroup>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricAccordionGroup>
                <HintoricAccordion variant={variant} color={color}>
                  <HintoricAccordionSummary data-testid={`hintoric-${variant}-${color}`}>
                    Title
                  </HintoricAccordionSummary>
                  <HintoricAccordionDetails>Body</HintoricAccordionDetails>
                </HintoricAccordion>
              </HintoricAccordionGroup>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(summaryButton(`joy-${variant}-${color}`));
          const hintoricStyle = getComputedStyle(summaryButton(`hintoric-${variant}-${color}`));

          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(joyLocator).toMatchScreenshot(
            `accordionsummary-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `accordionsummary-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * The summary is the interactive part of an Accordion, so it has the
     * states CLAUDE.md rule 2 asks for. Focus is the highest-yield one by the
     * coverage audit's own count.
     */
    it(`shows the same focus-visible treatment as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyAccordionGroup>
            <JoyAccordion>
              <JoyAccordionSummary data-testid="joy-focus">Title</JoyAccordionSummary>
              <JoyAccordionDetails>Body</JoyAccordionDetails>
            </JoyAccordion>
          </JoyAccordionGroup>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricAccordionGroup>
            <HintoricAccordion>
              <HintoricAccordionSummary data-testid="hintoric-focus">
                Title
              </HintoricAccordionSummary>
              <HintoricAccordionDetails>Body</HintoricAccordionDetails>
            </HintoricAccordion>
          </HintoricAccordionGroup>
        </ColorSchemeProvider>,
      );

      const joyButton = summaryButton('joy-focus');
      const hintoricButton = summaryButton('hintoric-focus');

      joyButton.focus();
      await settleTransitions();
      const joyOutline = getComputedStyle(joyButton).outlineWidth;
      joyButton.blur();

      hintoricButton.focus();
      await settleTransitions();
      const hintoricOutline = getComputedStyle(hintoricButton).outlineWidth;
      hintoricButton.blur();

      expect(hintoricOutline).toBe(joyOutline);
    });
  }
});
