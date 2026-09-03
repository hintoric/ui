import * as React from 'react';

// @tanstack/react-store's useSelector imports useSyncExternalStoreWithSelector
// from `use-sync-external-store/shim/with-selector`, whose CommonJS
// implementation does `require('react')` internally — Vite 8's Rolldown
// bundler doesn't rewrite that to the externalized `react` import (same
// issue as use-sync-external-store-shim.ts, see that file for the full
// explanation). Unlike plain `useSyncExternalStore`, this hook has no native
// React equivalent, so it's reimplemented here instead of just re-exported —
// this is a faithful, require-free port of the reference implementation in
// use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js
// (MIT licensed, Meta Platforms, Inc.), built on React's native
// useSyncExternalStore.
export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: (() => Snapshot) | undefined,
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  const instRef = React.useRef<{ hasValue: boolean; value: Selection | null } | null>(null);
  let inst = instRef.current;
  if (inst === null) {
    inst = { hasValue: false, value: null };
    instRef.current = inst;
  }

  const [getSelection, getServerSelection] = React.useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot: Snapshot;
    let memoizedSelection: Selection;

    const memoizedSelector = (nextSnapshot: Snapshot): Selection => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);
        if (isEqual !== undefined && inst!.hasValue) {
          const currentSelection = inst!.value as Selection;
          if (isEqual(currentSelection, nextSelection)) {
            memoizedSelection = currentSelection;
            return memoizedSelection;
          }
        }
        memoizedSelection = nextSelection;
        return memoizedSelection;
      }

      const currentSelection = memoizedSelection;
      if (Object.is(memoizedSnapshot, nextSnapshot)) {
        return currentSelection;
      }

      const nextSelection = selector(nextSnapshot);
      if (isEqual !== undefined && isEqual(currentSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot;
        return currentSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return memoizedSelection;
    };

    const maybeGetServerSnapshot = getServerSnapshot === undefined ? null : getServerSnapshot;
    return [
      () => memoizedSelector(getSnapshot()),
      maybeGetServerSnapshot === null ? undefined : () => memoizedSelector(maybeGetServerSnapshot()),
    ] as const;
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);

  const value = React.useSyncExternalStore(subscribe, getSelection, getServerSelection);

  React.useEffect(() => {
    inst!.hasValue = true;
    inst!.value = value;
  }, [value]);

  React.useDebugValue(value);
  return value;
}
