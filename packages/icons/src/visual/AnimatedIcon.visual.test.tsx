import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import lottie from 'lottie-web/build/player/lottie_light';
import { FormReadingLensAnimatedIcon } from '../animated';
import { COLOR_SCHEMES, setColorScheme, type ColorScheme } from './setup';

// No @mui/joy counterpart and no web counterpart to compare against: what
// matters is the real file through the real player, recoloured by the real
// dark-slots.json, in both schemes. Hits the live CDN, like @hintoric/ui's
// AnimatedMapImage test hits its map service.
//
// The animation loops forever, so every player screenshot first parks it on
// one frame (all three frames drawn, before the loop clears them) through lottie-web's global API —
// the same module instance the component imported lazily.
const SETTLED_FRAME = 200;

async function renderPlayer(scheme: ColorScheme, testId: string): Promise<HTMLElement> {
  setColorScheme(scheme);
  render(
    <div style={{ width: 400 }}>
      <FormReadingLensAnimatedIcon data-testid={testId} />
    </div>,
  );
  const el = page.getByTestId(testId).element() as HTMLElement;
  await expect.poll(() => el.querySelectorAll('[data-animated-icon-player] svg path').length, { timeout: 15000 }).toBeGreaterThan(0);
  // The global goToAndStop exists at runtime (animationManager) but is missing from lottie-web's types.
  (lottie as typeof lottie & { goToAndStop(value: number, isFrame: boolean): void }).goToAndStop(SETTLED_FRAME, true);
  return el;
}

/** Every distinct painted fill in the player's SVG, as computed by the browser. */
function fills(el: HTMLElement): Set<string> {
  const paths = el.querySelectorAll('[data-animated-icon-player] svg path');
  return new Set([...paths].map((path) => getComputedStyle(path).fill).filter((fill) => fill !== 'none'));
}

describe('AnimatedIcon visual', () => {
  it.each(COLOR_SCHEMES)('plays the animation as a 160px inline-block in %s', async (scheme) => {
    const el = await renderPlayer(scheme, `icon-${scheme}`);
    const style = getComputedStyle(el);
    expect(style.display).toBe('inline-block');
    expect(style.width).toBe('160px');
    expect(style.height).toBe('160px');
    const svg = el.querySelector('[data-animated-icon-player] svg') as SVGSVGElement;
    expect(svg.getBoundingClientRect().width).toBe(160);
    await expect.element(page.getByTestId(`icon-${scheme}`)).toMatchScreenshot(`animatedicon-player-${scheme}`);
  });

  it('paints the sticker white in light and the dark slot colour in dark', async () => {
    // sticker is [1, 1, 1, 1] in the file and [0.09, 0.102, 0.11, 1] in dark-slots.json;
    // lottie-web truncates channels to integers, so 0.09 * 255 = 22.95 paints as 22.
    const light = fills(await renderPlayer('light', 'icon-light'));
    expect(light).toContain('rgb(255, 255, 255)');
    expect(light).not.toContain('rgb(22, 26, 28)');

    const dark = fills(await renderPlayer('dark', 'icon-dark'));
    expect(dark).toContain('rgb(22, 26, 28)');
    expect(dark).not.toContain('rgb(255, 255, 255)');
  });

  it('recolours a mounted icon when <html> switches scheme', async () => {
    const el = await renderPlayer('light', 'icon');
    const before = fills(el);
    setColorScheme('dark');
    await expect.poll(() => fills(el).has('rgb(22, 26, 28)'), { timeout: 10000 }).toBe(true);
    expect(fills(el)).not.toEqual(before);
  });

  it.each(COLOR_SCHEMES)('shows the %s still image under reduced motion', async (scheme) => {
    setColorScheme(scheme);
    document.documentElement.setAttribute('data-reduced-motion', 'reduce');
    render(
      <div style={{ width: 400 }}>
        <FormReadingLensAnimatedIcon data-testid={`still-${scheme}`} />
      </div>,
    );
    const el = page.getByTestId(`still-${scheme}`).element() as HTMLElement;
    const img = el.querySelector('img') as HTMLImageElement;
    expect(el.querySelector('[data-animated-icon-player]')).toBeNull();
    expect(img.src).toBe(`https://cdn.hintoric.com/assets/icons/form-reading-lens/${scheme}.svg`);
    await expect.poll(() => img.complete && img.naturalWidth > 0, { timeout: 15000 }).toBe(true);
    expect(getComputedStyle(img).width).toBe('160px');
    await expect.element(page.getByTestId(`still-${scheme}`)).toMatchScreenshot(`animatedicon-still-${scheme}`);
  });
});
