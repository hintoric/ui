import * as React from 'react';
import { ButtonGroupContext } from './ButtonGroupContext';
import { ToggleButtonGroupContext } from '../ToggleButtonGroup/ToggleButtonGroupContext';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

interface GroupItemProps {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  value?: unknown;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  'aria-pressed'?: React.AriaAttributes['aria-pressed'];
}

/**
 * The props a Button or IconButton actually renders with once a surrounding
 * group is taken into account — the same resolution Joy's Button.js and
 * IconButton.js do: an explicit prop wins, then the group, then the
 * component's own default. Inside a ToggleButtonGroup, `aria-pressed` follows
 * the group's value and a click reports the button's `value` to it.
 */
export function useButtonGroupItem(
  props: GroupItemProps,
  defaults: { variant: JoyVariant; color: JoyColor; size: 'sm' | 'md' | 'lg' },
) {
  const group = React.useContext(ButtonGroupContext);
  const toggle = React.useContext(ToggleButtonGroupContext);
  const { onClick, value } = props;
  return {
    variant: props.variant ?? group.variant ?? defaults.variant,
    color: props.color ?? group.color ?? defaults.color,
    size: props.size ?? group.size ?? defaults.size,
    disabled: props.disabled ?? group.disabled,
    'aria-pressed': toggle ? toggle.value.includes(value) : props['aria-pressed'],
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (toggle && !event.defaultPrevented) {
        toggle.onClick(event, value);
      }
    },
  };
}
