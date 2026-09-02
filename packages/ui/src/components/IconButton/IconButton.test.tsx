import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders a native button with an accessible label', () => {
    render(<IconButton aria-label="close">×</IconButton>);
    expect(screen.getByRole('button', { name: 'close' })).toBeInTheDocument();
  });

  it('defaults to plain/neutral and a square md size', () => {
    render(<IconButton aria-label="close">×</IconButton>);
    expect(screen.getByRole('button')).toHaveClass('text-neutral-plain-color', 'size-9');
  });

  it('applies solid/danger classes when requested', () => {
    render(
      <IconButton variant="solid" color="danger" aria-label="delete">
        ×
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('bg-danger-solid-bg');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="close" onClick={onClick}>
        ×
      </IconButton>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="close" ref={ref}>
        ×
      </IconButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
