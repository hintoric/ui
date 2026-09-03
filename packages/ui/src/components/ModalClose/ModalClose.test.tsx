import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../Modal';
import { ModalDialog } from '../ModalDialog';
import { ModalClose } from './ModalClose';

describe('ModalClose', () => {
  it('renders a button with a default "Close" label and icon', () => {
    render(
      <Modal open>
        <ModalDialog>
          <ModalClose />
        </ModalDialog>
      </Modal>,
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(
      <Modal open>
        <ModalDialog>
          <ModalClose aria-label="Dismiss" />
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });
});
