import { docsIndex } from 'virtual:docs-index';
import { icons } from '@hintoric/icons';
import { EMAIL_NAV, ICONS_NAV, NAV } from '../nav.ts';
import { usePlatform } from '../platform.tsx';
import { CommandPalette } from './CommandPalette.tsx';
import { buildEntries, buildIconEntries, withGroupPrefix } from './search.ts';

// Built once: the index is a build-time constant and the navs are modules.
// The email section shares page names with the web one ("Button"), so its
// groups say which side a hit is on.
const WEB_ENTRIES = buildEntries(docsIndex, NAV);
const EMAIL_ENTRIES = buildEntries(docsIndex, withGroupPrefix(EMAIL_NAV, 'E-Mail · '));
const ICON_ENTRIES = [...buildEntries(docsIndex, ICONS_NAV), ...buildIconEntries(icons, 'Icons')];

/**
 * The palette, wired to this site's own pages — both sections, the one the
 * reader is in first, so "Button" finds the Button they are looking at.
 */
export function DocsSearch() {
  const platform = usePlatform();
  const entries =
    platform === 'email'
      ? [...EMAIL_ENTRIES, ...WEB_ENTRIES, ...ICON_ENTRIES]
      : platform === 'icons'
        ? [...ICON_ENTRIES, ...WEB_ENTRIES, ...EMAIL_ENTRIES]
        : [...WEB_ENTRIES, ...EMAIL_ENTRIES, ...ICON_ENTRIES];
  return <CommandPalette entries={entries} />;
}
