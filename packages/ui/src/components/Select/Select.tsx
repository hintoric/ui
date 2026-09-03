'use client';
import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { cx } from '../../utils/cx';
import { selectVariants } from './selectVariants';
import { UnfoldIcon } from '../../internal/svg-icons/UnfoldIcon';
import type { SelectProps } from './types';

const INDICATOR_SIZE_CLASS = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
} as const;

// Joy UI's Select listbox: boxShadow.md, radius.sm, background.popup surface
// fallback (a slightly different surface token than Sheet/Card's plain
// `surface`), min-width: max-content so options aren't clipped narrower than
// their own content. Confirmed against @mui/joy's Select.js source
// (`SelectListbox`).
//
// Scope note: Joy's Popper additionally force-matches the listbox width to
// the trigger's width (its `equalWidth` modifier) — a floating-ui-level
// enhancement this wrapper doesn't reproduce; `min-width: max-content` alone
// still gives correct, non-clipped listbox sizing.
const LISTBOX_CLASS =
  'z-50 max-h-[44vh] min-w-[max-content] overflow-auto rounded-sm bg-surface-popup p-1 font-body shadow-[var(--shadow-md)] outline-none';

function SelectComponent<Value = string>(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    placeholder,
    startDecorator,
    endDecorator,
    indicator,
    value,
    defaultValue,
    onChange,
    multiple,
    disabled,
    name,
    required,
    id,
    defaultListboxOpen,
    listboxOpen,
    onListboxOpenChange,
    className,
    children,
    ...ariaProps
  }: SelectProps<Value>,
  ref: React.Ref<HTMLButtonElement>,
) {
  // Base UI's <Select.Value> only auto-resolves a selected item's label from
  // Select.Root's `items` prop — it doesn't read back the rendered
  // <Option>'s own children. Since Option accepts arbitrary ReactNode
  // children (matching Joy's API, not just strings), we build the value ->
  // label lookup ourselves from the actual <Option> elements instead of
  // requiring callers to pass a separate `items` map.
  const labelsByValue = React.useMemo(() => {
    const map = new Map<Value, React.ReactNode>();
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ value: Value; children?: React.ReactNode }>(child)) {
        map.set(child.props.value, child.props.children);
      }
    });
    return map;
  }, [children]);

  const renderValue = (selected: Value | Value[] | null): React.ReactNode => {
    if (selected == null) return placeholder;
    if (Array.isArray(selected)) {
      return selected.map((v) => labelsByValue.get(v) ?? String(v)).join(', ');
    }
    return labelsByValue.get(selected) ?? String(selected);
  };

  return (
    <BaseSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange as (value: Value | Value[] | null) => void}
      multiple={multiple}
      disabled={disabled}
      name={name}
      required={required}
      defaultOpen={defaultListboxOpen}
      open={listboxOpen}
      onOpenChange={onListboxOpenChange}
      modal={false}
    >
      <BaseSelect.Trigger
        ref={ref}
        id={id}
        className={cx(selectVariants({ variant, color, size }), className)}
        {...ariaProps}
      >
        {startDecorator && <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>}
        <BaseSelect.Value
          placeholder={placeholder}
          className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left data-[placeholder]:opacity-[0.64]"
        >
          {renderValue}
        </BaseSelect.Value>
        {endDecorator && <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>}
        <span className={cx('inline-flex items-center', INDICATOR_SIZE_CLASS[size])}>{indicator ?? <UnfoldIcon />}</span>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner side="bottom" align="start" sideOffset={4} className="z-50 outline-none">
          <BaseSelect.Popup className={LISTBOX_CLASS}>
            <BaseSelect.List>{children}</BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

type SelectComponentType = (<Value = string>(props: SelectProps<Value> & { ref?: React.Ref<HTMLButtonElement> }) => React.ReactElement) & {
  displayName?: string;
};

export const Select = React.forwardRef(SelectComponent) as unknown as SelectComponentType;
Select.displayName = 'Select';
