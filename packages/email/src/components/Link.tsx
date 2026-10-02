import * as React from 'react';
import { Link as ReactEmailLink } from 'react-email';
import { emailClass } from '../styles';
import { emailFonts, mainColor, type EmailColor } from '../tokens';
import { safeHref } from '../safeUrl';

export interface LinkProps {
  /** Rendered only for http(s) and mailto URLs; anything else becomes plain text. */
  href: string;
  color?: EmailColor;
  /**
   * The web Link defaults to `hover`, but there is no reliable hover in email,
   * so the default here is `always`: an inbox reader needs to see a link is
   * one without touching it.
   */
  underline?: 'none' | 'always';
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Link for email: the web Link's `--color-*-main` colour, which steps from 500 to 400 in dark. */
export function Link({ href, color = 'primary', underline = 'always', style, children }: LinkProps) {
  const safe = safeHref(href);
  if (!safe) return <>{children}</>;
  return (
    <ReactEmailLink
      href={safe}
      className={emailClass.main(color)}
      style={{ fontFamily: emailFonts.body, color: mainColor('light', color), textDecoration: underline === 'always' ? 'underline' : 'none', wordBreak: 'break-word', ...style }}
    >
      {children}
    </ReactEmailLink>
  );
}
