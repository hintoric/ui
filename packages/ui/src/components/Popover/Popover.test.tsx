import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from './Popover';

const rect = { x: 100, y: 100, width: 80, height: 20 };

describe('Popover', () => {
  it('renders its children when open, nothing when closed', () => {
    const { rerender } = render(
      <Popover open anchorRect={rect}>
        <button>Bold</button>
      </Popover>,
    );
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    rerender(
      <Popover open={false} anchorRect={rect}>
        <button>Bold</button>
      </Popover>,
    );
    expect(screen.queryByRole('button', { name: 'Bold' })).not.toBeInTheDocument();
  });

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Popover open onClose={onClose} anchorRect={rect}>
        <button>Bold</button>
      </Popover>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on a press outside', async () => {
    const onClose = vi.fn();
    render(
      <div>
        <p>page</p>
        <Popover open onClose={onClose} anchorRect={rect}>
          <button>Bold</button>
        </Popover>
      </div>,
    );
    await userEvent.click(screen.getByText('page'));
    expect(onClose).toHaveBeenCalled();
  });
});
