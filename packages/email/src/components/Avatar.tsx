import * as React from 'react';
import { Img } from 'react-email';
import { emailClass } from '../styles';
import { emailFonts, variantTokens, type EmailColor, type EmailVariant } from '../tokens';
import { safeImageSrc } from '../safeUrl';

/** avatarVariants.ts: 32/40/48px boxes, text-sm/base/lg, medium/medium/semibold. */
const SIZES = {
  sm: { box: 32, fontSize: '14px', fontWeight: 500 },
  md: { box: 40, fontSize: '16px', fontWeight: 500 },
  lg: { box: 48, fontSize: '18px', fontWeight: 600 },
} as const;

export interface AvatarProps {
  variant?: EmailVariant;
  color?: EmailColor;
  size?: keyof typeof SIZES;
  /** An https image. Without one, `children` (usually initials) is shown. */
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}

/**
 * Avatar for email, defaulting to soft / neutral like the web Avatar. Unlike
 * Card, outlined and plain stay transparent — Joy's Avatar has no surface
 * fallback. The initials are centred by a table cell, since email has no flexbox.
 */
export function Avatar({ variant = 'soft', color = 'neutral', size = 'md', src, alt = '', children }: AvatarProps) {
  const s = SIZES[size];
  const safe = safeImageSrc(src);
  if (safe) {
    return <Img src={safe} width={s.box} height={s.box} alt={alt} style={{ display: 'inline-block', borderRadius: '50%', objectFit: 'cover' }} />;
  }
  const v = variantTokens('light', variant, color);
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      className={emailClass.variant(variant, color)}
      style={{
        display: 'inline-table',
        boxSizing: 'border-box',
        width: `${s.box}px`,
        height: `${s.box}px`,
        borderCollapse: 'separate',
        borderRadius: '50%',
        backgroundColor: v.backgroundColor ?? 'transparent',
        color: v.color,
        border: v.borderColor ? `1px solid ${v.borderColor}` : undefined,
        fontFamily: emailFonts.body,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: 1,
        verticalAlign: 'middle',
      }}
    >
      <tbody>
        <tr>
          <td align="center" style={{ padding: 0, verticalAlign: 'middle', textAlign: 'center' }}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
