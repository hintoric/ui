'use client';
import * as React from 'react';

// useLayoutEffect warns during SSR on React 18; the height is a client-only
// concern, and the `rows={minRows}` attribute covers the server render.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * Hidden twin of the visible <textarea>, measured instead of it so the visible
 * one never collapses to `height: auto` mid-measurement (which can make the
 * page's scroll position jump). Same mechanism as @mui/base's
 * TextareaAutosize, which is what @mui/joy's Textarea renders.
 */
export const SHADOW_STYLE: React.CSSProperties = {
  visibility: 'hidden',
  position: 'absolute',
  overflow: 'hidden',
  height: 0,
  top: 0,
  left: 0,
  transform: 'translateZ(0)',
  // Measures content only; the visible textarea's own padding and border are
  // added back from its computed style.
  paddingTop: 0,
  paddingBottom: 0,
  // inputVariants' min-h-* would otherwise floor every measurement.
  minHeight: 0,
};

/**
 * Grows the textarea with its content between `minRows` and `maxRows`, like
 * @mui/joy's Textarea (verified against the real package: md is 36px at one
 * row, +24px per wrapped or explicit line, capped at `maxRows` with the
 * overflow then scrollable).
 */
export function useAutosize(
  inputRef: React.RefObject<HTMLTextAreaElement | null>,
  shadowRef: React.RefObject<HTMLTextAreaElement | null>,
  { minRows, maxRows, placeholder }: { minRows: number; maxRows?: number; placeholder?: string },
): () => void {
  const sync = React.useCallback(() => {
    const input = inputRef.current;
    const shadow = shadowRef.current;
    if (!input || !shadow) return;
    const style = window.getComputedStyle(input);
    // Not laid out (display: none, detached): nothing to measure against.
    if (style.width === '0px' || style.width === 'auto') return;

    shadow.style.width = style.width;
    shadow.value = input.value || placeholder || 'x';
    // A trailing newline adds a line the browser only lays out once
    // something follows it.
    if (shadow.value.endsWith('\n')) shadow.value += ' ';
    const contentHeight = shadow.scrollHeight;
    shadow.value = 'x';
    const rowHeight = shadow.scrollHeight;

    let height = Math.max(contentHeight, minRows * rowHeight);
    if (maxRows != null) height = Math.min(height, maxRows * rowHeight);
    height = Math.max(height, rowHeight);

    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const outer = height + padding + border;
    // jsdom has no layout: scrollHeight is 0 and padding unparseable.
    if (!Number.isFinite(outer) || rowHeight === 0) return;

    const next = `${outer}px`;
    if (input.style.height !== next) input.style.height = next;
    // Hidden while the content fits exactly; scrollable once maxRows clips it
    // (or minRows leaves it shorter than the box) — Joy's rule.
    const overflow = Math.abs(height - contentHeight) <= 1 ? 'hidden' : '';
    if (input.style.overflow !== overflow) input.style.overflow = overflow;
  }, [inputRef, shadowRef, minRows, maxRows, placeholder]);

  // Every render: a controlled value only arrives through one.
  useIsomorphicLayoutEffect(sync);

  // Line wrapping depends on the width, so re-measure when it changes. Height
  // changes are our own writes and are ignored, which also keeps the observer
  // from looping on them.
  React.useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof ResizeObserver === 'undefined') return;
    let width = input.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (next === width) return;
      width = next;
      sync();
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [inputRef, sync]);

  return sync;
}
