import * as React from 'react';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { DISABLED_TEXT_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ButtonBodyProps {
  variant: JoyVariant;
  color: JoyColor;
  loading: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * The classes a button needs on its root while it is loading.
 *
 * `text-transparent!` rather than plain `text-transparent`: a loading button
 * disables itself, and `disabled:text-*` from the variant map outranks a bare
 * `text-transparent` on specificity, so the label would show through behind
 * the spinner. Joy solves the same clash by ordering (`color: 'transparent'`
 * placed after its variant styles — see its own Button.js comment); with
 * classes from a shared map, order is not ours to choose, so importance is.
 */
export function buttonLoadingClasses(loading: boolean): string | false {
  return loading && 'relative text-transparent!';
}

/**
 * What goes inside a button: the spinner while loading, then the decorators
 * around the label. `Button` and `MenuButton` share it, because Joy's
 * MenuButton reuses Button's whole formula — the styles *and* the slots — and
 * two copies of this drifted the moment the first one changed.
 */
export function ButtonBody({ variant, color, loading, startDecorator, endDecorator, children }: ButtonBodyProps) {
  const reducedMotion = useReducedMotion();

  return (
    <>
      {loading && (
        <span
          aria-hidden="true"
          className={cx('absolute inset-0 flex items-center justify-center', DISABLED_TEXT_CLASSES[variant][color])}
        >
          <span
            className={cx(
              'size-4 rounded-full border-2 border-current border-t-transparent',
              !reducedMotion && 'animate-spin',
            )}
          />
        </span>
      )}
      {startDecorator && <span className="inline-flex items-center">{startDecorator}</span>}
      {children}
      {endDecorator && <span className="inline-flex items-center">{endDecorator}</span>}
    </>
  );
}
