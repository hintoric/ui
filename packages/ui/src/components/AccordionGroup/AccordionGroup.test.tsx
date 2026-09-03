import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccordionGroup } from './AccordionGroup';
import { Accordion } from '../Accordion';
import { AccordionSummary } from '../AccordionSummary';
import { AccordionDetails } from '../AccordionDetails';

describe('AccordionGroup', () => {
  it('renders its Accordion children', () => {
    render(
      <AccordionGroup>
        <Accordion>
          <AccordionSummary>Title</AccordionSummary>
          <AccordionDetails>Body</AccordionDetails>
        </Accordion>
      </AccordionGroup>,
    );
    expect(screen.getByRole('button', { name: 'Title' })).toBeInTheDocument();
  });

  it('applies a divider between items by default', () => {
    render(<AccordionGroup data-testid="group" />);
    expect(screen.getByTestId('group')).toHaveClass('[&>*:not(:last-child)]:border-b');
  });

  it('omits the divider classes when disableDivider is set', () => {
    render(<AccordionGroup disableDivider data-testid="group" />);
    expect(screen.getByTestId('group')).not.toHaveClass('[&>*:not(:last-child)]:border-b');
  });
});
