import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '../../theme/ReducedMotionProvider';
import { Accordion } from '../Accordion';
import { AccordionSummary } from './AccordionSummary';
import { AccordionDetails } from '../AccordionDetails';

describe('AccordionSummary', () => {
  it('renders as a button labelled by its children', () => {
    render(
      <Accordion>
        <AccordionSummary>Section title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: 'Section title' })).toBeInTheDocument();
  });

  it('renders a custom indicator when provided', () => {
    render(
      <Accordion>
        <AccordionSummary indicator={<span data-testid="custom-indicator" />}>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    expect(screen.getByTestId('custom-indicator')).toBeInTheDocument();
  });

  it('does not animate the indicator when reduced motion is provided', () => {
    render(
      <ReducedMotionProvider reducedMotion>
        <Accordion>
          <AccordionSummary indicator={<span data-testid="custom-indicator" />}>Title</AccordionSummary>
          <AccordionDetails>Body</AccordionDetails>
        </Accordion>
      </ReducedMotionProvider>,
    );
    expect(screen.getByTestId('custom-indicator').parentElement).not.toHaveClass('transition-transform');
  });
});
