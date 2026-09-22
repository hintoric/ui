import { fileURLToPath } from 'node:url';
import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE = fileURLToPath(new URL('./fixtures/two-tone.png', import.meta.url));

/** The two demos on the page, in document order: with a hash, then without. */
function frames(page: Page): { withHash: Locator; withoutHash: Locator } {
  const all = page.getByTestId('blurhash-image');
  return { withHash: all.first(), withoutHash: all.nth(1) };
}

/**
 * The element's box in DOCUMENT coordinates. `boundingBox()` is relative to
 * the viewport, so clicking a button that scrolls into view moves it by ten
 * pixels and a layout-shift assertion fails for the wrong reason.
 */
async function documentBox(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
  });
}

/** True when the canvas has actually painted something opaque. */
async function canvasIsPainted(canvas: Locator): Promise<boolean> {
  return canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('2d')!;
    const { data } = context.getImageData(0, 0, (element as HTMLCanvasElement).width, 1);
    return data[3] === 255 && (data[0] > 0 || data[1] > 0 || data[2] > 0);
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/blurhash-image');
  // The demo picture is drawn and encoded on mount; the buttons stay disabled
  // until it exists, which makes this the page's own "ready" signal.
  await expect(page.getByRole('button', { name: 'Bild laden' }).first()).toBeEnabled();
});

test('paints the blurhash before any image has been requested', async ({ page }) => {
  const frame = frames(page).withHash;

  await expect(frame.locator('canvas')).toBeVisible();
  expect(await canvasIsPainted(frame.locator('canvas'))).toBe(true);
  // No <img> at all yet: an empty src would resolve to the page itself and
  // fire an error before anything had even been asked for.
  await expect(frame.locator('img')).toHaveCount(0);
});

test('swaps the blurhash for the picture without moving the layout', async ({ page }) => {
  const frame = frames(page).withHash;
  const before = await documentBox(frame);

  await page.getByRole('button', { name: 'Bild laden' }).first().click();

  const image = frame.locator('img');
  await expect(image).toHaveCSS('opacity', '1', { timeout: 10_000 });
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);

  // The whole promise of the component: the box it reserved is the box the
  // picture ends up in, to the pixel.
  expect(await documentBox(frame)).toEqual(before);
  // And the placeholder stays underneath rather than being torn out, so a
  // later src change has something to fall back to.
  await expect(frame.locator('canvas')).toBeAttached();
});

test('falls back to a pulsing skeleton when no hash is known', async ({ page }) => {
  const frame = frames(page).withoutHash;

  await expect(frame.locator('canvas')).toHaveCount(0);
  await expect(frame.locator('.animate-pulse')).toBeVisible();

  const before = await documentBox(frame);
  await page.getByRole('button', { name: 'Bild laden' }).nth(1).click();

  await expect(frame.locator('img')).toHaveCSS('opacity', '1', { timeout: 10_000 });
  await expect(frame.locator('.animate-pulse')).toHaveCount(0);
  expect(await documentBox(frame)).toEqual(before);
});

test('encodes a picked file into a hash and shows it back', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(FIXTURE);

  // Scoped to this demo: the page is full of prose <code>, and plenty of it
  // ("Skeleton") is itself valid base83.
  const demo = page.locator('.docs-demo').filter({ has: page.locator('input[type="file"]') });
  const hash = demo.locator('code');
  await expect(hash).toHaveText(/^[0-9A-Za-z#$%*+,\-.:;=?@[\]^_{|}~]{6,}$/);

  const frame = demo.getByTestId('blurhash-image');
  await expect(frame.locator('canvas')).toBeVisible();
  expect(await canvasIsPainted(frame.locator('canvas'))).toBe(true);
  await expect(frame.locator('img')).toHaveCSS('opacity', '1');
});
