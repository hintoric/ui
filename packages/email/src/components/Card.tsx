import * as React from 'react';
import { emailClass } from '../styles';
import { emailFonts, emailRadius, emailSchemes, variantTokens, type EmailColor, type EmailVariant } from '../tokens';

export interface CardProps {
  variant?: EmailVariant;
  color?: EmailColor;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Card for email: Sheet's variant colours plus Card's own `rounded-md p-4`,
 * defaulting to outlined / neutral like the web Card. Outlined and plain fill
 * with `surface`, as Joy's Sheet does. A one-cell table, because that is the
 * only box Outlook pads reliably; Card's `gap-2` has no email equivalent, so
 * spacing between children is theirs to set.
 */
export function Card({ variant = 'outlined', color = 'neutral', style, children }: CardProps) {
  const v = variantTokens('light', variant, color);
  const filled = v.backgroundColor !== undefined;
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
        borderRadius: emailRadius.md,
        backgroundColor: v.backgroundColor ?? emailSchemes.light.surface,
        color: v.color,
        border: v.borderColor ? `1px solid ${v.borderColor}` : undefined,
        fontFamily: emailFonts.body,
        ...style,
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: '16px' }}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}
