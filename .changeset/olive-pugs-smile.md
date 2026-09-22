---
'@hintoric/ui': minor
---

Add `BlurhashImage`, a picture that holds its own place: the [BlurHash](https://github.com/woltapp/blurhash) paints immediately and the real image fades in over it. It is the `Skeleton` role filled with the colours of the actual picture rather than a grey rectangle — and without a `hash` prop it really is a `Skeleton`, so it can be adopted before the backend has a hash column. An image served from cache is revealed correctly, and when an image fails to load the placeholder stays put instead of collapsing to a broken-image icon.

Also exported: `Blurhash`, the decoded canvas on its own for building your own image containers, and `encodeBlurhash(source, options?)`, which turns a `File`, `Blob`, `HTMLImageElement` or `ImageBitmap` into a hash in the browser at upload time.
