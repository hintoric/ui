import * as React from 'react';
import { Img } from 'react-email';
import { emailAlertIcon } from '../alertIcons';
import { emailClass } from '../styles';
import { emailFonts, emailRadius, emailSchemes, variantTokens, type EmailColor, type EmailVariant } from '../tokens';

/**
 * alertVariants.ts: `gap-2/2.5/3.5`, `p-2/3/4`, `text-xs/sm/base` at a 1.5
 * line-height; the icon is AlertIcon's 20px up to md and 24px at lg.
 */
const SIZES = {
  sm: { gap: 8, padding: 8, fontSize: 12, icon: 20 },
  md: { gap: 10, padding: 12, fontSize: 14, icon: 20 },
  lg: { gap: 14, padding: 16, fontSize: 16, icon: 24 },
} as const;

export interface AlertProps {
  variant?: EmailVariant;
  color?: EmailColor;
  size?: keyof typeof SIZES;
  /**
   * A box — normally an image icon — on the first line, before the text.
   * Left out, the alert shows the icon for its colour, as the web Alert
   * does; `null` shows none.
   */
  startDecorator?: React.ReactNode;
  /** A box on the first line, after the text. */
  endDecorator?: React.ReactNode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Alert for email, defaulting to soft / neutral like the web Alert; outlined
 * and plain fill with `surface`. A table like Card, since that is the only box
 * Outlook pads reliably. Every cell sets the type itself: tables in quirks
 * mode — a webmail that drops the doctype — don't inherit font size, weight
 * or line height.
 *
 * Decorators get a cell each, as wide as they are, and sit centred in a cell
 * one line high, so an icon lines up with the first line of the text as the
 * web Alert's `min-h-[1lh] items-center` does. That cell has no line height
 * of its own — a decorator is a box; text in it needs its own font-size.
 */
export function Alert({ variant = 'soft', color = 'neutral', size = 'md', startDecorator, endDecorator, style, children }: AlertProps) {
  const s = SIZES[size];
  const start = startDecorator === undefined ? <AlertIcon variant={variant} color={color} size={s.icon} /> : startDecorator;
  const v = variantTokens('light', variant, color);
  const filled = v.backgroundColor !== undefined;
  const lineHeight = s.fontSize * 1.5;
  const type: React.CSSProperties = { fontFamily: emailFonts.body, fontSize: `${s.fontSize}px`, fontWeight: 500, lineHeight: 1.5 };
  const decorator = (node: React.ReactNode, side: 'start' | 'end') => (
    <td width="1" style={{ verticalAlign: 'top', [side === 'start' ? 'paddingRight' : 'paddingLeft']: `${s.gap}px` }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
        <tbody>
          <tr>
            <td data-alert-decorator="" height={lineHeight} style={{ height: `${lineHeight}px`, verticalAlign: 'middle', fontSize: 0, lineHeight: 0 }}>
              {node}
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      className={[emailClass.variant(variant, color), filled ? '' : emailClass.surface].filter(Boolean).join(' ')}
      style={{
        borderCollapse: 'separate',
        borderRadius: emailRadius.sm,
        backgroundColor: v.backgroundColor ?? emailSchemes.light.surface,
        color: v.color,
        border: v.borderColor ? `1px solid ${v.borderColor}` : undefined,
        ...type,
        ...style,
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: `${s.padding}px`, ...type }}>
            {start || endDecorator ? (
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                <tbody>
                  <tr>
                    {start && decorator(start, 'start')}
                    <td data-alert-content="" style={{ verticalAlign: 'top', ...type }}>
                      {children}
                    </td>
                    {endDecorator && decorator(endDecorator, 'end')}
                  </tr>
                </tbody>
              </table>
            ) : (
              children
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * The colour's icon as a light / dark pair of hosted PNGs, like HintoricLogo:
 * a mail client can't recolour an image, so each scheme's ink is its own file.
 * Clients without the dark stylesheet keep the light one.
 */
function AlertIcon({ variant, color, size }: { variant: EmailVariant; color: EmailColor; size: number }) {
  const light = emailAlertIcon('light', variant, color);
  const dark = emailAlertIcon('dark', variant, color);
  const img = (url: string, className: string, display: 'block' | 'none') => (
    // min-width and max-width: none against a host's `img { max-width: 100% }`
    // (Tailwind's preflight, some webmail), which in a cell sized to its
    // content resolves to 0 and hides the icon.
    <Img
      src={url}
      width={size}
      height={size}
      alt=""
      className={className}
      style={{ display, width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, maxWidth: 'none', border: 0 }}
    />
  );
  return (
    <>
      {img(light.url, emailClass.lightOnly, 'block')}
      {img(dark.url, emailClass.darkOnly, 'none')}
    </>
  );
}

export interface AlertTitleProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * AlertTitle.tsx: `text-base/6 font-semibold`, in the alert's colour. Body
 * text under it keeps the alert's own size; give it `fontWeight: 400` for a
 * regular weight, since the alert is medium.
 */
export function AlertTitle({ style, children }: AlertTitleProps) {
  return <div style={{ fontFamily: emailFonts.body, fontSize: '16px', lineHeight: '24px', fontWeight: 600, ...style }}>{children}</div>;
}
