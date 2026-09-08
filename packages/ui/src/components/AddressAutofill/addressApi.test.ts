import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAddressSuggestions } from './addressApi';

describe('fetchAddressSuggestions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the autocomplete endpoint with q and limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { postalCode: '10115', city: 'Berlin', street: 'Ackerstr.', borough: 'Mitte', suburb: 'Mitte' },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchAddressSuggestions('acker', { limit: 5, signal: new AbortController().signal });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string | URL);
    expect(requestedUrl.origin + requestedUrl.pathname).toBe('https://autofill.api.hintoric.cloud/api/autocomplete');
    expect(requestedUrl.searchParams.get('q')).toBe('acker');
    expect(requestedUrl.searchParams.get('limit')).toBe('5');
    expect(result).toEqual([
      { postalCode: '10115', city: 'Berlin', street: 'Ackerstr.', borough: 'Mitte', suburb: 'Mitte' },
    ]);
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );

    await expect(
      fetchAddressSuggestions('acker', { limit: 5, signal: new AbortController().signal }),
    ).rejects.toThrow();
  });
});
