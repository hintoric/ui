import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Accordion visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed item background (Accordion's own root)`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyAccordionGroup>
              <JoyAccordion variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>
                <JoyAccordionSummary>Title</JoyAccordionSummary>
                <JoyAccordionDetails>Body</JoyAccordionDetails>
              </JoyAccordion>
            </JoyAccordionGroup>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricAccordionGroup>
            <HintoricAccordion variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
              <HintoricAccordionSummary>Title</HintoricAccordionSummary>
              <HintoricAccordionDetails>Body</HintoricAccordionDetails>
            </HintoricAccordion>
          </HintoricAccordionGroup>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`accordion-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`accordion-${variant}-${color}-hintoric`);
      });
    }
  }

  // A real, non-obvious Joy UI quirk (verified against its actual computed
  // styles, not just the source formula): AccordionSummary and
  // AccordionDetails do NOT inherit the enclosing Accordion's variant/color
  // — they always default to plain/neutral independently, so a "solid/
  // danger" Accordion still renders a transparent summary. What LOOKS like a
  // colored summary in a screenshot is really the Accordion item's own
  // background showing through from behind it.
  it("AccordionSummary stays transparent regardless of the Accordion's own variant/color", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyAccordion variant="solid" color="danger">
          <JoyAccordionSummary data-testid="joy-summary">Title</JoyAccordionSummary>
          <JoyAccordionDetails>Body</JoyAccordionDetails>
        </JoyAccordion>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricAccordion variant="solid" color="danger">
        <HintoricAccordionSummary data-testid="hintoric-summary">Title</HintoricAccordionSummary>
        <HintoricAccordionDetails>Body</HintoricAccordionDetails>
      </HintoricAccordion>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-summary').element());
    const hintoricButtonStyle = getComputedStyle(page.getByRole('button', { name: 'Title' }).nth(1).element());

    expect(joyStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(hintoricButtonStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('AccordionDetails applies its own variant/color when explicitly given', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyAccordion>
          <JoyAccordionSummary>Title</JoyAccordionSummary>
          <JoyAccordionDetails variant="soft" color="success" data-testid="joy-details">
            Body
          </JoyAccordionDetails>
        </JoyAccordion>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricAccordion defaultExpanded>
        <HintoricAccordionSummary>Title</HintoricAccordionSummary>
        <HintoricAccordionDetails variant="soft" color="success" data-testid="hintoric-details">
          Body
        </HintoricAccordionDetails>
      </HintoricAccordion>,
    );

    // Joy's AccordionDetails is collapsed but keeps its background styling
    // computable even while hidden; force ours open (via defaultExpanded)
    // since Base UI unmounts a closed panel's content by default.
    const joyStyle = getComputedStyle(page.getByTestId('joy-details').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-details').element());

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.color).toBe(joyStyle.color);
  });

  it('expanding toggles aria-expanded and reveals the details panel, matching Joy UI', async () => {
    const joyUser = userEvent.setup();
    render(
      <JoyCssVarsProvider>
        <JoyAccordion>
          <JoyAccordionSummary>Title</JoyAccordionSummary>
          <JoyAccordionDetails>Body content</JoyAccordionDetails>
        </JoyAccordion>
      </JoyCssVarsProvider>,
    );
    const joyButton = page.getByRole('button', { name: 'Title' }).nth(0);
    await joyUser.click(joyButton.element());

    const hintoricUser = userEvent.setup();
    render(
      <HintoricAccordion>
        <HintoricAccordionSummary>Title</HintoricAccordionSummary>
        <HintoricAccordionDetails>Body content</HintoricAccordionDetails>
      </HintoricAccordion>,
    );
    const hintoricButton = page.getByRole('button', { name: 'Title' }).nth(1);
    await hintoricUser.click(hintoricButton.element());

    expect(joyButton.element().getAttribute('aria-expanded')).toBe('true');
    expect(hintoricButton.element().getAttribute('aria-expanded')).toBe('true');

    expect(page.getByText('Body content').nth(0).element()).toBeTruthy();
    expect(page.getByText('Body content').nth(1).element()).toBeTruthy();
  });
});
