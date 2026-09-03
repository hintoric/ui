import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListDivider } from './ListDivider';

describe('ListDivider', () => {
  it('renders as an <hr>', () => {
    render(<ListDivider data-testid="d" />);
    expect(screen.getByTestId('d').tagName).toBe('HR');
  });
});
