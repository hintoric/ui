'use client';
import * as React from 'react';
import { Modal } from '../Modal';
import { ModalDialog } from '../ModalDialog';
import { DialogTitle } from '../DialogTitle';
import { DialogContent } from '../DialogContent';
import { DialogActions } from '../DialogActions';
import { FormControl } from '../FormControl';
import { FormLabel } from '../FormLabel';
import { Input } from '../Input';
import { Button } from '../Button';
import { Alert } from '../Alert';
import type { ConfirmationDialogProps } from './types';

/**
 * Both sides trimmed, then exact — case included. Trimmed because pasting
 * regularly carries a trailing space or newline, and a dialog stuck on an
 * invisible character is broken rather than strict. Case-sensitive because
 * looking closely is the entire point of the friction.
 *
 * A blank `confirmationText` matches nothing: otherwise the untouched, empty
 * field would read as "equal" and confirm a deletion nobody typed for.
 */
function matches(typed: string, confirmationText: string): boolean {
  const expected = confirmationText.trim();
  return expected.length > 0 && typed.trim() === expected;
}

export function ConfirmationDialog({ open, onClose, ...body }: ConfirmationDialogProps) {
  // Escape and a backdrop click both arrive here, and while a deletion is in
  // flight both must do nothing: the request cannot be recalled, so closing
  // would leave the user without the outcome. A ref rather than state because
  // the guard needs to be right synchronously and changes nothing on screen.
  const pendingRef = React.useRef(false);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!pendingRef.current) onClose();
      }}
    >
      {/* Mounted only while open, so the typed text and the error reset
          structurally rather than through an effect. Without this, a dialog
          reopened for a different object would still hold the previous name —
          with the confirm button already unlocked. */}
      <ConfirmationDialogBody pendingRef={pendingRef} onClose={onClose} {...body} />
    </Modal>
  );
}

type BodyProps = Omit<ConfirmationDialogProps, 'open'> & {
  pendingRef: React.MutableRefObject<boolean>;
};

function ConfirmationDialogBody({
  pendingRef,
  onClose,
  onConfirm,
  confirmationText,
  title,
  description,
  prompt,
  errorMessage,
  confirmLabel,
  cancelLabel,
  color = 'danger',
  size = 'md',
}: BodyProps) {
  const [typed, setTyped] = React.useState('');
  const [pending, setPending] = React.useState(false);
  // Wrapped rather than stored bare, so a rejection with a falsy reason still
  // counts as an error to show.
  const [error, setError] = React.useState<{ reason: unknown } | null>(null);
  const fieldId = React.useId();

  const mounted = React.useRef(true);
  React.useEffect(() => {
    // Set on the way in, not just cleared on the way out. StrictMode runs every
    // effect twice — mount, cleanup, mount again — so a ref that is only ever
    // set to false in the cleanup is false from the first render onwards, and
    // every result of `onConfirm` would be discarded with it: no close on
    // success, no error on failure, and a dialog stuck loading forever.
    mounted.current = true;
    return () => {
      mounted.current = false;
      // A caller can pull `open` out from under a flight. Leaving the lock set
      // would make the next Escape inert on a dialog that is not busy at all.
      pendingRef.current = false;
    };
  }, [pendingRef]);

  const ready = matches(typed, confirmationText);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Reads the ref, not the `pending` state: two clicks in one tick would both
    // see a stale `false`.
    if (pendingRef.current || !ready) return;

    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      if (mounted.current) onClose();
    } catch (reason) {
      if (mounted.current) setError({ reason });
    } finally {
      pendingRef.current = false;
      if (mounted.current) setPending(false);
    }
  }

  return (
    <ModalDialog size={size}>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogContent>{description}</DialogContent>}
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <FormControl>
          {/* FormControl in this library only cascades to label and helper, not
              to the field, so the connection is wired by hand. */}
          <FormLabel htmlFor={fieldId}>
            {/* Wrapped in one span on purpose: FormLabel is a flex container
                with a 2px gap, built for a short label plus a required
                asterisk. A bare sentence would have each of its text nodes
                become a flex item, collapsing the word spaces around the
                emphasised name into that gap. */}
            <span>{prompt(confirmationText)}</span>
          </FormLabel>
          <Input
            id={fieldId}
            size={size}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={pending}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </FormControl>
        {error && (
          <Alert variant="soft" color={color} size={size}>
            {errorMessage(error.reason)}
          </Alert>
        )}
        <DialogActions>
          <Button type="submit" variant="solid" color={color} size={size} loading={pending} disabled={!ready}>
            {confirmLabel}
          </Button>
          <Button type="button" variant="plain" color="neutral" size={size} onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
        </DialogActions>
      </form>
    </ModalDialog>
  );
}
