import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../Modal';
import { ModalDialog } from '../ModalDialog';
import { DialogContent } from './DialogContent';

describe('DialogContent', () => {
  it('renders its children with tertiary text color', () => {
    render(
      <Modal open>
        <ModalDialog>
          <DialogContent>This action cannot be undone.</DialogContent>
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByText('This action cannot be undone.')).toHaveClass('text-ink-tertiary');
  });
});
