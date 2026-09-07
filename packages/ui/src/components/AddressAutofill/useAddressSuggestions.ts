import * as React from 'react';
import { fetchAddressSuggestions } from './addressApi';
import type { AddressSuggestion } from './types';

export interface UseAddressSuggestionsOptions {
  minQueryLength: number;
  debounceMs: number;
  limit: number;
}

export interface UseAddressSuggestionsResult {
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  hasError: boolean;
}

export function useAddressSuggestions(
  query: string,
  { minQueryLength, debounceMs, limit }: UseAddressSuggestionsOptions,
): UseAddressSuggestionsResult {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (query.length < minQueryLength) {
      setSuggestions([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
      fetchAddressSuggestions(query, { limit, signal: controller.signal })
        .then((results) => {
          // Guards the success path too, not just the rejection path: a test
          // double (or a non-conformant fetch polyfill) might resolve an
          // aborted request instead of rejecting it, and an older response
          // must never overwrite what a newer query already produced.
          if (controller.signal.aborted) return;
          setSuggestions(results);
          setIsLoading(false);
        })
        .catch(() => {
          // Aborted because a newer keystroke superseded this request — the
          // effect that aborted it owns the state from here, not this one.
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setHasError(true);
          setIsLoading(false);
        });
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, minQueryLength, debounceMs, limit]);

  return { suggestions, isLoading, hasError };
}
