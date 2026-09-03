'use client';
import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { cx } from '../../utils/cx';
import { ACTIVE_BG_CLASS, HOVER_BG_CLASS, STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { AutocompleteOptionProps } from './types';

// Nearly identical to Select's Option, except Joy UI's AutocompleteOption
// (`[aria-selected="true"]`) DOES bump to `fontWeight.md` on selection —
// unlike Select's Option, which shares no such rule with ListItemButton.
// Confirmed against @mui/joy's AutocompleteOption.js source.
function AutocompleteOptionComponent<Value = string>(
  { variant = 'plain', color = 'neutral', value, disabled, className, children, ...props }: AutocompleteOptionProps<Value>,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <Combobox.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={(state) =>
        cx(
          'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[inherit] border border-transparent px-3 py-1 text-left transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
          STATIC_COLOR_CLASSES[variant][color],
          state.highlighted && !state.selected && HOVER_BG_CLASS[variant][color],
          state.selected && cx(ACTIVE_BG_CLASS[variant][color], 'font-medium'),
          className,
        )
      }
      {...props}
    >
      {children}
    </Combobox.Item>
  );
}

type AutocompleteOptionComponentType = (<Value = string>(
  props: AutocompleteOptionProps<Value> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement) & { displayName?: string };

export const AutocompleteOption = React.forwardRef(AutocompleteOptionComponent) as unknown as AutocompleteOptionComponentType;
AutocompleteOption.displayName = 'AutocompleteOption';
