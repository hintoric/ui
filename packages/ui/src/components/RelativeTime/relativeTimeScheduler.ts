// A single shared timer for every mounted RelativeTime instance, mirroring
// @github/relative-time-element's dateObserver singleton -- one setTimeout
// for the whole app instead of one per element, which matters when a page
// renders many timestamps at once (e.g. a comment list).

interface Listener {
  getNextDelayMs: () => number;
  onTick: () => void;
}

const listeners = new Set<Listener>();
let timer: ReturnType<typeof setTimeout> | undefined;

function computeMinDelayMs(): number {
  let min = Infinity;
  for (const listener of listeners) {
    min = Math.min(min, listener.getNextDelayMs());
  }
  return min;
}

function tick(): void {
  timer = undefined;
  for (const listener of listeners) {
    listener.onTick();
  }
  reschedule();
}

function reschedule(): void {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
  const minDelayMs = computeMinDelayMs();
  if (!Number.isFinite(minDelayMs)) return;
  timer = setTimeout(tick, minDelayMs);
}

export function scheduleRelativeTimeUpdate(getNextDelayMs: () => number, onTick: () => void): () => void {
  const listener: Listener = { getNextDelayMs, onTick };
  listeners.add(listener);
  reschedule();
  return () => {
    listeners.delete(listener);
    reschedule();
  };
}
