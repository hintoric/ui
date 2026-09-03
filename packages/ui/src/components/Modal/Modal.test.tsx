import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';
import { ModalDialog } from '../ModalDialog';
import { ModalClose } from '../ModalClose';
import { DialogTitle } from '../DialogTitle';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false}>
        <ModalDialog>
          <DialogTitle>Confirm</DialogTitle>
        </ModalDialog>
      </Modal>,
    );
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Modal open>
        <ModalDialog>
          <DialogTitle>Confirm</DialogTitle>
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('calls onClose when ModalClose is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <ModalDialog>
          <DialogTitle>Confirm</DialogTitle>
          <ModalClose />
        </ModalDialog>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <ModalDialog>
          <DialogTitle>Confirm</DialogTitle>
        </ModalDialog>
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
