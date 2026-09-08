import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { ConfirmationDialogProps } from '../components/ConfirmationDialog';
import { Modal } from '../components/Modal';
import { ModalDialog } from '../components/ModalDialog';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Input } from '../components/Input';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

// ConfirmationDialog inherits LocaleSwitcher's exemption from this suite's
// usual "compare against real @mui/joy" rule (see
// docs/superpowers/specs/2026-09-07-confirmation-dialog-design.md): Joy UI has
// no equivalent, and the block brings no look of its own — it is ModalDialog,
// DialogTitle, DialogContent, FormLabel, Input, Alert, DialogActions and
// Button, each of which already carries full Joy-compared coverage.
//
// So it compares against OUR OWN primitives instead, which is the stronger
// signal here: what a composition gets wrong is passing things through. If
// `color` or `size` were swallowed, or if `color` leaked onto the surface,
// exactly these assertions would catch it.

const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const TEXT = 'kunde-4711';

const baseProps: ConfirmationDialogProps = {
  open: true,
  onClose: () => {},
  onConfirm: () => {},
  confirmationText: TEXT,
  title: 'Kunden löschen',
  description: 'Alle Vorgänge dieses Kunden werden mitgelöscht.',
  prompt: (name) => <>Tippe {name} zum Bestätigen.</>,
  errorMessage: () => 'Kunde hat offene Vorgänge.',
  confirmLabel: 'Endgültig löschen',
  cancelLabel: 'Abbrechen',
};

const never = () => new Promise<void>(() => {});
const rejects = () => Promise.reject(new Error('offene Vorgänge'));

// Scoped to the dialog on purpose: these tests render reference primitives
// beside it, and an unscoped getByRole('textbox') or getByRole('alert') would
// find the reference instead of the real thing.
const dialog = () => screen.getByRole('dialog');
const confirmButton = () => within(dialog()).getByRole('button', { name: 'Endgültig löschen' });
const cancelButton = () => within(dialog()).getByRole('button', { name: 'Abbrechen' });
const field = () => within(dialog()).getByRole('textbox');
const errorAlert = () => within(dialog()).getByRole('alert');

type State = 'empty' | 'matched' | 'pending' | 'error';

/** Renders the dialog and drives it into one of its four visual states. */
async function renderState(state: State, overrides: Partial<ConfirmationDialogProps> = {}) {
  const onConfirm = state === 'pending' ? never : state === 'error' ? rejects : () => {};
  render(<ConfirmationDialog {...baseProps} onConfirm={onConfirm} {...overrides} />);

  if (state === 'empty') {
    await settleTransitions();
    return;
  }

  const user = userEvent.setup();
  await user.type(field(), TEXT);
  if (state !== 'matched') {
    await user.click(confirmButton());
    if (state === 'error') await within(dialog()).findByRole('alert');
  }
  await settleTransitions();
}

describe('ConfirmationDialog visual (self-baseline)', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const color of COLORS) {
      for (const state of ['empty', 'matched', 'pending', 'error'] as const) {
        it(`${color}/${state} matches its own baseline screenshot in ${scheme}`, async () => {
          await setColorScheme(scheme);

          await renderState(state, { color });

          await expect(page.getByRole('dialog')).toMatchScreenshot(`confirmation-dialog-${color}-${state}-${scheme}`);
        });
      }
    }
  }
});

describe('ConfirmationDialog passes color through', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const color of COLORS) {
      it(`color=${color} reaches the confirm button and the error alert, and nothing else in ${scheme}`, async () => {
        await setColorScheme(scheme);

        await renderState('error', { color });
        // Captured before the references exist, so the queries above cannot pick
        // a reference by mistake.
        const confirm = getComputedStyle(confirmButton());
        const alert = getComputedStyle(errorAlert());
        const neutralField = getComputedStyle(field());
        render(
          <>
            <Button data-testid="reference-button" variant="solid" color={color}>
              Referenz
            </Button>
            <Alert data-testid="reference-alert" variant="soft" color={color}>
              Referenz
            </Alert>
            <Input data-testid="reference-field" variant="outlined" color="neutral" />
          </>,
        );
        await settleTransitions();

        const referenceButton = getComputedStyle(screen.getByTestId('reference-button'));
        expect(confirm.backgroundColor).toBe(referenceButton.backgroundColor);
        expect(confirm.color).toBe(referenceButton.color);
        expect(confirm.borderColor).toBe(referenceButton.borderColor);
        expect(confirm.borderRadius).toBe(referenceButton.borderRadius);
        expect(confirm.minHeight).toBe(referenceButton.minHeight);
        expect(confirm.paddingInlineStart).toBe(referenceButton.paddingInlineStart);
        expect(confirm.fontSize).toBe(referenceButton.fontSize);
        expect(confirm.fontWeight).toBe(referenceButton.fontWeight);

        const referenceAlert = getComputedStyle(screen.getByTestId('reference-alert'));
        expect(alert.backgroundColor).toBe(referenceAlert.backgroundColor);
        expect(alert.color).toBe(referenceAlert.color);
        expect(alert.borderColor).toBe(referenceAlert.borderColor);
        expect(alert.borderRadius).toBe(referenceAlert.borderRadius);
        expect(alert.padding).toBe(referenceAlert.padding);

        // The field must NOT take the colour: tinting it red while someone is
        // halfway through typing punishes the typing itself.
        const referenceField = getComputedStyle(screen.getByTestId('reference-field'));
        expect(neutralField.borderColor).toBe(referenceField.borderColor);
        expect(neutralField.backgroundColor).toBe(referenceField.backgroundColor);
      });
    }
  }
});

describe('ConfirmationDialog passes size through', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const size of SIZES) {
      it(`size=${size} reaches the field and both buttons in ${scheme}`, async () => {
        await setColorScheme(scheme);

        await renderState('empty', { size });
        const dialogField = getComputedStyle(field());
        const confirm = getComputedStyle(confirmButton());
        const cancel = getComputedStyle(cancelButton());
        render(
          <>
            <Input data-testid="reference-field" size={size} />
            <Button data-testid="reference-solid" variant="solid" color="danger" size={size}>
              Referenz
            </Button>
            <Button data-testid="reference-plain" variant="plain" color="neutral" size={size}>
              Referenz
            </Button>
          </>,
        );
        await settleTransitions();

        const referenceField = getComputedStyle(screen.getByTestId('reference-field'));
        expect(dialogField.minHeight).toBe(referenceField.minHeight);
        expect(dialogField.fontSize).toBe(referenceField.fontSize);
        expect(dialogField.borderRadius).toBe(referenceField.borderRadius);

        const referenceSolid = getComputedStyle(screen.getByTestId('reference-solid'));
        expect(confirm.minHeight).toBe(referenceSolid.minHeight);
        expect(confirm.fontSize).toBe(referenceSolid.fontSize);

        const referencePlain = getComputedStyle(screen.getByTestId('reference-plain'));
        expect(cancel.minHeight).toBe(referencePlain.minHeight);
        expect(cancel.backgroundColor).toBe(referencePlain.backgroundColor);
        expect(cancel.color).toBe(referencePlain.color);
      });
    }
  }
});

describe('ConfirmationDialog surface', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`is a plain ModalDialog, untinted by color in ${scheme}`, async () => {
      await setColorScheme(scheme);

      await renderState('empty', { color: 'danger' });
      // Grabbed while it is still the only dialog: opening the reference Modal
      // marks this one aria-hidden, and a role query would no longer find it.
      const surface = dialog();
      render(
        <Modal open>
          <ModalDialog data-testid="reference-surface" />
        </Modal>,
      );
      await settleTransitions();

      const own = getComputedStyle(surface);
      const reference = getComputedStyle(screen.getByTestId('reference-surface'));

      expect(own.backgroundColor).toBe(reference.backgroundColor);
      expect(own.borderColor).toBe(reference.borderColor);
      expect(own.borderRadius).toBe(reference.borderRadius);
      expect(own.padding).toBe(reference.padding);
    });
  }
});

describe('ConfirmationDialog focus', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`puts the initial focus in the field in a real browser in ${scheme}`, async () => {
      await setColorScheme(scheme);

      // jsdom agreed with this too, but `autoFocus` inside a portal competes with
      // Base UI's own focus management, and only a real browser settles that.
      await renderState('empty');

      expect(document.activeElement).toBe(field());
    });
  }
});

/**
 * A committed screenshot only catches a regression once a human looks at it.
 * This is the assertion a PNG cannot make: that the dialog reads scheme tokens
 * at all. A hardcoded light surface passes every screenshot test on its own
 * baseline and fails here.
 *
 * ConfirmationDialog has no Joy counterpart, so there is nothing to compare
 * against — which is exactly why this assertion carries the weight.
 */
describe('ConfirmationDialog follows the colour scheme', () => {
  it('renders a different surface in dark than in light', async () => {
    await setColorScheme('light');
    await renderState('empty');

    const el = dialog();
    const read = () => {
      const style = getComputedStyle(el);
      return [style.backgroundColor, style.color, style.borderTopColor];
    };

    const light = read();
    await setColorScheme('dark');

    expect(read()).not.toEqual(light);
  });
});
