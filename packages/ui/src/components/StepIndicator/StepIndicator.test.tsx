import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';
import { Stepper } from '../Stepper';

describe('StepIndicator', () => {
  it('renders its children', () => {
    render(<StepIndicator>1</StepIndicator>);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('defaults to soft/neutral', () => {
    render(<StepIndicator data-testid="indicator">1</StepIndicator>);
    expect(screen.getByTestId('indicator')).toHaveClass('text-neutral-soft-color', 'bg-neutral-soft-bg');
  });

  it('sizes from the enclosing Stepper', () => {
    render(
      <Stepper size="lg">
        <StepIndicator data-testid="indicator">1</StepIndicator>
      </Stepper>,
    );
    expect(screen.getByTestId('indicator')).toHaveClass('h-7', 'w-7');
  });
});
