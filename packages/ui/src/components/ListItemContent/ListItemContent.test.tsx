import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListItemContent } from './ListItemContent';

describe('ListItemContent', () => {
  it('renders its children and fills available space', () => {
    render(<ListItemContent data-testid="c">Label</ListItemContent>);
    expect(screen.getByTestId('c')).toHaveClass('flex-1', 'min-w-0');
    expect(screen.getByText('Label')).toBeInTheDocument();
  });
});
