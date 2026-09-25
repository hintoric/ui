import { useReducedMotion } from '../theme/ReducedMotionProvider';

/** Package-internal compatibility name. Prefer useReducedMotion for public reads. */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion();
}
