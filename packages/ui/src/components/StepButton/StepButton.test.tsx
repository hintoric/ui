import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepButton } from './StepButton';
import { StepIndicator } from '../StepIndicator';

describe('StepButton', () => {
  it('renders as a button with its children', () => {
    render(
      <StepButton>
        <StepIndicator>1</StepIndicator>
        Step one
      </StepButton>,
    );
    expect(screen.getByRole('button', { name: '1 Step one' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StepButton onClick={onClick}>Step one</StepButton>);
    await user.click(screen.getByRole('button', { name: 'Step one' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<StepButton disabled>Step one</StepButton>);
    expect(screen.getByRole('button', { name: 'Step one' })).toBeDisabled();
  });
});
