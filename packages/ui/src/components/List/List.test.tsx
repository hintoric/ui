import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List } from './List';

describe('List', () => {
  it('renders as a <ul> by default', () => {
    render(<List data-testid="l" />);
    expect(screen.getByTestId('l').tagName).toBe('UL');
  });

  it('defaults to a vertical flex column', () => {
    render(<List data-testid="l" />);
    expect(screen.getByTestId('l')).toHaveClass('flex-col');
  });

  it('switches to a horizontal row', () => {
    render(<List data-testid="l" orientation="horizontal" />);
    expect(screen.getByTestId('l')).toHaveClass('flex-row');
  });
});
