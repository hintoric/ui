import * as React from 'react';
import { emailClass } from '../styles';
import { emailSchemes } from '../tokens';

export interface DividerProps {
  /** Spacing around the line — the web Divider has none of its own either. */
  style?: React.CSSProperties;
}

/**
 * Divider for email: a 1px line in `--color-divider`. A div rather than an
 * <hr>, whose borders Outlook and Gmail each draw differently. `background`
 * carries a solid fallback that Outlook's Word engine — which drops rgba() —
 * keeps; every other client takes the rgba `background-color` after it.
 */
export function Divider({ style }: DividerProps) {
  const t = emailSchemes.light;
  return (
    <div
      role="separator"
      className={emailClass.divider}
      style={{ height: '1px', lineHeight: '1px', fontSize: '1px', background: t.dividerFallback, backgroundColor: t.divider, border: 'none', margin: 0, ...style }}
    >
      &nbsp;
    </div>
  );
}
