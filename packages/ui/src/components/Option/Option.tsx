'use client';
import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { cx } from '../../utils/cx';
import { ACTIVE_BG_CLASS, HOVER_BG_CLASS, STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { OptionProps } from './types';

// Extends Joy UI's ListItemButton styling: base = theme.variants[variant][color]
// (no surface fallback, unlike Sheet/Card), `.highlighted` (keyboard/pointer
// navigation) gets the variant's Hover background UNLESS also selected,
// `.selected` (persistent, driven by aria-selected in real Joy / Base UI's
// `selected` item state here) gets the variant's Active background. Unlike
// ListItemButton, Option's OWN styled wrapper adds no font-weight bump on
// selection (that rule lives on ListItemButton's separate wrapper, which
// Option doesn't share). Confirmed against @mui/joy's Option.js source.
function OptionComponent<Value = string>(
  { variant = 'plain', color = 'neutral', value, disabled, className, children, ...props }: OptionProps<Value>,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <BaseSelect.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={(state) =>
        cx(
          'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[inherit] border border-transparent px-3 py-1 text-left transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
          STATIC_COLOR_CLASSES[variant][color],
          state.highlighted && !state.selected && HOVER_BG_CLASS[variant][color],
          state.selected && ACTIVE_BG_CLASS[variant][color],
          className,
        )
      }
      {...props}
    >
      <BaseSelect.ItemText className="min-w-0 flex-1 overflow-hidden text-ellipsis">{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

type OptionComponentType = (<Value = string>(props: OptionProps<Value> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement) & {
  displayName?: string;
};

export const Option = React.forwardRef(OptionComponent) as unknown as OptionComponentType;
Option.displayName = 'Option';
