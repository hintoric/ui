import * as React from 'react';

/**
 * An aria-describedby pointing at an element that renders nothing is worse
 * for a screen reader than none at all, so helperId only exists when there is
 * actually helper text to describe.
 */
export function useFieldIds(
  idProp: string | undefined,
  hasHelper: boolean,
): { id: string; helperId?: string } {
  const generated = React.useId();
  const id = idProp ?? generated;
  return { id, helperId: hasHelper ? `${id}-helper-text` : undefined };
}
