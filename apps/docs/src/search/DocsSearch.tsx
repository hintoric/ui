import { docsIndex } from 'virtual:docs-index';
import { EMAIL_NAV, NAV } from '../nav.ts';
import { usePlatform } from '../platform.tsx';
import { CommandPalette } from './CommandPalette.tsx';
import { buildEntries, withGroupPrefix } from './search.ts';

// Built once: the index is a build-time constant and the navs are modules.
// The email section shares page names with the web one ("Button"), so its
// groups say which side a hit is on.
const WEB_ENTRIES = buildEntries(docsIndex, NAV);
const EMAIL_ENTRIES = buildEntries(docsIndex, withGroupPrefix(EMAIL_NAV, 'E-Mail · '));

/**
 * The palette, wired to this site's own pages — both sections, the one the
 * reader is in first, so "Button" finds the Button they are looking at.
 */
export function DocsSearch() {
  const platform = usePlatform();
  return <CommandPalette entries={platform === 'email' ? [...EMAIL_ENTRIES, ...WEB_ENTRIES] : [...WEB_ENTRIES, ...EMAIL_ENTRIES]} />;
}
