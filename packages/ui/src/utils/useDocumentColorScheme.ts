'use client';
import * as React from 'react';
import type { ResolvedColorScheme } from '../theme/ColorSchemeProvider';

/*
 * The scheme that is actually painted, read from `data-color-scheme` on
 * <html> rather than from useColorScheme(): ColorSchemeProvider mirrors its
 * resolved mode there (see its comment), and theme.css keys every dark token
 * off that attribute, so this agrees with the page's CSS even for a consumer
 * that sets the attribute without the provider. No attribute means light,
 * like theme.css's :root.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color-scheme'] });
  return () => observer.disconnect();
}

function snapshot(): ResolvedColorScheme {
  return document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'dark' : 'light';
}

function serverSnapshot(): ResolvedColorScheme {
  return 'light';
}

export function useDocumentColorScheme(): ResolvedColorScheme {
  return React.useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
