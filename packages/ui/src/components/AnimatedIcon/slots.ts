/** `{ slotId: [r, g, b, a] }`, every channel 0–1 — the format of `dark-slots.json`. */
export type SlotColors = Record<string, number[]>;

const CDN = 'https://cdn.hintoric.com/assets/icons';

export function cdnSources(name: string) {
  const base = `${CDN}/${name}`;
  return {
    animation: `${base}/${name}.json`,
    darkSlots: `${base}/dark-slots.json`,
    light: `${base}/light.svg`,
    dark: `${base}/dark.svg`,
  };
}

/*
 * Returns a copy of `animationData` with every colour slot in `colors`
 * replaced, twice over: in the top-level `slots` table (what a slot-aware
 * player reads) and on every property carrying the matching `sid` (what a
 * player without slot support reads — it only ever sees the inline value).
 * Doing both keeps the result correct whichever player renders it. A property
 * that was animated becomes static, since a slot colour has no keyframes.
 *
 * Always a copy, even with no colours: lottie-web completes and rewrites the
 * animation data it is handed, so a cached original must never reach it.
 */
export function applySlotColors<T>(animationData: T, colors: SlotColors = {}): T {
  const data = structuredClone(animationData) as T & { slots?: Record<string, unknown> };
  const ids = Object.keys(colors);
  if (ids.length === 0) return data;

  if (data.slots) {
    for (const id of ids) {
      if (id in data.slots) data.slots[id] = { p: { a: 0, k: colors[id] } };
    }
  }

  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.sid === 'string' && record.sid in colors) {
      record.a = 0;
      record.k = colors[record.sid];
      return;
    }
    for (const key in record) if (key !== 'slots') visit(record[key]);
  };
  visit(data);
  return data;
}
