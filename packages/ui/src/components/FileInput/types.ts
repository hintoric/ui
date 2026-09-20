import type * as React from 'react';

export interface FileInputProps {
  /** As on `<input type="file">`, e.g. `.docx,application/pdf`. */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** What was chosen or dropped. Never called with an empty list. */
  onFiles: (files: File[]) => void;
  /** The zone's caption, and the field's accessible name. */
  children?: React.ReactNode;
  className?: string;
}
