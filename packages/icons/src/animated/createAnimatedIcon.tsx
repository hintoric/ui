import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type JSX, type Ref } from 'react';
import type { IconMode } from '../createIcon';
import { applySlotColors, type SlotColors } from './slots';
import { useDocumentColorScheme, useReducedMotion } from './useDocumentState';

export interface AnimatedIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'title'> {
  /** Width and height. CSS sizing (`className="size-24"`) wins over it. @default 160 */
  size?: number | string;
  /**
   * `auto` follows `data-color-scheme` on `<html>`, as set by `@hintoric/ui`'s
   * ColorSchemeProvider; `light` and `dark` pin one scheme. @default 'auto'
   */
  mode?: IconMode;
  /** Accessible name. Without it the icon is decorative and hidden from assistive technology. */
  title?: string;
  ref?: Ref<HTMLSpanElement>;
}

export interface AnimatedIconDefinition {
  slug: string;
  name: string;
  cdn: {
    /** The Lottie JSON. Its colours are the light scheme's. */
    animation: string;
    /** `{ slotId: [r, g, b, a] }` (0–1) for the dark scheme. */
    darkSlots: string;
    /** Still images, shown under reduced motion: the animation's end state. */
    light: string;
    dark: string;
  };
}

export interface HintoricAnimatedIcon {
  (props: AnimatedIconProps): JSX.Element;
  displayName: string;
  slug: string;
  cdn: AnimatedIconDefinition['cdn'];
}

// In a layer, so a consumer's CSS sizing — Tailwind's utilities are layered
// too, but later — wins over `size`, as it does over a static icon's
// width/height attributes. Hoisted into <head> once, like createIcon's.
const CSS =
  '@layer base{' +
  '.hi-animated-icon{display:inline-block;flex-shrink:0;vertical-align:middle;' +
  'width:var(--hi-animated-icon-size);height:var(--hi-animated-icon-size)}' +
  '.hi-animated-icon>*{display:block;width:100%;height:100%}}';

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
 * An icon that plays a Lottie animation from the CDN, coloured for the scheme.
 *
 * The player is lottie-web's `lottie_light` build: SVG renderer only and no
 * expression support, so no `eval` (strict CSP keeps working). It is imported
 * lazily, which keeps its ~170 kB (~47 kB gzipped) out of a consumer's main
 * bundle and off the server entirely.
 *
 * Colours are slots. The file carries the light values; for dark, every slot
 * is overwritten from `dark-slots.json` before the player sees the data (see
 * applySlotColors). A scheme change at runtime reloads the animation with the
 * other colours — lottie-web cannot recolour a running animation.
 *
 * Under reduced motion there is no player at all, only the still image (the
 * animation's end state). It is also the fallback if the player fails.
 */
export function createAnimatedIcon(def: AnimatedIconDefinition): HintoricAnimatedIcon {
  const { animation: animationUrl, darkSlots: darkSlotsUrl } = def.cdn;

  function AnimatedIcon({ size = 160, mode = 'auto', title, className, style, ...props }: AnimatedIconProps) {
    const documentScheme = useDocumentColorScheme();
    const scheme = mode === 'auto' ? documentScheme : mode;
    const reducedMotion = useReducedMotion();
    const [failed, setFailed] = useState(false);
    const showStill = reducedMotion || failed;
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (showStill) return;
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
          if (!cancelled) setFailed(true);
        });

      return () => {
        cancelled = true;
        destroy?.();
      };
    }, [showStill, scheme]);

    return (
      <>
        <style href="hintoric-animated-icons" precedence="default">
          {CSS}
        </style>
        <span
          data-icon={def.slug}
          data-scheme={scheme}
          className={['hi-animated-icon', className].filter(Boolean).join(' ')}
          style={{ '--hi-animated-icon-size': typeof size === 'number' ? `${size}px` : size, ...style } as CSSProperties}
          {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
          {...props}
        >
          {showStill ? (
            <img src={scheme === 'dark' ? def.cdn.dark : def.cdn.light} alt="" />
          ) : (
            <span ref={containerRef} data-animated-icon-player="" />
          )}
        </span>
      </>
    );
  }
  AnimatedIcon.displayName = def.name;
  AnimatedIcon.slug = def.slug;
  AnimatedIcon.cdn = def.cdn;
  return AnimatedIcon;
}
