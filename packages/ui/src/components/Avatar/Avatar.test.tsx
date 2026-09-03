import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders initials children', () => {
    render(<Avatar>JW</Avatar>);
    expect(screen.getByText('JW')).toBeInTheDocument();
  });

  it('defaults to soft/neutral/md', () => {
    render(<Avatar data-testid="avatar">JW</Avatar>);
    expect(screen.getByTestId('avatar')).toHaveClass('bg-neutral-soft-bg', 'size-10');
  });

  it('applies variant and color classes', () => {
    render(
      <Avatar data-testid="avatar" variant="solid" color="danger">
        JW
      </Avatar>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('bg-danger-solid-bg', 'text-danger-solid-color');
  });

  it('applies size classes', () => {
    render(
      <Avatar data-testid="avatar" size="lg">
        JW
      </Avatar>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('size-12', 'text-lg');
  });

  it('renders an img when src is provided, ignoring children', () => {
    render(
      <Avatar src="/photo.jpg" alt="Johannes">
        JW
      </Avatar>,
    );
    const img = screen.getByRole('img', { name: 'Johannes' });
    expect(img).toHaveAttribute('src', '/photo.jpg');
    expect(screen.queryByText('JW')).not.toBeInTheDocument();
  });

  it('is circular', () => {
    render(<Avatar data-testid="avatar">JW</Avatar>);
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-[50%]');
  });

  it('is transparent for outlined/plain, unlike Sheet/Chip', () => {
    render(
      <Avatar data-testid="avatar" variant="outlined" color="neutral">
        JW
      </Avatar>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('bg-transparent');
  });
});
