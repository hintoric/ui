import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationDialog } from './ConfirmationDialog';
import type { ConfirmationDialogProps } from './types';

function renderDialog(overrides: Partial<ConfirmationDialogProps> = {}) {
  const props: ConfirmationDialogProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    confirmationText: 'kunde-4711',
    title: 'Kunden löschen',
    description: 'Das lässt sich nicht rückgängig machen.',
    prompt: (name) => <>Tippe {name} zum Bestätigen.</>,
    errorMessage: () => 'Löschen fehlgeschlagen.',
    confirmLabel: 'Endgültig löschen',
    cancelLabel: 'Abbrechen',
    ...overrides,
  };
  return { ...render(<ConfirmationDialog {...props} />), props };
}

const confirmButton = () => screen.getByRole('button', { name: 'Endgültig löschen' });
const field = () => screen.getByRole('textbox');

describe('ConfirmationDialog matching rule', () => {
  it('locks the confirm button while the typed text differs', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(field(), 'kunde-471');

    expect(confirmButton()).toBeDisabled();
  });

  it('unlocks the confirm button on an exact match', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(field(), 'kunde-4711');

    expect(confirmButton()).toBeEnabled();
  });

  it('ignores surrounding whitespace on both sides', async () => {
    const user = userEvent.setup();
    renderDialog({ confirmationText: '  kunde-4711 ' });

    await user.type(field(), ' kunde-4711  ');

    expect(confirmButton()).toBeEnabled();
  });

  it('keeps the button locked when only the case differs', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(field(), 'Kunde-4711');

    expect(confirmButton()).toBeDisabled();
  });

  it('keeps the button locked when confirmationText is blank', async () => {
    renderDialog({ confirmationText: '   ' });

    // The untouched, empty field would otherwise read as "equal" and confirm a
    // deletion nobody typed anything for.
    expect(confirmButton()).toBeDisabled();
  });
});

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const cancelButton = () => screen.getByRole('button', { name: 'Abbrechen' });

describe('ConfirmationDialog submitting', () => {
  it('submits on Enter in the field once the text matches', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });

    await user.type(field(), 'kunde-4711{Enter}');

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does nothing on Enter while the text differs', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });

    await user.type(field(), 'kunde-471{Enter}');

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('locks field, cancel and confirm while the deletion is in flight', async () => {
    const user = userEvent.setup();
    const flight = deferred();
    renderDialog({ onConfirm: () => flight.promise });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());

    // The text matches, so a disabled confirm button can only come from the
    // pending state — nothing else disables it here.
    expect(confirmButton()).toBeDisabled();
    expect(field()).toBeDisabled();
    expect(cancelButton()).toBeDisabled();

    flight.resolve();
  });

  it('closes itself exactly once when the deletion succeeds', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose, onConfirm: () => Promise.resolve() });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('shows the mapped error and keeps the typed text when the deletion fails', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({
      onClose,
      onConfirm: () => Promise.reject(new Error('Kunde hat offene Vorgänge')),
      errorMessage: (error) => (error as Error).message,
    });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Kunde hat offene Vorgänge');
    expect(field()).toHaveValue('kunde-4711');
    expect(confirmButton()).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores Escape while the deletion is in flight', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const flight = deferred();
    renderDialog({ onClose, onConfirm: () => flight.promise });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());
    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
    flight.resolve();
  });

  it('closes on Escape while idle', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('runs onConfirm once when the confirm button is clicked twice', async () => {
    const user = userEvent.setup();
    const flight = deferred();
    const onConfirm = vi.fn(() => flight.promise);
    renderDialog({ onConfirm });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());
    await user.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    flight.resolve();
  });
});

describe('ConfirmationDialog wiring', () => {
  it('renders nothing while closed', () => {
    renderDialog({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts with an empty field when reopened for a different object', async () => {
    const user = userEvent.setup();
    const { rerender, props } = renderDialog();

    await user.type(field(), 'kunde-4711');
    rerender(<ConfirmationDialog {...props} open={false} />);
    rerender(<ConfirmationDialog {...props} open confirmationText="kunde-0815" />);

    // Otherwise the previous name is still typed — against a new expected text,
    // or worse, the same one, with the confirm button already unlocked.
    expect(field()).toHaveValue('');
  });

  it('puts the initial focus in the field, not on a button', () => {
    renderDialog();

    expect(field()).toHaveFocus();
  });

  it('connects the prompt label to the field', () => {
    renderDialog();

    expect(screen.getByLabelText(/Tippe kunde-4711 zum Bestätigen\./)).toBe(field());
  });

  it('hands confirmationText to prompt', () => {
    const prompt = vi.fn(() => 'egal');
    renderDialog({ prompt });

    expect(prompt).toHaveBeenCalledWith('kunde-4711');
  });

  it('takes its accessible name and description from title and description', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Kunden löschen');
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Das lässt sich nicht rückgängig machen.');
  });
});

describe('ConfirmationDialog prompt typography', () => {
  it('keeps the prompt as one element so its spaces survive', () => {
    renderDialog();

    // FormLabel is a flex container with `gap: 2px` (it was built for a short
    // label plus a required asterisk). Handing it a sentence with inline
    // emphasis makes every loose text node its own flex item, and each item's
    // leading and trailing whitespace collapses away — "Type kunde-4711 to
    // confirm." then gets 2px gaps where its word spaces should be.
    const label = screen.getByText(/Tippe/).closest('label') as HTMLElement;
    const elementChildren = Array.from(label.childNodes).filter((node) => node.nodeType === 1);
    const textChildren = Array.from(label.childNodes).filter((node) => node.nodeType === 3);

    expect(textChildren).toHaveLength(0);
    expect(elementChildren).toHaveLength(1);
  });
});

describe('ConfirmationDialog under StrictMode', () => {
  // StrictMode runs every effect a second time — mount, cleanup, mount again.
  // A `mounted` ref that is only ever set to false in the cleanup is false from
  // the first render onwards, and every result of `onConfirm` gets discarded
  // with it: no close on success, no error on failure, and a dialog stuck in
  // its loading state forever. Testing Library's plain `render` does not run
  // StrictMode, which is exactly why this needed a real browser to notice.
  function renderStrict(overrides: Partial<ConfirmationDialogProps> = {}) {
    const props: ConfirmationDialogProps = {
      open: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
      confirmationText: 'kunde-4711',
      title: 'Kunden löschen',
      prompt: (name) => <>Tippe {name} zum Bestätigen.</>,
      errorMessage: (error) => (error as Error).message,
      confirmLabel: 'Endgültig löschen',
      cancelLabel: 'Abbrechen',
      ...overrides,
    };
    render(
      <StrictMode>
        <ConfirmationDialog {...props} />
      </StrictMode>,
    );
    return props;
  }

  it('closes when the deletion succeeds', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderStrict({ onClose, onConfirm: () => Promise.resolve() });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('shows the error when the deletion fails, instead of staying in its loading state', async () => {
    const user = userEvent.setup();
    renderStrict({ onConfirm: () => Promise.reject(new Error('Kunde hat offene Vorgänge')) });

    await user.type(field(), 'kunde-4711');
    await user.click(confirmButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Kunde hat offene Vorgänge');
    expect(field()).toBeEnabled();
  });
});
