'use client';
import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { cx } from '../../utils/cx';
import { autocompleteVariants } from './autocompleteVariants';
import { ArrowDropDownIcon } from '../../internal/svg-icons/ArrowDropDownIcon';
import { CancelIcon } from '../../internal/svg-icons/CancelIcon';
import { AutocompleteOption } from '../AutocompleteOption';
import { useFormContext } from 'react-hook-form';
import { FormControlContext } from '../FormControl/FormControlContext';
import {
  FieldShell,
  omitProps,
  useBoundField,
  useFieldIds,
  useForkRef,
  valueAdapter,
  VALUE_PROPS,
} from '../../internal/form';
import type { AutocompleteProps } from './types';

// Joy UI's AutocompleteListbox: boxShadow.md, radius.sm, background.popup
// surface fallback — identical formula to Select's listbox. Confirmed
// against @mui/joy's AutocompleteListbox.js source.
const LISTBOX_CLASS =
  'z-50 max-h-[40vh] min-w-[max-content] overflow-auto rounded-sm bg-surface-popup p-1 font-body shadow-[var(--shadow-md)] outline-none';

function AutocompleteBaseComponent<Value = string>(
  {
    variant = 'outlined',
    color,
    size = 'md',
    error,
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
    loading = false,
    loadingText = 'Loading…',
    noOptionsText = 'No options',
    filter,
    className,
    ...props
  }: AutocompleteProps<Value>,
  ref: React.Ref<HTMLInputElement>,
) {
  const formControl = React.useContext(FormControlContext);
  // Same rule as Select: an explicit colour beats the error state.
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');

  return (
    <Combobox.Root
      items={options}
      itemToStringLabel={getOptionLabel}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange as (value: Value | null) => void}
      inputValue={inputValue}
      onInputValueChange={(nextValue, eventDetails) => {
        // Base UI's own reasons for this callback are far more granular than
        // Joy's ('item-press' and several others all mean "the text changed
        // because a value was selected/synced, not typed"; a real keystroke
        // is 'input-change' — confirmed by logging the live value, since
        // TypeScript's declared union for this exact callback (as reported by
        // tsc) omits 'input-change' even though it's what Base UI actually
        // sends; the `as string` below works around that declared/runtime
        // mismatch). Matching Joy's three-value union exactly:
        // 'input-change' -> 'input', 'input-clear' -> 'clear', everything
        // else -> 'reset'. A consumer that re-fetches on 'input' only (the
        // whole reason this exists) never re-searches for an option's own
        // label right after selecting it.
        const rawReason: string = eventDetails.reason;
        const reason =
          rawReason === 'input-change' ? 'input' : rawReason === 'input-clear' ? 'clear' : 'reset';
        onInputChange?.(nextValue, reason);
      }}
      disabled={disabled}
      filter={filter}
    >
      <Combobox.InputGroup className={cx(autocompleteVariants({ variant, color: effectiveColor, size }), className)}>
        {startDecorator && <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>}
        <Combobox.Input
          ref={ref}
          aria-invalid={hasError || undefined}
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
            <Combobox.Empty className="px-3 py-2 text-sm text-ink-secondary">
              {loading ? loadingText : noOptionsText}
            </Combobox.Empty>
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

const AutocompleteBase = React.forwardRef(
  AutocompleteBaseComponent,
) as unknown as AutocompleteComponentType;
AutocompleteBase.displayName = 'AutocompleteBase';

function AutocompleteFieldComponent<Value = string>(
  { label, helperText, error, required, id: idProp, ...props }: AutocompleteProps<Value>,
  ref: React.Ref<HTMLInputElement>,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={props.disabled}
      id={id}
      helperId={helperId}
    >
      <AutocompleteBase
        ref={ref}
        id={id}
        required={required}
        error={error}
        aria-describedby={helperId}
        {...(props as AutocompleteProps<Value>)}
      />
    </FieldShell>
  );
}

const AutocompleteField = React.forwardRef(
  AutocompleteFieldComponent,
) as unknown as AutocompleteComponentType;
AutocompleteField.displayName = 'AutocompleteField';

// inputValue/onInputChange stay unbound on purpose: the bound path owns
// value/onChange, and the raw text in the box remains the component's own
// business. Binding both would make every keystroke a form write.
function BoundAutocompleteComponent<Value = string>(
  { name, onChange, error, helperText, ...rest }: AutocompleteProps<Value>,
  ref: React.Ref<HTMLInputElement>,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, valueAdapter, { onChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLInputElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <AutocompleteField
      {...(omitProps(rest, VALUE_PROPS) as AutocompleteProps<Value>)}
      {...(boundProps as Partial<AutocompleteProps<Value>>)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
}

const BoundAutocomplete = React.forwardRef(
  BoundAutocompleteComponent,
) as unknown as AutocompleteComponentType;
BoundAutocomplete.displayName = 'BoundAutocomplete';

function AutocompleteRootComponent<Value = string>(
  props: AutocompleteProps<Value>,
  ref: React.Ref<HTMLInputElement>,
) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundAutocomplete {...props} ref={ref} />;
  }
  return <AutocompleteField {...props} ref={ref} />;
}

export const Autocomplete = React.forwardRef(
  AutocompleteRootComponent,
) as unknown as AutocompleteComponentType;
Autocomplete.displayName = 'Autocomplete';
