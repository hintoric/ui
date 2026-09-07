import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets the scroll position on navigation. Without this the browser keeps the
 * window's scroll offset across client-side route changes, so following a nav
 * link from halfway down a long component page lands you halfway down the next
 * one. Anchor links (`/button#sizes`) are left alone so in-page jumps still work.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
