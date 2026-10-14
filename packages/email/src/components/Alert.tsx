import * as React from 'react';
import { emailClass } from '../styles';
import { emailFonts, emailRadius, emailSchemes, variantTokens, type EmailColor, type EmailVariant } from '../tokens';

/** alertVariants.ts: `gap-2/2.5/3.5`, `p-2/3/4`, `text-xs/sm/base` at a 1.5 line-height. */
const SIZES = {
  sm: { gap: 8, padding: 8, fontSize: 12 },
  md: { gap: 10, padding: 12, fontSize: 14 },
  lg: { gap: 14, padding: 16, fontSize: 16 },
} as const;

export interface AlertProps {
  variant?: EmailVariant;
  color?: EmailColor;
  size?: keyof typeof SIZES;
  /** A box — normally an image icon — on the first line, before the text. */
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
            {startDecorator || endDecorator ? (
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                <tbody>
                  <tr>
                    {startDecorator && decorator(startDecorator, 'start')}
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
