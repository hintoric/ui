import type * as React from 'react';
import type { JoyColor } from '../../utils/colorVariantClasses';

export interface ConfirmationDialogProps {
  open: boolean;
  /** Called by the block itself too, as soon as `onConfirm` has succeeded. */
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  /** What the user has to type — usually the name of the thing being deleted. */
  confirmationText: string;

  title: React.ReactNode;
  description?: React.ReactNode;
  /**
   * The sentence above the field. Receives `confirmationText`, so what is shown
   * and what is compared cannot drift apart.
   */
  prompt: (confirmationText: string) => React.ReactNode;
  /** Turns a rejection from `onConfirm` into text for the error alert. */
  errorMessage: (error: unknown) => React.ReactNode;
  confirmLabel: React.ReactNode;
  cancelLabel: React.ReactNode;

  /** Reaches the confirm button and the error alert — never the surface or the field. */
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
}
