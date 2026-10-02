/*
 * Every link in an email is a link someone may click without a second look —
 * a security alert's "review this activity" button most of all. React escapes
 * text but not the scheme of an href, so a `javascript:` or `data:` URL that
 * reached a template through data would survive rendering intact. Only these
 * schemes are let through; anything else renders as plain, unlinked text.
 */
const LINK_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

export function safeHref(href: string | undefined | null): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    return LINK_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    // Relative URLs are meaningless in an email: there is no base to resolve
    // them against once the message leaves the server.
    return undefined;
  }
}

/** Images additionally have to be https: mail clients block or warn on http. */
export function safeImageSrc(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
