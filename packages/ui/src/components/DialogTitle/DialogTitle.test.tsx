import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../Modal';
import { ModalDialog } from '../ModalDialog';
import { DialogTitle } from './DialogTitle';

describe('DialogTitle', () => {
  it('renders its children as a heading', () => {
    render(
      <Modal open>
        <ModalDialog>
          <DialogTitle>Confirm deletion</DialogTitle>
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByRole('heading', { name: 'Confirm deletion' })).toBeInTheDocument();
  });

  it('supports a custom typography level', () => {
    render(
      <Modal open>
        <ModalDialog>
          <DialogTitle level="h4" data-testid="title">
            Confirm
          </DialogTitle>
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByTestId('title')).toHaveClass('text-xl');
  });
});
