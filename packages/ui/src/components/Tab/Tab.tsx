'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { asRenderProp } from '../../utils/asRenderProp';
import { cx } from '../../utils/cx';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import { TabsSizeContext } from '../Tabs/TabsContext';
import { TabNavContext } from '../TabNav/TabNavContext';
import { ReportTabLook } from './TabIndicatorContext';
import type { TabProps } from './types';

// Joy's Tab sets no line-height of its own and inherits `lineHeight-md` (1.5)
// from the Tabs root, so `leading-normal` overrides the per-size line-height
// Tailwind's `text-sm`/`text-lg` would bring (20px/28px where Joy is 21/27).
const SIZE_CLASS = {
  sm: 'min-h-8 text-sm leading-normal',
  md: 'min-h-9 text-base leading-normal',
  lg: 'min-h-11 text-lg leading-normal',
} as const;

// Joy's Tab is a ListItemButton: `paddingBlock` is the List's `--ListItem-
// paddingY` (3px/0.25rem/0.375rem) less the variant's border width, and the
// bottom also makes room for the 2px indicator (`+ thickness - 1px`) — on
// every tab, selected or not. `paddingInline` is `--Tabs-spacing`
// (0.75/1/1.25rem), with no border subtracted. Measured 2026-10-05 against
// @mui/joy (TabNav.visual.test.tsx); the previous px-2/3/4 with no vertical
// padding was never compared.
//
// In a vertical TabList Joy's indicator sits on the right (`indicatorPlacement`
// defaults to `row ? 'bottom' : 'right'`), so the extra pixel moves from the
// bottom to the right: `paddingRight: calc(--ListItem-paddingRight +
// thickness - 1px)`. Measured in TabList.visual.test.tsx.
const PADDING_CLASS = {
  sm: 'px-3 pt-[3px] pb-[4px] data-[orientation=vertical]:pb-[3px] data-[orientation=vertical]:pr-[calc(0.75rem+1px)]',
  md: 'px-4 pt-[4px] pb-[5px] data-[orientation=vertical]:pb-[4px] data-[orientation=vertical]:pr-[calc(1rem+1px)]',
  lg: 'px-5 pt-[6px] pb-[7px] data-[orientation=vertical]:pb-[6px] data-[orientation=vertical]:pr-[calc(1.25rem+1px)]',
} as const;
const OUTLINED_PADDING_CLASS = {
  sm: 'px-3 pt-[2px] pb-[3px] data-[orientation=vertical]:pb-[2px] data-[orientation=vertical]:pr-[calc(0.75rem+1px)]',
  md: 'px-4 pt-[3px] pb-[4px] data-[orientation=vertical]:pb-[3px] data-[orientation=vertical]:pr-[calc(1rem+1px)]',
  lg: 'px-5 pt-[5px] pb-[6px] data-[orientation=vertical]:pb-[5px] data-[orientation=vertical]:pr-[calc(1.25rem+1px)]',
} as const;

// Extends ListItemButton's own styling (STATIC/INTERACTIVE base, no separate
// surface fallback) — confirmed against @mui/joy's Tab.js source
// (`styled(StyledListItemButton, ...)`). Unlike ListItemButton/Option,
// A selected Tab keeps its variant's ACTIVE background, persistently.
//
// Tab.tsx used to state the opposite — "aria-selected gets NO persistent
// background change here" — on the strength of reading @mui/joy's Tab.js.
// That was wrong: Joy's Tab is `styled(StyledListItemButton)`, and the
// selected background comes from that base rather than from Tab.js. Measured
// 2026-09-07 against the real package: a selected solid/primary Tab renders
// #12467B (primary-700, i.e. `solid-active-bg`) where ours rendered #0B6BCB.
//
// Written out literally rather than composed from `variant`/`color` because
// Tailwind only generates classes it can find as literal strings in source.
// `aria-[current=page]:` alongside `aria-selected:`: the same Tab is a link
// marked `aria-current="page"` inside a TabNav, and selected the same way.
const SELECTED_BG_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'aria-selected:bg-primary-solid-active-bg aria-[current=page]:bg-primary-solid-active-bg',
    neutral: 'aria-selected:bg-neutral-solid-active-bg aria-[current=page]:bg-neutral-solid-active-bg',
    danger: 'aria-selected:bg-danger-solid-active-bg aria-[current=page]:bg-danger-solid-active-bg',
    success: 'aria-selected:bg-success-solid-active-bg aria-[current=page]:bg-success-solid-active-bg',
    warning: 'aria-selected:bg-warning-solid-active-bg aria-[current=page]:bg-warning-solid-active-bg',
  },
  soft: {
    primary: 'aria-selected:bg-primary-soft-active-bg aria-[current=page]:bg-primary-soft-active-bg aria-selected:text-primary-soft-active-color aria-[current=page]:text-primary-soft-active-color',
    neutral: 'aria-selected:bg-neutral-soft-active-bg aria-[current=page]:bg-neutral-soft-active-bg aria-selected:text-neutral-soft-active-color aria-[current=page]:text-neutral-soft-active-color',
    danger: 'aria-selected:bg-danger-soft-active-bg aria-[current=page]:bg-danger-soft-active-bg aria-selected:text-danger-soft-active-color aria-[current=page]:text-danger-soft-active-color',
    success: 'aria-selected:bg-success-soft-active-bg aria-[current=page]:bg-success-soft-active-bg aria-selected:text-success-soft-active-color aria-[current=page]:text-success-soft-active-color',
    warning: 'aria-selected:bg-warning-soft-active-bg aria-[current=page]:bg-warning-soft-active-bg aria-selected:text-warning-soft-active-color aria-[current=page]:text-warning-soft-active-color',
  },
  outlined: {
    primary: 'aria-selected:bg-primary-outlined-active-bg aria-[current=page]:bg-primary-outlined-active-bg',
    neutral: 'aria-selected:bg-neutral-outlined-active-bg aria-[current=page]:bg-neutral-outlined-active-bg',
    danger: 'aria-selected:bg-danger-outlined-active-bg aria-[current=page]:bg-danger-outlined-active-bg',
    success: 'aria-selected:bg-success-outlined-active-bg aria-[current=page]:bg-success-outlined-active-bg',
    warning: 'aria-selected:bg-warning-outlined-active-bg aria-[current=page]:bg-warning-outlined-active-bg',
  },
  plain: {
    primary: 'aria-selected:bg-primary-plain-active-bg aria-[current=page]:bg-primary-plain-active-bg',
    neutral:
    // Joy suppresses hover on a selected tab; plain/neutral is the one
    // variant whose hover also changes the ink, so it needs pinning back.
    'aria-selected:bg-neutral-plain-active-bg aria-[current=page]:bg-neutral-plain-active-bg aria-selected:hover:text-neutral-plain-color aria-[current=page]:hover:text-neutral-plain-color',
    danger: 'aria-selected:bg-danger-plain-active-bg aria-[current=page]:bg-danger-plain-active-bg',
    success: 'aria-selected:bg-success-plain-active-bg aria-[current=page]:bg-success-plain-active-bg',
    warning: 'aria-selected:bg-warning-plain-active-bg aria-[current=page]:bg-warning-plain-active-bg',
  },
};

// Joy applies `${variant}Disabled` through a class, so it reaches a Tab
// rendered as a link too; INTERACTIVE_COLOR_CLASSES' `disabled:` cannot match
// an `<a>`. Hence `data-[disabled]:`, which both Base UI's tab and the link
// branch below set.
const DISABLED_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'data-[disabled]:text-primary-solid-disabled-color data-[disabled]:bg-primary-solid-disabled-bg',
    neutral: 'data-[disabled]:text-neutral-solid-disabled-color data-[disabled]:bg-neutral-solid-disabled-bg',
    danger: 'data-[disabled]:text-danger-solid-disabled-color data-[disabled]:bg-danger-solid-disabled-bg',
    success: 'data-[disabled]:text-success-solid-disabled-color data-[disabled]:bg-success-solid-disabled-bg',
    warning: 'data-[disabled]:text-warning-solid-disabled-color data-[disabled]:bg-warning-solid-disabled-bg',
  },
  soft: {
    primary: 'data-[disabled]:text-primary-soft-disabled-color data-[disabled]:bg-primary-soft-disabled-bg',
    neutral: 'data-[disabled]:text-neutral-soft-disabled-color data-[disabled]:bg-neutral-soft-disabled-bg',
    danger: 'data-[disabled]:text-danger-soft-disabled-color data-[disabled]:bg-danger-soft-disabled-bg',
    success: 'data-[disabled]:text-success-soft-disabled-color data-[disabled]:bg-success-soft-disabled-bg',
    warning: 'data-[disabled]:text-warning-soft-disabled-color data-[disabled]:bg-warning-soft-disabled-bg',
  },
  outlined: {
    primary: 'data-[disabled]:text-primary-outlined-disabled-color data-[disabled]:border-primary-outlined-disabled-border',
    neutral: 'data-[disabled]:text-neutral-outlined-disabled-color data-[disabled]:border-neutral-outlined-disabled-border',
    danger: 'data-[disabled]:text-danger-outlined-disabled-color data-[disabled]:border-danger-outlined-disabled-border',
    success: 'data-[disabled]:text-success-outlined-disabled-color data-[disabled]:border-success-outlined-disabled-border',
    warning: 'data-[disabled]:text-warning-outlined-disabled-color data-[disabled]:border-warning-outlined-disabled-border',
  },
  plain: {
    primary: 'data-[disabled]:text-primary-plain-disabled-color',
    neutral: 'data-[disabled]:text-neutral-plain-disabled-color',
    danger: 'data-[disabled]:text-danger-plain-disabled-color',
    success: 'data-[disabled]:text-success-plain-disabled-color',
    warning: 'data-[disabled]:text-warning-plain-disabled-color',
  },
};

export const Tab = React.forwardRef<HTMLElement, TabProps>(function Tab(
  { variant = 'plain', color = 'neutral', value, disabled, component, className, children, ...props },
  ref,
) {
  const size = React.useContext(TabsSizeContext);
  const nav = React.useContext(TabNavContext);
  const current = nav !== null && nav.value === value;
  const classes = cx(
    // `border-transparent` and `gap-1.5`: Joy's ListItemButton keeps a 1px
    // transparent border on every variant (so outlined does not jump), and
    // TabList sets `--ListItem-gap: 0.375rem`. Focus is Joy's
    // `theme.focus.default`; disabled is `pointer-events: none` like Joy's
    // `${variant}Disabled`, not a dimmed opacity. Joy centres a tab's content
    // only in a row (`justifyContent: row ? 'center' : 'initial'`).
    'relative flex cursor-pointer items-center justify-center data-[orientation=vertical]:justify-normal gap-1.5 rounded-[inherit] border border-transparent font-body no-underline transition-colors focus-visible:z-[1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 data-[disabled]:pointer-events-none data-[disabled]:cursor-default',
    SIZE_CLASS[size],
    variant === 'outlined' ? OUTLINED_PADDING_CLASS[size] : PADDING_CLASS[size],
    INTERACTIVE_COLOR_CLASSES[variant][color],
    SELECTED_BG_CLASSES[variant][color],
    DISABLED_CLASSES[variant][color],
    className,
  );

  // Inside a TabNav a Tab is a link, not a tab: no role, no roving tabindex,
  // `aria-current="page"` for the selected one. See TabNav.tsx.
  const link = useRender({
    defaultTagName: 'a',
    render: asRenderProp(component),
    ref,
    enabled: nav !== null,
    props: mergeProps<'a'>(
      {
        className: classes,
        'aria-current': current ? 'page' : undefined,
        // A link cannot be `disabled`; it says so, and refuses the click.
        ...(disabled && {
          'aria-disabled': true,
          'data-disabled': '',
          onClick: (event: React.MouseEvent) => event.preventDefault(),
        }),
        children,
      },
      props as React.ComponentPropsWithoutRef<'a'>,
    ),
  });
  if (nav !== null) {
    return (
      <>
        {link}
        <ReportTabLook selected={current} variant={variant} color={color} />
      </>
    );
  }

  // The render function is where Base UI hands out `active` (selected), so
  // the report rides along next to the button.
  return (
    <BaseTabs.Tab
      ref={ref as React.Ref<HTMLButtonElement>}
      value={value}
      disabled={disabled}
      className={classes}
      render={(buttonProps, state) => (
        <>
          <button {...buttonProps} />
          <ReportTabLook selected={state.active} variant={variant} color={color} />
        </>
      )}
      {...(props as React.ComponentPropsWithoutRef<'button'>)}
    >
      {children}
    </BaseTabs.Tab>
  );
});
