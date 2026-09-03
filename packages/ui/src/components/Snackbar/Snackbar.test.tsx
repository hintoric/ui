import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  it('renders nothing when closed', () => {
    render(<Snackbar open={false}>Saved</Snackbar>);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(<Snackbar open>Saved</Snackbar>);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(<Snackbar open>Saved</Snackbar>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to outlined/neutral', () => {
    render(
      <Snackbar open data-testid="bar">
        Saved
      </Snackbar>,
    );
    expect(screen.getByTestId('bar')).toHaveClass('text-neutral-outlined-color');
  });

  it('renders decorators', () => {
    render(
      <Snackbar open startDecorator={<span>start</span>} endDecorator={<span>end</span>}>
        Saved
      </Snackbar>,
    );
    expect(screen.getByText('start')).toBeInTheDocument();
    expect(screen.getByText('end')).toBeInTheDocument();
  });

  describe('autoHideDuration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls onClose after the given duration', () => {
      const onClose = vi.fn();
      render(
        <Snackbar open onClose={onClose} autoHideDuration={2000}>
          Saved
        </Snackbar>,
      );
      expect(onClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(2000);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not auto-close when autoHideDuration is null', () => {
      const onClose = vi.fn();
      render(
        <Snackbar open onClose={onClose} autoHideDuration={null}>
          Saved
        </Snackbar>,
      );
      vi.advanceTimersByTime(100000);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
