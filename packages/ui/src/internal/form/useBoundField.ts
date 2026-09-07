import { useController, useFormContext } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import type { FieldAdapter } from './adapters';

export interface OwnHandlers {
  onChange?: unknown;
  onBlur?: unknown;
  onCheckedChange?: unknown;
}

const CHAINED = ['onChange', 'onBlur', 'onCheckedChange'] as const;

/**
 * Only ever called from a component that has already established there IS a
 * form context and a name — the caller does the branching, so this hook can
 * call useController unconditionally.
 */
export function useBoundField(
  name: string,
  adapter: FieldAdapter,
  own: OwnHandlers,
): { fieldProps: Record<string, unknown>; errorMessage?: string } {
  const { control } = useFormContext<FieldValues>();
  const { field, fieldState } = useController({ name, control });
  const bound = adapter(field);

  // The consumer's handler runs after RHF's rather than replacing it: a side
  // effect attached to a field (resetting a dependent field, a telemetry
  // event) must not disappear the moment the field is dropped into a <Form>.
  const fieldProps: Record<string, unknown> = { ...bound };
  for (const key of CHAINED) {
    const ownHandler = own[key];
    const boundHandler = bound[key];
    if (typeof ownHandler !== 'function') continue;
    fieldProps[key] =
      typeof boundHandler === 'function'
        ? (...args: unknown[]) => {
            (boundHandler as (...a: unknown[]) => void)(...args);
            (ownHandler as (...a: unknown[]) => void)(...args);
          }
        : ownHandler;
  }

  return { fieldProps, errorMessage: fieldState.error?.message };
}
