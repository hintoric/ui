'use client';
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  keepMounted?: boolean;
}

// Joy UI's Modal is the behavior/backdrop layer; ModalDialog (a Card-styled
// box) is rendered as its child — matching Base UI's Dialog.Root + Portal +
// Backdrop split. Confirmed against @mui/joy's Modal.js source.
export function Modal({ open, onClose, children, keepMounted = false }: ModalProps) {
  const reducedMotion = useReducedMotion();

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => !next && onClose?.()}>
      <BaseDialog.Portal keepMounted={keepMounted}>
        <BaseDialog.Backdrop
          className={cx(
            'fixed inset-0 z-40 bg-black/50',
            !reducedMotion && 'transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">{children}</div>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
