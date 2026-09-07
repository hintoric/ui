import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAddressSuggestions } from './useAddressSuggestions';
import { fetchAddressSuggestions } from './addressApi';
import type { AddressSuggestion } from './types';

vi.mock('./addressApi', () => ({ fetchAddressSuggestions: vi.fn() }));

const mockedFetch = vi.mocked(fetchAddressSuggestions);

const BERLIN: AddressSuggestion = {
  postalCode: '10115',
  city: 'Berlin',
  street: 'Ackerstr.',
  borough: 'Mitte',
  suburb: 'Mitte',
};

const OPTS = { minQueryLength: 2, debounceMs: 300, limit: 10 };

describe('useAddressSuggestions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not fetch below minQueryLength', async () => {
    const { result } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'a' },
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(result.current.suggestions).toEqual([]);
  });

  it('fetches only after debounceMs of no further typing', async () => {
    mockedFetch.mockResolvedValue([BERLIN]);
    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'ac' },
    });
    rerender({ query: 'ack' });
    rerender({ query: 'acke' });
    await vi.advanceTimersByTimeAsync(200);
    expect(mockedFetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual([BERLIN]));
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith('acke', expect.objectContaining({ limit: 10 }));
  });

  it('sets isLoading only while the debounced request is in flight', async () => {
    let resolveFetch: (value: AddressSuggestion[]) => void = () => {};
    mockedFetch.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));
    const { result } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(true));
    resolveFetch([BERLIN]);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('keeps existing suggestions visible while a new query is loading', async () => {
    mockedFetch.mockResolvedValueOnce([BERLIN]);
    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual([BERLIN]));

    mockedFetch.mockReturnValue(new Promise(() => {})); // never resolves in this test
    rerender({ query: 'ackerx' });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.suggestions).toEqual([BERLIN]);
  });

  it('aborts the in-flight request when a newer query supersedes it', async () => {
    const signals: AbortSignal[] = [];
    mockedFetch.mockImplementation((_query, { signal }) => {
      signals.push(signal);
      return new Promise(() => {}); // never resolves
    });
    const { rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    rerender({ query: 'ackers' });
    await vi.advanceTimersByTimeAsync(300);
    expect(signals[0].aborted).toBe(true);
  });

  it('a stale response that resolves after being superseded does not overwrite newer results', async () => {
    // Simulates a test double (or non-conformant fetch) that resolves an
    // aborted request instead of rejecting it — proves the hook's own
    // aborted-signal guard on the success path, not AbortController's
    // built-in contract (which a real `fetch` already honors).
    const STALE = [{ ...BERLIN, street: 'Stale street' }];
    const FRESH = [{ ...BERLIN, street: 'Fresh street' }];
    let resolveStale: (value: AddressSuggestion[]) => void = () => {};
    mockedFetch
      .mockImplementationOnce(() => new Promise((resolve) => { resolveStale = resolve; }))
      .mockImplementationOnce(() => Promise.resolve(FRESH));

    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    rerender({ query: 'ackers' });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual(FRESH));

    resolveStale(STALE); // the superseded request finally resolves
    await Promise.resolve();
    expect(result.current.suggestions).toEqual(FRESH);
  });

  it('sets hasError and clears a previously populated list on a rejected request', async () => {
    mockedFetch.mockResolvedValueOnce([BERLIN]);
    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual([BERLIN]));

    mockedFetch.mockRejectedValueOnce(new Error('network down'));
    rerender({ query: 'ackers' });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
