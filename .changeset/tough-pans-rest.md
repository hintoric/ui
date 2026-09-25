---
"@hintoric/ui": minor
---

Add `ReducedMotionProvider` and `useReducedMotion` so applications can pass their own reduced-motion preference into `@hintoric/ui`. Components still fall back to `prefers-reduced-motion` when no provider is present.

Animated/loading components and larger UI transitions now respect that preference, including progress indicators, skeletons, loading spinners, map loading, accordions, tabs, modal/dialog and drawer transitions.
