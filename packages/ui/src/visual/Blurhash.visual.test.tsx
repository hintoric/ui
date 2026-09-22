import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Blurhash } from '../components/Blurhash';
import { BlurhashImage } from '../components/BlurhashImage';
import { encodeBlurhash } from '../utils/blurhash';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

/**
 * No `@mui/joy` counterpart, so no parity comparison. Scheme coverage still
 * applies, and so does the reason this suite exists at all: jsdom has no 2D
 * canvas, so every assertion about actual pixels — decoding *and* encoding —
 * can only be made here.
 */

/**
 * A 32×32 canvas stretched over a 240px box is resampled by the compositor,
 * and Chromium picks a different raster path under load: running this file
 * alone and running it inside the full suite produced the same image give or
 * take 0.8% of its pixels, all of them edge and banding noise. So the canvas
 * screenshots carry a tolerance, and the properties that would actually
 * regress — radius, box size, object-fit, the decoded colours — are asserted
 * on directly below rather than left to the image.
 */
const RASTER_NOISE = { comparatorOptions: { allowedMismatchedPixelRatio: 0.03 } };

/** A 32×32 picture, red on the left half, blue on the right. */
async function twoToneImage(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#ff0000';
  context.fillRect(0, 0, 16, 32);
  context.fillStyle = '#0000ff';
  context.fillRect(16, 0, 16, 32);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
}

function pixelAt(canvas: HTMLCanvasElement, x: number, y: number): [number, number, number, number] {
  const data = canvas.getContext('2d')!.getImageData(x, y, 1, 1).data;
  return [data[0], data[1], data[2], data[3]];
}

describe('encodeBlurhash', () => {
  it('produces a hash that decodes back to the original colours', async () => {
    const hash = await encodeBlurhash(await twoToneImage());

    render(
      <div className="relative size-[120px]">
        <Blurhash hash={hash} resolution={32} />
      </div>,
    );
    await settleTransitions();
    const canvas = page.getByTestId('blurhash').element() as HTMLCanvasElement;

    const [leftRed, , leftBlue] = pixelAt(canvas, 4, 16);
    const [rightRed, , rightBlue] = pixelAt(canvas, 27, 16);
    expect(leftRed).toBeGreaterThan(leftBlue);
    expect(rightBlue).toBeGreaterThan(rightRed);
  });

  it('accepts an HTMLImageElement', async () => {
    const url = URL.createObjectURL(await twoToneImage());
    const image = new Image();
    image.src = url;
    await image.decode();

    const hash = await encodeBlurhash(image);

    URL.revokeObjectURL(url);
    expect(hash.length).toBeGreaterThan(6);
  });
});

describe('Blurhash', () => {
  const painted: Record<string, string> = {};

  for (const scheme of COLOR_SCHEMES) {
    it(`paints opaque pixels in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const hash = await encodeBlurhash(await twoToneImage());
      render(
        <div className="relative size-[160px] overflow-hidden rounded-md">
          <Blurhash hash={hash} />
        </div>,
      );
      await settleTransitions();

      const canvas = page.getByTestId('blurhash').element() as HTMLCanvasElement;
      const pixel = pixelAt(canvas, 16, 16);
      painted[scheme] = pixel.join(',');

      expect(pixel[3]).toBe(255);
      const style = getComputedStyle(canvas);
      expect(style.position).toBe('absolute');
      expect(style.width).toBe('160px');
      expect(style.height).toBe('160px');
      await expect(page.getByTestId('blurhash')).toMatchScreenshot(`blurhash-${scheme}`, RASTER_NOISE);
    });
  }

  it('paints identically in both schemes', () => {
    // Deliberately the opposite of the usual "must differ" assertion: a
    // photograph does not change colour when the UI does, and a Blurhash that
    // reacted to the scheme would be a bug, not a feature.
    expect(painted.dark).toBe(painted.light);
  });
});

describe('BlurhashImage', () => {
  const box: Record<string, string> = {};
  // Nothing serves this, so the image errors — which is exactly the state
  // worth photographing: by design the placeholder stays put, so the
  // screenshot is the placeholder and it is deterministic.
  const MISSING = '/__no_such_image__.png';

  for (const scheme of COLOR_SCHEMES) {
    it(`holds the blurhash in place when the image never arrives in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const hash = await encodeBlurhash(await twoToneImage());
      render(
        <div className="w-[240px]">
          <BlurhashImage src={MISSING} hash={hash} alt="Beispielbild" />
        </div>,
      );
      await settleTransitions();

      const frame = page.getByTestId('blurhash-image').element();
      const style = getComputedStyle(frame);
      // 16 / 9 of the 240px the wrapper gives it, and clipped to the radius
      // so the canvas underneath cannot square off the corners.
      expect(style.width).toBe('240px');
      expect(style.height).toBe('135px');
      expect(style.overflow).toBe('hidden');
      expect(style.borderRadius).toBe(
        getComputedStyle(document.documentElement).getPropertyValue('--radius-md').trim(),
      );

      const image = frame.querySelector('img')!;
      const imageStyle = getComputedStyle(image);
      expect(imageStyle.objectFit).toBe('cover');
      expect(imageStyle.opacity).toBe('0');

      await expect(page.getByTestId('blurhash-image')).toMatchScreenshot(
        `blurhash-image-placeholder-${scheme}`,
        RASTER_NOISE,
      );
    });

    it(`falls back to a skeleton without a hash in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <div className="w-[240px]">
          <BlurhashImage src={MISSING} alt="Beispielbild" />
        </div>,
      );
      // Waiting the error out: a pulsing skeleton makes a flaky screenshot,
      // and the pulse is meant to stop once nothing more is coming.
      await vi.waitFor(() => expect(document.querySelector('.animate-pulse')).toBeNull());
      await settleTransitions();

      const frame = page.getByTestId('blurhash-image').element();
      box[scheme] = getComputedStyle(frame).backgroundColor;

      await expect(page.getByTestId('blurhash-image')).toMatchScreenshot(`blurhash-image-skeleton-${scheme}`);
    });
  }

  it('paints its frame differently in dark than in light', () => {
    expect(box.dark).not.toBe(box.light);
  });
});
