import { encode } from 'blurhash';

export interface EncodeBlurhashOptions {
  /** Horizontal detail, 1–9. Four suits a landscape photo. */
  componentX?: number;
  /** Vertical detail, 1–9. */
  componentY?: number;
  /**
   * Longest edge the picture is scaled down to before encoding. Encoding is
   * O(pixels × components), and the result is a handful of blurred blobs
   * either way, so a large source is only slow, never sharper.
   */
  maxSize?: number;
}

type AnyContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function context2D(width: number, height: number): AnyContext2D {
  const canvas =
    typeof OffscreenCanvas === 'undefined'
      ? Object.assign(document.createElement('canvas'), { width, height })
      : new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('encodeBlurhash: no 2D canvas context available');
  return context as AnyContext2D;
}

/**
 * Turns a picture into a BlurHash string, for storing next to the image and
 * handing back to {@link BlurhashImage} later.
 *
 * Browser only — it needs a canvas. Encode on upload, not on render: the
 * point of a hash is that the client never has to see the full picture first.
 *
 * An `HTMLImageElement` loaded from another origin has to have been served
 * with CORS and marked `crossOrigin="anonymous"`, or reading its pixels back
 * is forbidden. Encoding the `File` or `Blob` you uploaded avoids the
 * problem entirely, and is the path to prefer.
 */
export async function encodeBlurhash(
  source: Blob | HTMLImageElement | ImageBitmap,
  { componentX = 4, componentY = 3, maxSize = 64 }: EncodeBlurhashOptions = {},
): Promise<string> {
  const bitmap = source instanceof Blob ? await createImageBitmap(source) : source;
  try {
    const sourceWidth = bitmap instanceof HTMLImageElement ? bitmap.naturalWidth : bitmap.width;
    const sourceHeight = bitmap instanceof HTMLImageElement ? bitmap.naturalHeight : bitmap.height;
    if (!sourceWidth || !sourceHeight) throw new Error('encodeBlurhash: the source has no pixels yet');

    const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const context = context2D(width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    let data: Uint8ClampedArray;
    try {
      data = context.getImageData(0, 0, width, height).data;
    } catch (cause) {
      // Reading back a canvas drawn from a cross-origin image is forbidden,
      // and the browser's own message names neither this function nor the
      // attribute that fixes it.
      throw new Error(
        'encodeBlurhash: cannot read the source pixels. A cross-origin image has to be served with CORS and marked crossOrigin="anonymous".',
        { cause },
      );
    }

    return encode(data, width, height, componentX, componentY);
  } finally {
    // Only the bitmap we made ourselves; a caller's image is theirs to keep.
    if (source instanceof Blob) (bitmap as ImageBitmap).close();
  }
}
