'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { FormControlContext } from '../FormControl/FormControlContext';
import { Typography } from '../Typography/Typography';
import type { FileInputProps } from './types';

/**
 * A drop zone that also opens the file picker.
 *
 * There is no Joy counterpart. The reason for the component is that the native
 * control renders as the browser's own grey widget, which looks foreign beside
 * anything designed. The field stays underneath: that is what keeps the
 * keyboard, screen readers and `userEvent.upload` working.
 */
export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { accept, multiple = false, disabled, onFiles, children, className },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const isDisabled = disabled ?? formControl?.disabled ?? false;
  const id = React.useId();
  const [over, setOver] = React.useState(false);

  function deliver(files: FileList | File[] | null | undefined) {
    const chosen = Array.from(files ?? []);
    if (chosen.length > 0) onFiles(chosen);
  }

  return (
    <div
      data-testid="file-input-zone"
      onDragOver={(event) => {
        event.preventDefault();
        if (!isDisabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (!isDisabled) deliver(event.dataTransfer?.files);
      }}
      className={cx(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center',
        over ? 'border-primary-outlined-border bg-primary-soft-bg' : 'border-neutral-outlined-border bg-surface',
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {/* A native label: Typography extends the props of <p>, which has no htmlFor. */}
      <label htmlFor={id} className={isDisabled ? undefined : 'cursor-pointer'}>
        <Typography level="body-sm" component="span">
          {children}
        </Typography>
      </label>
      {/*
        Visible to assistive technology, invisible to the eye: `display: none`
        would take the field's accessible name with it, and getByLabelText.
      */}
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={isDisabled}
        className="sr-only"
        onChange={(event) => {
          deliver(event.target.files);
          // Cleared so the same file can be picked again after a failed
          // upload -- otherwise no change event fires at all.
          event.target.value = '';
        }}
      />
    </div>
  );
});
