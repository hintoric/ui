'use client';
import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { cx } from '../../utils/cx';
import { autocompleteVariants } from './autocompleteVariants';
import { ArrowDropDownIcon } from '../../internal/svg-icons/ArrowDropDownIcon';
import { CancelIcon } from '../../internal/svg-icons/CancelIcon';
import { AutocompleteOption } from '../AutocompleteOption';
import type { AutocompleteProps } from './types';

// Joy UI's AutocompleteListbox: boxShadow.md, radius.sm, background.popup
// surface fallback — identical formula to Select's listbox. Confirmed
// against @mui/joy's AutocompleteListbox.js source.
const LISTBOX_CLASS =
  'z-50 max-h-[40vh] min-w-[max-content] overflow-auto rounded-sm bg-surface-popup p-1 font-body shadow-[var(--shadow-md)] outline-none';

function AutocompleteComponent<Value = string>(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    options,
    getOptionLabel = (value: Value) => String(value),
    placeholder,
    startDecorator,
    disabled,
    value,
    defaultValue,
    onChange,
    inputValue,
    onInputChange,
    disableClearable = false,
    className,
    ...props
  }: AutocompleteProps<Value>,
  ref: React.Ref<HTMLInputElement>,
) {
  return (
    <Combobox.Root
      items={options}
      itemToStringLabel={getOptionLabel}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange as (value: Value | null) => void}
      inputValue={inputValue}
      onInputValueChange={onInputChange}
      disabled={disabled}
    >
      <Combobox.InputGroup className={cx(autocompleteVariants({ variant, color, size }), className)}>
        {startDecorator && <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>}
        <Combobox.Input
          ref={ref}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-none bg-transparent p-0 outline-none placeholder:opacity-[0.64]"
          {...props}
        />
        {!disableClearable && (
          <Combobox.Clear className="inline-flex items-center text-ink-icon opacity-60 hover:opacity-100">
            <CancelIcon />
          </Combobox.Clear>
        )}
        <Combobox.Trigger className="inline-flex items-center text-xl text-ink-icon">
          <ArrowDropDownIcon />
        </Combobox.Trigger>
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner side="bottom" align="start" sideOffset={4} className="z-50 outline-none">
          <Combobox.Popup className={LISTBOX_CLASS}>
            <Combobox.Empty className="px-3 py-2 text-sm text-ink-tertiary">No options</Combobox.Empty>
            <Combobox.List>
              {(item: Value) => (
                <AutocompleteOption key={getOptionLabel(item)} value={item}>
                  {getOptionLabel(item)}
                </AutocompleteOption>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

type AutocompleteComponentType = (<Value = string>(
  props: AutocompleteProps<Value> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement) & { displayName?: string };

export const Autocomplete = React.forwardRef(AutocompleteComponent) as unknown as AutocompleteComponentType;
Autocomplete.displayName = 'Autocomplete';
