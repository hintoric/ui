import * as React from 'react';

/**
 * Assigning at module scope rather than inside the hook: writing `.current`
 * on a ref that arrived as a hook argument reads to react-hook's immutability
 * rule as mutating an argument, even though attaching a node is exactly what
 * a ref is for. Passing it to a plain function makes it an ordinary
 * parameter again.
 */
function assign<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    (ref as React.RefObject<T | null>).current = node;
  }
}

/**
 * react-hook-form needs the real DOM node for setFocus and focus-on-error,
 * and the consumer may want the same node — so both refs get it.
 *
 * Exactly two refs, memoized on their identities: a fresh callback each
 * render would make React detach and re-attach the node every time, which
 * re-runs react-hook-form's own registration for no reason.
 */
export function useForkRef<T>(
  consumerRef: React.Ref<T> | undefined,
  fieldRef: React.Ref<T> | undefined,
): React.RefCallback<T> {
  return React.useMemo(
    () => (node: T | null) => {
      assign(consumerRef, node);
      assign(fieldRef, node);
    },
    [consumerRef, fieldRef],
  );
}
