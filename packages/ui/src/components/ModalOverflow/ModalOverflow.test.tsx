import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalOverflow } from './ModalOverflow';

describe('ModalOverflow', () => {
  it('renders its children and scrolls vertically when content overflows', () => {
    render(<ModalOverflow data-testid="overflow">content</ModalOverflow>);
    expect(screen.getByTestId('overflow')).toHaveClass('overflow-y-auto');
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
