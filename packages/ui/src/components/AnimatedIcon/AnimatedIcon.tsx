'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { useDocumentColorScheme } from '../../utils/useDocumentColorScheme';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { applySlotColors, cdnSources, type SlotColors } from './slots';
import type { AnimatedIconProps } from './types';

// One request per URL however many icons render or how often the scheme
// flips; a failed request is dropped so the next mount can try again.
const jsonCache = new Map<string, Promise<unknown>>();

function loadJson<T>(url: string): Promise<T> {
  let request = jsonCache.get(url);
  if (!request) {
    request = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      return response.json();
    });
    request.catch(() => jsonCache.delete(url));
    jsonCache.set(url, request);
  }
  return request as Promise<T>;
}

/*
 * Plays a Lottie animation from the CDN, coloured for the current scheme.
 *
 * The player is lottie-web's `lottie_light` build: SVG renderer only and no
 * expression support, so no `eval` (strict CSP keeps working). It is imported
 * lazily, which keeps its ~170 kB (~47 kB gzipped) out of a consumer's main bundle and off the
 * server entirely.
 *
 * Colours are slots. The file carries the light values; for dark, every slot
 * is overwritten from `dark-slots.json` before the player sees the data (see
 * applySlotColors). A scheme change at runtime reloads the animation with the
 * other colours — lottie-web cannot recolour a running animation.
 *
 * Under reduced motion there is no player at all, only the still image (the
 * animation's end state). It is also the fallback if the player fails.
 */
export const AnimatedIcon = React.forwardRef<HTMLSpanElement, AnimatedIconProps>(function AnimatedIcon(
  { name, src, size = 160, mode = 'auto', title, className, style, ...props },
  ref,
) {
  const documentScheme = useDocumentColorScheme();
  const scheme = mode === 'auto' ? documentScheme : mode;
  const reducedMotion = useReducedMotion();
  const sources = src ?? (name ? cdnSources(name) : undefined);
  const animationUrl = sources?.animation;
  const darkSlotsUrl = sources?.darkSlots;

  const containerRef = React.useRef<HTMLSpanElement>(null);
  // Keyed by URL, so a different icon gets a fresh attempt.
  const [failedUrl, setFailedUrl] = React.useState<string>();
  const showStill = reducedMotion || (animationUrl !== undefined && failedUrl === animationUrl);

  React.useEffect(() => {
    if (showStill || !animationUrl || !darkSlotsUrl) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;

    Promise.all([
      import('lottie-web/build/player/lottie_light'),
      loadJson<object>(animationUrl),
      scheme === 'dark' ? loadJson<SlotColors>(darkSlotsUrl) : undefined,
    ])
      .then(([{ default: lottie }, animationData, darkSlots]) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        const animation = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: applySlotColors(animationData, darkSlots),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        destroy = () => animation.destroy();
      })
      .catch(() => {
        if (!cancelled) setFailedUrl(animationUrl);
      });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [showStill, animationUrl, darkSlotsUrl, scheme]);

  const dimension = typeof size === 'number' ? `${size}px` : size;
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };

  return (
    <span
      ref={ref}
      data-scheme={scheme}
      className={cx('inline-block shrink-0 align-middle', className)}
      style={{ width: dimension, height: dimension, ...style }}
      {...a11y}
      {...props}
    >
      {showStill ? (
        sources && <img src={scheme === 'dark' ? sources.dark : sources.light} alt="" className="block size-full" />
      ) : (
        <span ref={containerRef} data-animated-icon-player="" className="block size-full" />
      )}
    </span>
  );
});
