import * as React from 'react';
import { emailClass } from '../styles';
import { emailFonts, emailSchemes } from '../tokens';

export type TypographyLevel =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'title-lg'
  | 'title-md'
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'body-xs';

type Ink = 'inkPrimary' | 'inkSecondary' | 'inkTertiary' | 'inkIcon';

/*
 * Typography's typographyVariants.ts, resolved: Tailwind's text-4xl…text-xs
 * in px, its font-bold/semibold/medium as numbers, `tracking-tight` as
 * -0.025em, and the same unitless line-heights (1.33334, 1.5, 1.42858), so the
 * computed line box matches the web component to the sub-pixel.
 */
const LEVELS: Record<TypographyLevel, { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing?: string; ink: Ink }> = {
  h1: { fontSize: '36px', fontWeight: 700, lineHeight: 1.33334, letterSpacing: '-0.025em', ink: 'inkPrimary' },
  h2: { fontSize: '30px', fontWeight: 700, lineHeight: 1.33334, letterSpacing: '-0.025em', ink: 'inkPrimary' },
  h3: { fontSize: '24px', fontWeight: 600, lineHeight: 1.33334, letterSpacing: '-0.025em', ink: 'inkPrimary' },
  h4: { fontSize: '20px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '-0.025em', ink: 'inkPrimary' },
  'title-lg': { fontSize: '18px', fontWeight: 600, lineHeight: 1.33334, ink: 'inkPrimary' },
  'title-md': { fontSize: '16px', fontWeight: 500, lineHeight: 1.5, ink: 'inkPrimary' },
  'title-sm': { fontSize: '14px', fontWeight: 500, lineHeight: 1.42858, ink: 'inkPrimary' },
  'body-lg': { fontSize: '18px', fontWeight: 400, lineHeight: 1.5, ink: 'inkSecondary' },
  'body-md': { fontSize: '16px', fontWeight: 400, lineHeight: 1.5, ink: 'inkSecondary' },
  'body-sm': { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, ink: 'inkTertiary' },
  'body-xs': { fontSize: '12px', fontWeight: 500, lineHeight: 1.5, ink: 'inkTertiary' },
};

const DEFAULT_TAG: Record<TypographyLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'title-lg': 'p',
  'title-md': 'p',
  'title-sm': 'p',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'body-xs': 'span',
};

export interface TypographyProps {
  level?: TypographyLevel;
  /** The element to render. Defaults to the same tag the web Typography picks for the level. */
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  textAlign?: 'left' | 'center' | 'right';
  /**
   * Overrides the level's ink, like Joy's `textColor="text.tertiary"`.
   * `icon` is the theme's faintest ink — for fine print that should recede.
   */
  textColor?: 'primary' | 'secondary' | 'tertiary' | 'icon';
  /** Margin, spacing and the like — there is no Stack in email, so spacing lives on the text. */
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TEXT_COLOR: Record<NonNullable<TypographyProps['textColor']>, Ink> = {
  primary: 'inkPrimary',
  secondary: 'inkSecondary',
  tertiary: 'inkTertiary',
  icon: 'inkIcon',
};

/** Typography for email: the same levels, sizes and ink colours, as inline styles. */
export function Typography({ level = 'body-md', component, textAlign, textColor, style, children }: TypographyProps) {
  const spec = LEVELS[level];
  const ink = textColor ? TEXT_COLOR[textColor] : spec.ink;
  const Tag = component ?? DEFAULT_TAG[level];
  return (
    <Tag
      className={emailClass[ink]}
      style={{
        margin: 0,
        fontFamily: emailFonts.body,
        fontSize: spec.fontSize,
        fontWeight: spec.fontWeight,
        lineHeight: spec.lineHeight,
        letterSpacing: spec.letterSpacing,
        color: emailSchemes.light[ink],
        textAlign,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
