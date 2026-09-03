import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    render(<Drawer open={false}>Menu</Drawer>);
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(<Drawer open>Menu</Drawer>);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose}>
        Menu
      </Drawer>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('defaults to plain/neutral', () => {
    render(
      <Drawer open data-testid="panel">
        Menu
      </Drawer>,
    );
    expect(screen.getByTestId('panel')).toHaveClass('text-neutral-plain-color');
  });

  it('anchors to the left by default (full height, translates on enter/exit)', () => {
    render(
      <Drawer open data-testid="panel">
        Menu
      </Drawer>,
    );
    expect(screen.getByTestId('panel')).toHaveClass('left-0', 'h-full');
  });
});
