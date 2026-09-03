import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarGroup } from './AvatarGroup';
import { Avatar } from '../Avatar';

describe('AvatarGroup', () => {
  it('renders its Avatar children', () => {
    render(
      <AvatarGroup>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('is a flex row and applies overlap classes for the default size', () => {
    render(<AvatarGroup data-testid="group" />);
    expect(screen.getByTestId('group')).toHaveClass('flex', '[&>*:not(:first-child)]:-ml-2');
  });

  it('applies a different overlap for lg size', () => {
    render(<AvatarGroup data-testid="group" size="lg" />);
    expect(screen.getByTestId('group')).toHaveClass('[&>*:not(:first-child)]:-ml-2.5');
  });
});
