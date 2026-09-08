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

// AccordionGroup has no variant/colour axis of its own — it is the list
// wrapper, and its whole visible contribution is the divider between items,
// which `disableDivider` turns off. So that flag is the raster, and the
// divider is what gets asserted: a `border-*` colour that ignored the scheme
// would be invisible in every light test.
const DIVIDERS = [false, true] as const;

function twoItems(
  Group: typeof HintoricAccordionGroup,
  Item: typeof HintoricAccordion,
  Summary: typeof HintoricAccordionSummary,
  Details: typeof HintoricAccordionDetails,
  testId: string,
  disableDivider: boolean,
) {
  return (
    <Group data-testid={testId} disableDivider={disableDivider}>
      <Item>
        <Summary>First</Summary>
        <Details>Body</Details>
      </Item>
      <Item>
        <Summary>Second</Summary>
        <Details>Body</Details>
      </Item>
    </Group>
  );
}

describe('AccordionGroup visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const disableDivider of DIVIDERS) {
      const key = disableDivider ? 'nodivider' : 'divider';

      it(`disableDivider=${disableDivider} matches Joy UI's computed styles in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <div style={{ width: 320 }}>
              <JoyAccordionGroup data-testid={`joy-${key}`} disableDivider={disableDivider}>
                <JoyAccordion>
                  <JoyAccordionSummary>First</JoyAccordionSummary>
                  <JoyAccordionDetails>Body</JoyAccordionDetails>
                </JoyAccordion>
                <JoyAccordion>
                  <JoyAccordionSummary>Second</JoyAccordionSummary>
                  <JoyAccordionDetails>Body</JoyAccordionDetails>
                </JoyAccordion>
              </JoyAccordionGroup>
            </div>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <div style={{ width: 320 }}>
              {twoItems(
                HintoricAccordionGroup,
                HintoricAccordion,
                HintoricAccordionSummary,
                HintoricAccordionDetails,
                `hintoric-${key}`,
                disableDivider,
              )}
            </div>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${key}`);
        const hintoricLocator = page.getByTestId(`hintoric-${key}`);
        const joyEl = joyLocator.element();
        const hintoricEl = hintoricLocator.element();

        const joyStyle = getComputedStyle(joyEl);
        const hintoricStyle = getComputedStyle(hintoricEl);

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.display).toBe(joyStyle.display);
        // Fills its parent — the sizing assertion P2 of the coverage audit
        // asks for, and a list wrapper is exactly where fill-versus-shrink
        // has bitten this project before.
        expect(hintoricEl.getBoundingClientRect().width).toBeCloseTo(
          joyEl.getBoundingClientRect().width,
          1,
        );

        await expect(joyLocator).toMatchScreenshot(`accordiongroup-${key}-joy-${scheme}`);
        await expect(hintoricLocator).toMatchScreenshot(`accordiongroup-${key}-hintoric-${scheme}`);
      });
    }

    /**
     * The divider is this component's only paint, so it is the one thing that
     * has to follow the scheme. A hardcoded light divider would look right in
     * every light test and wrong on every dark page.
     */
    it(`draws a scheme-aware divider in ${scheme}`, async () => {
      await setColorScheme('light');
      render(
        <ColorSchemeProvider defaultMode="light">
          {twoItems(
            HintoricAccordionGroup,
            HintoricAccordion,
            HintoricAccordionSummary,
            HintoricAccordionDetails,
            `scheme-${scheme}`,
            false,
          )}
        </ColorSchemeProvider>,
      );

      // The divider lives on the items, not the group, and specifically on
      // every child but the last (`[&>*:not(:last-child)]:border-b` in
      // AccordionGroup.tsx) — so it is the FIRST item that carries it.
      const item = screen.getByTestId(`scheme-${scheme}`).children[0] as HTMLElement;
      const readBorders = () => {
        const s = getComputedStyle(item);
        return [s.borderTopColor, s.borderBottomColor].join('|');
      };

      const light = readBorders();
      await setColorScheme('dark');

      expect(readBorders()).not.toBe(light);
    });
  }
});
