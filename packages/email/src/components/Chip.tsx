import * as React from 'react';
import { emailClass } from '../styles';
import { emailFonts, emailSchemes, variantTokens, type EmailColor, type EmailVariant } from '../tokens';

/**
 * chipVariants.ts: `min-h-5/6/7`, `px-1.5/2/3`, `text-xs/sm/base` at a 1.5
 * line-height. As with Button, the min-height becomes vertical padding.
 */
const SIZES = {
  sm: { minHeight: 20, paddingInline: 6, fontSize: 12 },
  md: { minHeight: 24, paddingInline: 8, fontSize: 14 },
  lg: { minHeight: 28, paddingInline: 12, fontSize: 16 },
} as const;

export interface ChipProps {
  variant?: EmailVariant;
  color?: EmailColor;
  size?: keyof typeof SIZES;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Chip for email, defaulting to soft / neutral like the web Chip; outlined and plain fill with `surface`. */
export function Chip({ variant = 'soft', color = 'neutral', size = 'md', style, children }: ChipProps) {
  const s = SIZES[size];
  const v = variantTokens('light', variant, color);
  const filled = v.backgroundColor !== undefined;
  const border = v.borderColor ? 1 : 0;
  const lineHeight = s.fontSize * 1.5;
  const paddingBlock = (s.minHeight - lineHeight) / 2 - border;
  return (
    <span
      className={[emailClass.variant(variant, color), filled ? '' : emailClass.surface].filter(Boolean).join(' ')}
      style={{
        display: 'inline-block',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        padding: `${paddingBlock}px ${s.paddingInline}px`,
        borderRadius: '1.5rem',
        fontFamily: emailFonts.body,
        fontSize: `${s.fontSize}px`,
        fontWeight: 500,
        lineHeight: 1.5,
        color: v.color,
        backgroundColor: v.backgroundColor ?? emailSchemes.light.surface,
        border: v.borderColor ? `1px solid ${v.borderColor}` : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
