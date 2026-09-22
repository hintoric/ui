import { docsIndex } from 'virtual:docs-index';
import { NAV } from '../nav.ts';
import { CommandPalette } from './CommandPalette.tsx';
import { buildEntries } from './search.ts';

// Built once: the index is a build-time constant and the nav is a module.
const ENTRIES = buildEntries(docsIndex, NAV);

/** The palette, wired to this site's own pages. */
export function DocsSearch() {
  return <CommandPalette entries={ENTRIES} />;
}
