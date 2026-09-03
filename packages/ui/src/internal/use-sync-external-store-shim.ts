// @base-ui/react imports `useSyncExternalStore` from `use-sync-external-store/shim`
// in a few places (useIsHydrating, unstable-use-media-query,
// usePopupHandleStore) for React <18 compatibility. That package's shim is a
// CommonJS module that does `require('react')` internally — Vite 8's
// Rolldown-based library bundler doesn't rewrite that call to reference the
// `react` import already externalized at the top of our bundle, so invoking
// it throws "Calling `require` for \"react\" in an environment that doesn't
// expose the `require` function" the moment any component using one of those
// hooks mounts. Our peerDependencies require React 18.3+/19, both of which
// have `useSyncExternalStore` natively — this module is aliased in place of
// the shim (see vite.config.ts) so the broken CJS path is never bundled.
export { useSyncExternalStore } from 'react';
