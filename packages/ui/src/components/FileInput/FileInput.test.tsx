import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('hands the chosen files to onFiles', async () => {
    const onFiles = vi.fn();
    render(<FileInput onFiles={onFiles}>Dokument wählen</FileInput>);

    const file = new File(['x'], 'vertrag.docx');
    await userEvent.upload(screen.getByLabelText('Dokument wählen'), file);

    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('accepts a drop', () => {
    const onFiles = vi.fn();
    render(<FileInput onFiles={onFiles}>Dokument wählen</FileInput>);
    const file = new File(['x'], 'vertrag.docx');

    const zone = screen.getByTestId('file-input-zone');
    const event = new Event('drop', { bubbles: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files: [file] } });
    zone.dispatchEvent(event);

    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('clears the field so the same file can be picked twice', async () => {
    // Without this a second attempt after a failed upload fires no change
    // event at all, and the page looks broken for no visible reason.
    const onFiles = vi.fn();
    render(<FileInput onFiles={onFiles}>Dokument wählen</FileInput>);
    const field = screen.getByLabelText('Dokument wählen') as HTMLInputElement;

    await userEvent.upload(field, new File(['x'], 'vertrag.docx'));

    expect(field.value).toBe('');
  });

  it('does nothing while disabled', async () => {
    const onFiles = vi.fn();
    render(
      <FileInput onFiles={onFiles} disabled>
        Dokument wählen
      </FileInput>,
    );

    await userEvent.upload(screen.getByLabelText('Dokument wählen'), new File(['x'], 'a.docx'));

    expect(onFiles).not.toHaveBeenCalled();
  });
});
