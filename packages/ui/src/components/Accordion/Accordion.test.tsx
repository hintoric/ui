import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';
import { AccordionSummary } from '../AccordionSummary';
import { AccordionDetails } from '../AccordionDetails';

describe('Accordion', () => {
  it('is collapsed by default', () => {
    render(
      <Accordion>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('respects defaultExpanded', () => {
    render(
      <Accordion defaultExpanded>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on click and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Accordion onChange={onChange}>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Title' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onChange).toHaveBeenCalledWith(undefined, true);

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenCalledWith(undefined, false);
  });

  it('supports a fully controlled expanded prop', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [expanded, setExpanded] = useState(false);
      return (
        <Accordion expanded={expanded} onChange={(_e: unknown, next: boolean) => setExpanded(next)}>
          <AccordionSummary>Title</AccordionSummary>
          <AccordionDetails>Body</AccordionDetails>
        </Accordion>
      );
    }
    render(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Title' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not expand when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Accordion disabled>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Title' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('each Accordion expands independently of its siblings', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Accordion>
          <AccordionSummary>First</AccordionSummary>
          <AccordionDetails>Body 1</AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>Second</AccordionSummary>
          <AccordionDetails>Body 2</AccordionDetails>
        </Accordion>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'First' }));
    expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute('aria-expanded', 'false');
  });
});
