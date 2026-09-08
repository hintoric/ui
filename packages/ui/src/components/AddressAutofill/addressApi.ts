import type { AddressSuggestion } from './types';

const BASE_URL = 'https://autofill.api.hintoric.cloud';

export async function fetchAddressSuggestions(
  query: string,
  { limit, signal }: { limit: number; signal: AbortSignal },
): Promise<AddressSuggestion[]> {
  const url = new URL('/api/autocomplete', BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Address autocomplete request failed with status ${response.status}`);
  }
  return response.json() as Promise<AddressSuggestion[]>;
}
