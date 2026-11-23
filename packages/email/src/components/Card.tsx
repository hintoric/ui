import * as React from 'react';
import { emailClass } from '../styles';
import { emailFonts, emailOutlineWidth, emailRadius, emailSchemes, variantTokens, type EmailColor, type EmailVariant } from '../tokens';

export interface CardProps {
  variant?: EmailVariant;
  color?: EmailColor;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Card for email: Sheet's variant colours plus Card's own `rounded-lg p-4`,
 * defaulting to outlined / neutral like the web Card. Outlined and plain fill
 * with `surface`, as Joy's Sheet does. A one-cell table, because that is the
 * only box Outlook pads reliably; Card's `gap-2` has no email equivalent, so
 * spacing between children is theirs to set.
 *
 * Unlike the web Card, the default (outlined, neutral) one keeps its outline
 * in light. The web Card drops it because it sits on the warm canvas; in an
 * email every Card sits on Layout's white card, where a borderless white Card
 * would vanish. The parity test compares it with a web Card that asks for
 * the outline explicitly.
 */
export function Card({ variant = 'outlined', color = 'neutral', style, children }: CardProps) {
  const v = variantTokens('light', variant, color);
  const filled = v.backgroundColor !== undefined;
  const borderColor = v.borderColor;
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
        borderRadius: emailRadius.lg,
        backgroundColor: v.backgroundColor ?? emailSchemes.light.surface,
        color: v.color,
        border: borderColor ? `${emailOutlineWidth} solid ${borderColor}` : undefined,
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
