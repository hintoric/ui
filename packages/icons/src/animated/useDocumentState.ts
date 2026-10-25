import { useSyncExternalStore } from 'react';

type Scheme = 'light' | 'dark';

/*
 * Both read <html>, the way `.hi-icon-auto` does for the static icons: this
 * package does not depend on @hintoric/ui, but its ColorSchemeProvider and
 * ReducedMotionProvider mirror their values onto <html> as
 * `data-color-scheme` and `data-reduced-motion`. Without a scheme attribute
 * the page is light (theme.css's :root); without a motion attribute the
 * system setting applies, as with ReducedMotionProvider absent.
 */
function observeHtml(attribute: string, onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute] });
  return () => observer.disconnect();
}

const subscribeScheme = (onChange: () => void) => observeHtml('data-color-scheme', onChange);
const schemeSnapshot = (): Scheme =>
  document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'dark' : 'light';
const serverScheme = (): Scheme => 'light';

export function useDocumentColorScheme(): Scheme {
  return useSyncExternalStore(subscribeScheme, schemeSnapshot, serverScheme);
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeMotion(onChange: () => void): () => void {
  const stopObserving = observeHtml('data-reduced-motion', onChange);
  const query = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : undefined;
  query?.addEventListener('change', onChange);
  return () => {
    stopObserving();
    query?.removeEventListener('change', onChange);
  };
}

function motionSnapshot(): boolean {
  const attribute = document.documentElement.getAttribute('data-reduced-motion');
  if (attribute === 'reduce') return true;
  if (attribute === 'no-preference') return false;
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const serverMotion = () => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, motionSnapshot, serverMotion);
}
