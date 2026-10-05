'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { TabsSizeContext } from '../Tabs/TabsContext';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import { TabNavContext } from './TabNavContext';
import type { TabLook } from './TabNavContext';
import type { TabNavProps } from './types';

// The current tab's own text colour — what Joy's `::after` resolves
// `currentColor` to. Soft is the one variant whose selected (`softActive`)
// state changes the colour as well. Literal strings for Tailwind's scanner.
const INDICATOR_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
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

type IndicatorBox = { left: number; width: number };

/**
 * Where the indicator sits, in the nav's own coordinates.
 *
 * Measured, not derived: a tab is as wide as its label, and a label is as
 * wide as its language and its font make it. So this measures again whenever
 * any tab or the nav itself resizes — that covers a late web font, a language
 * switch and a narrower viewport alike — and whenever the nav re-renders.
 */
function useIndicator(nav: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = React.useState<IndicatorBox | null>(null);

  React.useLayoutEffect(() => {
    const element = nav.current;
    if (!element) return;
    const measure = () => {
      const current = element.querySelector<HTMLElement>('[aria-current="page"]');
      // Rects, not offsetLeft/offsetWidth: those round to whole pixels, and a
      // label is rarely a whole number of pixels wide.
      const navBox = element.getBoundingClientRect();
      const box = current?.getBoundingClientRect();
      const next = box ? { left: box.left - navBox.left + element.scrollLeft, width: box.width } : null;
      setBox((prev) =>
        prev === next || (prev && next && prev.left === next.left && prev.width === next.width) ? prev : next,
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) {
      if (!child.hasAttribute('data-tab-nav-indicator')) observer.observe(child);
    }
    return () => observer.disconnect();
  });

  return box;
}

/**
 * `Tabs` for navigation: a `<nav>` of links that look like `TabList` + `Tab`,
 * with the same sliding indicator under the link for the current page.
 *
 * Joy's answer to "tabs as navigation" is `<Tab component={Link}>` inside
 * `Tabs`. That gives links `role="tab"` inside a `role="tablist"`: a screen
 * reader announces tab panels that do not exist, and the roving tabindex
 * takes every link but the selected one out of the Tab order. WAI-ARIA's
 * guidance for site navigation is a `nav` landmark of plain links with
 * `aria-current="page"` on the current one — which is what this renders.
 *
 * So the children are the same `Tab`s, with `href` (and `component` for a
 * router link) instead of a panel: a `Tab` inside a `TabNav` renders as a
 * link, not as Base UI's tab button. Its look — variant, colour, size, the
 * selected background — is `Tab`'s, compared against Joy's own `Tab` in
 * TabNav.visual.test.tsx.
 *
 * Horizontal only: a vertical list of navigation links is a `List`.
 */
export const TabNav = React.forwardRef<HTMLElement, TabNavProps>(function TabNav(
  { variant = 'plain', color = 'neutral', size = 'md', value, className, children, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const nav = React.useRef<HTMLElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      nav.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const indicator = useIndicator(nav);
  const [look, setLook] = React.useState<TabLook>({ variant: 'plain', color: 'neutral' });
  const setCurrentLook = React.useCallback(
    (next: TabLook) =>
      setLook((prev) => (prev.variant === next.variant && prev.color === next.color ? prev : next)),
    [],
  );
  const context = React.useMemo(() => ({ value, setCurrentLook }), [value, setCurrentLook]);

  return (
    <nav
      ref={setRef}
      // `pb-px` and the inset line are Joy TabList's default underline (its
      // `disableUnderline` is false): the divider the indicator sits on.
      className={cx(
        'relative flex pb-px font-body shadow-[inset_0_-1px_var(--color-divider)]',
        STATIC_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      <TabNavContext.Provider value={context}>
        <TabsSizeContext.Provider value={size}>{children}</TabsSizeContext.Provider>
      </TabNavContext.Provider>
      {indicator && (
        <span
          aria-hidden="true"
          data-tab-nav-indicator=""
          style={
            {
              '--active-tab-left': `${indicator.left}px`,
              '--active-tab-width': `${indicator.width}px`,
            } as React.CSSProperties
          }
          className={cx(
            'pointer-events-none absolute bottom-0 z-[1] left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] bg-current',
            INDICATOR_COLOR_CLASSES[look.variant][look.color],
            !reducedMotion && 'transition-all duration-200',
          )}
        />
      )}
    </nav>
  );
});
