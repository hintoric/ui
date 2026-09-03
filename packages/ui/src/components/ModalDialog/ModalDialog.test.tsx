import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../Modal';
import { ModalDialog } from './ModalDialog';

describe('ModalDialog', () => {
  it('defaults to outlined/neutral/md', () => {
    render(
      <Modal open>
        <ModalDialog data-testid="dialog">content</ModalDialog>
      </Modal>,
    );
    expect(screen.getByTestId('dialog')).toHaveClass('border-neutral-outlined-border', 'p-5');
  });

  it('applies variant and color classes', () => {
    render(
      <Modal open>
        <ModalDialog data-testid="dialog" variant="solid" color="danger">
          content
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByTestId('dialog')).toHaveClass('bg-danger-solid-bg');
  });

  it('applies size classes', () => {
    render(
      <Modal open>
        <ModalDialog data-testid="dialog" size="lg">
          content
        </ModalDialog>
      </Modal>,
    );
    expect(screen.getByTestId('dialog')).toHaveClass('p-6');
  });
});
