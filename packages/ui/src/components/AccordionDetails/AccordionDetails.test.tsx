import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReducedMotionProvider } from '../../theme/ReducedMotionProvider';
import { Accordion } from '../Accordion';
import { AccordionSummary } from '../AccordionSummary';
import { AccordionDetails } from './AccordionDetails';

describe('AccordionDetails', () => {
  it('is hidden while the accordion is collapsed', () => {
    render(
      <Accordion>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body content</AccordionDetails>
      </Accordion>,
    );
    expect(screen.queryByText('Body content')).not.toBeInTheDocument();
  });

  it('becomes visible once expanded', async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body content</AccordionDetails>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'Title' }));
    expect(screen.getByText('Body content')).toBeVisible();
  });

  it('does not animate height when reduced motion is provided', () => {
    render(
      <ReducedMotionProvider reducedMotion>
        <Accordion defaultExpanded>
          <AccordionSummary>Title</AccordionSummary>
          <AccordionDetails data-testid="details">Body content</AccordionDetails>
        </Accordion>
      </ReducedMotionProvider>,
    );
    expect(screen.getByTestId('details')).not.toHaveClass('transition-[height]');
  });
});
