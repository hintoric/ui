import type * as React from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

export type FieldAdapter = (
  field: ControllerRenderProps<FieldValues, string>,
) => Record<string, unknown>;

// The nine field components report changes in exactly three shapes, so the
// binding needs exactly three adapters rather than nine hand-wirings.

/** Input, Textarea — a native change event carrying the new string. */
export const textAdapter: FieldAdapter = (field) => ({
  name: field.name,
  // An undefined value turns a controlled <input> uncontrolled and React
  // warns on the first keystroke, so the empty string is load-bearing.
  value: field.value ?? '',
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    field.onChange(event.target.value),
  onBlur: field.onBlur,
  ref: field.ref,
});

/** Checkbox, Switch, Radio — onCheckedChange(boolean). */
export const checkedAdapter: FieldAdapter = (field) => ({
  name: field.name,
  checked: Boolean(field.value),
  onCheckedChange: (next: boolean) => field.onChange(next),
  onBlur: field.onBlur,
  ref: field.ref,
});

/** Select, Autocomplete, RadioGroup, Slider — onChange(value). */
export const valueAdapter: FieldAdapter = (field) => ({
  name: field.name,
  // Passed through untouched: these fields carry strings, numbers, arrays and
  // null, and coercing here would corrupt Slider's numbers into ''.
  value: field.value,
  onChange: (next: unknown) => field.onChange(next),
  onBlur: field.onBlur,
  ref: field.ref,
});
