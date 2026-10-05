'use client';
import * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export type TabLook = { variant: JoyVariant; color: JoyColor };

/**
 * Provided by `TabList` and `TabNav`. Their indicator is one element under
 * the strip, not part of a tab, so the selected Tab reports its variant and
 * colour here — and the indicator takes the tab's colour the way Joy's
 * `::after` takes `currentColor` from it.
 */
export const TabIndicatorContext = React.createContext<((look: TabLook) => void) | null>(null);

/** The strip's side: the look of the selected Tab, plain/neutral until one reports. */
export function useSelectedTabLook() {
  const [look, setLook] = React.useState<TabLook>({ variant: 'plain', color: 'neutral' });
  const report = React.useCallback(
    (next: TabLook) =>
      setLook((prev) => (prev.variant === next.variant && prev.color === next.color ? prev : next)),
    [],
  );
  return [look, report] as const;
}

/** The Tab's side: renders nothing, reports the look while `selected`. */
export function ReportTabLook({ selected, variant, color }: TabLook & { selected: boolean }) {
  const report = React.useContext(TabIndicatorContext);
  React.useLayoutEffect(() => {
    if (selected) report?.({ variant, color });
  }, [selected, report, variant, color]);
  return null;
}

// The selected tab's own text colour — what Joy's `::after` resolves
// `currentColor` to. Soft is the one variant whose selected (`softActive`)
// state changes the colour as well. Literal strings for Tailwind's scanner.
export const INDICATOR_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'text-primary-solid-color',
    neutral: 'text-neutral-solid-color',
    danger: 'text-danger-solid-color',
    success: 'text-success-solid-color',
    warning: 'text-warning-solid-color',
  },
  soft: {
    primary: 'text-primary-soft-active-color',
    neutral: 'text-neutral-soft-active-color',
    danger: 'text-danger-soft-active-color',
    success: 'text-success-soft-active-color',
    warning: 'text-warning-soft-active-color',
  },
  outlined: {
    primary: 'text-primary-outlined-color',
    neutral: 'text-neutral-outlined-color',
    danger: 'text-danger-outlined-color',
    success: 'text-success-outlined-color',
    warning: 'text-warning-outlined-color',
  },
  plain: {
    primary: 'text-primary-plain-color',
    neutral: 'text-neutral-plain-color',
    danger: 'text-danger-plain-color',
    success: 'text-success-plain-color',
    warning: 'text-warning-plain-color',
  },
};
