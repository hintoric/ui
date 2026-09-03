import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialogActions } from './DialogActions';

describe('DialogActions', () => {
  it('renders its children in a reversed flex row (right-aligned effect)', () => {
    render(
      <DialogActions data-testid="actions">
        <button>Cancel</button>
        <button>Confirm</button>
      </DialogActions>,
    );
    expect(screen.getByTestId('actions')).toHaveClass('flex', 'flex-row-reverse');
  });
});
