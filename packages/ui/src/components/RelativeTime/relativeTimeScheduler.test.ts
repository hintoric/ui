import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { scheduleRelativeTimeUpdate } from './relativeTimeScheduler';

// The scheduler is a true module-level singleton (by design -- one shared
// timer for the whole app), so listeners registered in one test leak into
// the next unless explicitly unsubscribed. Track every subscription made in
// a test and tear them all down in afterEach for real isolation.
let unsubscribes: Array<() => void> = [];
function subscribe(getNextDelayMs: () => number, onTick: () => void): void {
  unsubscribes.push(scheduleRelativeTimeUpdate(getNextDelayMs, onTick));
}

beforeEach(() => {
  vi.useFakeTimers();
  unsubscribes = [];
});

afterEach(() => {
  for (const unsubscribe of unsubscribes) unsubscribe();
  vi.useRealTimers();
});

describe('scheduleRelativeTimeUpdate', () => {
  it('sets exactly one timer for multiple registered listeners', () => {
    subscribe(() => 1000, () => {});
    subscribe(() => 5000, () => {});
    subscribe(() => 2000, () => {});
    expect(vi.getTimerCount()).toBe(1);
  });

  it('fires at the minimum delay across all listeners', () => {
    const onTickA = vi.fn();
    const onTickB = vi.fn();
    subscribe(() => 5000, onTickA);
    subscribe(() => 1000, onTickB);

    vi.advanceTimersByTime(999);
    expect(onTickA).not.toHaveBeenCalled();
    expect(onTickB).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    // Both listeners are ticked together, even though only B's delay elapsed --
    // matches upstream's dateObserver, which updates every registered
    // element whenever the shared timer fires.
    expect(onTickA).toHaveBeenCalledTimes(1);
    expect(onTickB).toHaveBeenCalledTimes(1);
  });

  it("reschedules after each tick using that listener's freshly re-evaluated delay", () => {
    // getNextDelayMs is called once at registration and again at every
    // reschedule (which happens synchronously as part of the tick that just
    // fired) -- not just once up front. Registration consumes delays[0];
    // the reschedule during the first tick consumes delays[1].
    const delays = [1000, 60_000];
    let callIndex = 0;
    const onTick = vi.fn();
    subscribe(() => delays[Math.min(callIndex++, delays.length - 1)]!, onTick);

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(59_999);
    expect(onTick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('unsubscribing stops that listener from being ticked', () => {
    const onTick = vi.fn();
    const unsubscribe = scheduleRelativeTimeUpdate(() => 1000, onTick);
    unsubscribe();
    vi.advanceTimersByTime(5000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it('clears the timer entirely once the last listener unsubscribes', () => {
    const unsubscribe = scheduleRelativeTimeUpdate(() => 1000, () => {});
    expect(vi.getTimerCount()).toBe(1);
    unsubscribe();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a newly-registered listener needing a sooner update reschedules the existing timer', () => {
    const onTick = vi.fn();
    subscribe(() => 10_000, onTick);
    expect(vi.getTimerCount()).toBe(1);

    subscribe(() => 1000, () => {});
    vi.advanceTimersByTime(1000);
    // The second registration should have moved the shared timer up to 1000ms,
    // so the first listener's onTick fires at 1000ms too, not 10000ms.
    expect(onTick).toHaveBeenCalledTimes(1);
  });
});
