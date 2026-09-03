import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders its children', () => {
    render(<Chip>Beta</Chip>);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('defaults to soft/neutral/md', () => {
    render(<Chip>Default</Chip>);
    expect(screen.getByText('Default').parentElement).toHaveClass('bg-neutral-soft-bg', 'min-h-6');
  });

  it('applies variant and color classes', () => {
    render(
      <Chip variant="solid" color="danger">
        Alert
      </Chip>,
    );
    expect(screen.getByText('Alert').parentElement).toHaveClass('bg-danger-solid-bg', 'text-danger-solid-color');
  });

  it('applies size classes', () => {
    render(
      <Chip size="lg" data-testid="chip">
        Large
      </Chip>,
    );
    expect(screen.getByTestId('chip')).toHaveClass('min-h-7', 'text-base');
  });

  it('renders decorators around the label', () => {
    render(
      <Chip startDecorator={<span data-testid="start">S</span>} endDecorator={<span data-testid="end">E</span>}>
        Label
      </Chip>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders as a different element via component prop', () => {
    render(
      <Chip component="span" data-testid="chip">
        Span chip
      </Chip>,
    );
    expect(screen.getByTestId('chip').tagName).toBe('SPAN');
  });
});
