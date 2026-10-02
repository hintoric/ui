import * as React from 'react';
import { Button as ReactEmailButton } from 'react-email';
import { emailClass } from '../styles';
import { emailFonts, emailRadius, variantTokens, type EmailColor, type EmailVariant } from '../tokens';
import { safeHref } from '../safeUrl';

/*
 * buttonVariants.ts, resolved. The web Button gets its height from
 * `min-h-8/9/11` and centres the label with flexbox; email has neither, so the
 * same box is built from line-height plus vertical padding:
 * (min-height − line-height) / 2, less the 1px border for outlined.
 */
const SIZES = {
  sm: { minHeight: 32, paddingInline: 12, fontSize: 14, lineHeight: 21 },
  md: { minHeight: 36, paddingInline: 16, fontSize: 14, lineHeight: 21 },
  lg: { minHeight: 44, paddingInline: 24, fontSize: 16, lineHeight: 24 },
} as const;

export interface ButtonProps {
  /** Rendered only for http(s) URLs; anything else renders nothing — a button nobody can follow is worse than none. */
  href: string;
  variant?: EmailVariant;
  color?: EmailColor;
  size?: keyof typeof SIZES;
  /** `rounded-full`, as on the web Button. */
  pill?: boolean;
  /** Stretches to the container — the usual call-to-action layout in a narrow email. */
  fullWidth?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Button for email: a link styled as the web Button, built on react-email's Outlook-safe Button. */
export function Button({ href, variant = 'solid', color = 'primary', size = 'md', pill = false, fullWidth = false, style, children }: ButtonProps) {
  const safe = safeHref(href);
  if (!safe || safe.startsWith('mailto:')) return null;
  const s = SIZES[size];
  const v = variantTokens('light', variant, color);
  const border = variant === 'outlined' ? 1 : 0;
  const paddingBlock = (s.minHeight - s.lineHeight) / 2 - border;
  return (
    <ReactEmailButton
      href={safe}
      className={emailClass.variant(variant, color)}
      style={{
        display: fullWidth ? 'block' : 'inline-block',
        boxSizing: 'border-box',
        width: fullWidth ? '100%' : undefined,
        textAlign: 'center',
        paddingTop: `${paddingBlock}px`,
        paddingBottom: `${paddingBlock}px`,
        paddingLeft: `${s.paddingInline}px`,
        paddingRight: `${s.paddingInline}px`,
        fontFamily: emailFonts.body,
        fontSize: `${s.fontSize}px`,
        fontWeight: 600,
        lineHeight: `${s.lineHeight}px`,
        textDecoration: 'none',
        borderRadius: pill ? '9999px' : emailRadius.sm,
        color: v.color,
        backgroundColor: v.backgroundColor ?? 'transparent',
        border: v.borderColor ? `1px solid ${v.borderColor}` : undefined,
        ...style,
      }}
    >
      {/* react-email wraps the label in its own inline-block span at
          line-height 120%. In the modes mail is actually shown in — the
          limited-quirks mode its XHTML doctype yields, or full quirks where a
          webmail drops the doctype — the link's own line-height no longer
          props the line up, so the button shrank to 120% of the font plus
          padding: 4–5px short at every size. This span carries the full
          line-height itself, so the box no longer depends on the mode. */}
      <span style={{ display: 'inline-block', lineHeight: `${s.lineHeight}px` }}>{children}</span>
    </ReactEmailButton>
  );
}
