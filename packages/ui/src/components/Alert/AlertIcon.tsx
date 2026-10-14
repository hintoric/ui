import { cx } from '../../utils/cx';
import type { JoyColor } from '../../utils/colorVariantClasses';

/*
 * The icons Joy's own Alert demos pair with each colour — Material Icons'
 * Info, Report, CheckCircle and Warning (Apache 2.0), filled, on a 24-unit
 * grid. Joy ships no default; @hintoric/ui shows one so an alert's kind reads
 * without relying on colour alone.
 */
export const ALERT_ICONS = {
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  report:
    'M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z',
  'check-circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
} as const;

export type AlertIconName = keyof typeof ALERT_ICONS;

export const ALERT_ICON_FOR_COLOR: Record<JoyColor, AlertIconName> = {
  primary: 'info',
  neutral: 'info',
  danger: 'report',
  success: 'check-circle',
  warning: 'warning',
};

export interface AlertIconProps {
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * The icon an Alert of this colour shows by default. 20px up to `md` and 24px
 * at `lg` — Joy's Alert sets `--Icon-fontSize` to `xl` / `xl2` — in the
 * alert's own text colour, which is what Joy's `--Icon-color: currentColor`
 * gives its icons.
 */
export function AlertIcon({ color = 'neutral', size = 'md', className }: AlertIconProps) {
  const name = ALERT_ICON_FOR_COLOR[color];
  return (
    <svg
      data-alert-icon={name}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cx('shrink-0', size === 'lg' ? 'size-6' : 'size-5', className)}
    >
      <path d={ALERT_ICONS[name]} />
    </svg>
  );
}
