import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';
import { Step } from '../Step';
import { StepIndicator } from '../StepIndicator';

describe('Stepper', () => {
  it('renders as a list containing its Step children', () => {
    render(
      <Stepper>
        <Step>
          <StepIndicator>1</StepIndicator>
        </Step>
      </Stepper>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('lays out horizontally by default', () => {
    render(<Stepper data-testid="stepper" />);
    expect(screen.getByTestId('stepper')).toHaveClass('flex-row');
  });

  it('lays out vertically when orientation="vertical"', () => {
    render(<Stepper orientation="vertical" data-testid="stepper" />);
    expect(screen.getByTestId('stepper')).toHaveClass('flex-col');
  });
});
