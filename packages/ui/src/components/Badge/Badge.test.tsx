import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children and badgeContent', () => {
    render(
      <Badge badgeContent={3}>
        <span>inbox</span>
      </Badge>,
    );
    expect(screen.getByText('inbox')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('caps badgeContent at max, appending +', () => {
    render(<Badge badgeContent={150} max={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('hides the dot when badgeContent is 0 and showZero is false', () => {
    render(<Badge badgeContent={0} data-testid="wrap" />);
    const dot = screen.getByTestId('wrap').lastElementChild as HTMLElement;
    expect(dot).toHaveClass('scale-0');
  });

  it('shows a zero badge when showZero is set', () => {
    render(<Badge badgeContent={0} showZero data-testid="wrap" />);
    const dot = screen.getByTestId('wrap').lastElementChild as HTMLElement;
    expect(dot).toHaveClass('scale-100');
  });

  it('hides via invisible prop', () => {
    render(<Badge badgeContent={1} invisible data-testid="wrap" />);
    const dot = screen.getByTestId('wrap').lastElementChild as HTMLElement;
    expect(dot).toHaveClass('scale-0');
  });

  it('defaults to solid/primary', () => {
    render(<Badge badgeContent={1} data-testid="wrap" />);
    const dot = screen.getByTestId('wrap').lastElementChild as HTMLElement;
    expect(dot).toHaveClass('bg-primary-solid-bg');
  });
});
