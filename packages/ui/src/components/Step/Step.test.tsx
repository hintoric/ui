import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from '../Stepper';
import { Step } from './Step';
import { StepIndicator } from '../StepIndicator';

describe('Step', () => {
  it('renders as a list item', () => {
    render(
      <Stepper>
        <Step>
          <StepIndicator>1</StepIndicator>
        </Step>
      </Stepper>,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('exposes active/completed as data attributes', () => {
    render(
      <Stepper>
        <Step active data-testid="active-step" />
        <Step completed data-testid="completed-step" />
      </Stepper>,
    );
    expect(screen.getByTestId('active-step')).toHaveAttribute('data-active');
    expect(screen.getByTestId('completed-step')).toHaveAttribute('data-completed');
  });

  it('hides the connector on the last step', () => {
    render(
      <Stepper>
        <Step data-testid="step-1" />
        <Step data-testid="step-2" />
      </Stepper>,
    );
    expect(screen.getByTestId('step-2')).toHaveClass('last:after:hidden');
  });

  it('dims when disabled', () => {
    render(<Step disabled data-testid="step" />);
    expect(screen.getByTestId('step')).toHaveClass('opacity-60');
  });
});
