import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListSubheader } from './ListSubheader';

describe('ListSubheader', () => {
  it('renders its children with tertiary text color', () => {
    render(<ListSubheader>Recent</ListSubheader>);
    expect(screen.getByText('Recent')).toHaveClass('text-ink-tertiary');
  });
});
