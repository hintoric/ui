import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, ColorSchemeMenu, Dropdown, Input, Menu, MenuButton, MenuItem, Snackbar, useColorScheme } from '@hintoric/ui';
import { icons, type HintoricIcon, type IconMode } from '@hintoric/icons';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { copyToClipboard } from '../../components/CodeBlock';
import { SegmentedToggle } from '../../components/SegmentedToggle';
import { PlatformToggle } from '../../platform';
import { DocsSearch } from '../../search/DocsSearch';

const INSTALL = 'npm install @hintoric/icons';

function snippets(Icon: HintoricIcon) {
  const name = Icon.displayName;
  return {
    import: `import { ${name} } from '@hintoric/icons';`,
    jsx: `<${name} className="size-40" />`,
    light: Icon.cdn.light,
    dark: Icon.cdn.dark,
    img: Icon.cdn.dark
      ? `<img src="${Icon.cdn.light}" alt="" className="size-40 dark:hidden" />\n<img src="${Icon.cdn.dark}" alt="" className="hidden size-40 dark:block" />`
      : `<img src="${Icon.cdn.light}" alt="" className="size-40" />`,
  };
}

/*
 * The icon gallery is a full-screen tile view on purpose, outside the docs'
 * sidebar layout: it is something you scan, not read. The search query lives
 * in the URL (?q=), so a Ctrl+K hit on an icon opens the gallery filtered to it.
 */
export function IconsPage() {
  const { resolvedMode } = useColorScheme();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [mode, setMode] = useState<IconMode>('auto');
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeSnackbar = useCallback(() => setCopied(null), []);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const setQuery = (value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('q', value);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? icons.filter((Icon) => Icon.slug.includes(q) || Icon.displayName.toLowerCase().includes(q)) : icons;
  }, [query]);

  const copy = async (text: string, what: string, key?: string) => {
    await copyToClipboard(text);
    setCopied(what);
    if (key) {
      setCopiedKey(key);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  const copyIcon = (key: string) => (copiedKey === key ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />);

  return (
    <div className="docs-icons-page">
      <header className="docs-icons-header">
        <Link to="/" className="docs-icons-brand">
          <img
            src={`https://cdn.hintoric.com/assets/logo/ui/${resolvedMode === 'dark' ? 'white' : 'black'}.svg`}
            alt="hintoric/ui"
          />
        </Link>
        <h1 className="docs-icons-title">
          Icons <span>{shown.length === icons.length ? icons.length : `${shown.length} / ${icons.length}`}</span>
        </h1>
        <Input
          className="docs-icons-search"
          type="search"
          placeholder="Filter icons"
          aria-label="Filter icons"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SegmentedToggle<IconMode>
          aria-label="Preview variant"
          value={mode}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          onChange={setMode}
        />
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          className="docs-icons-install"
          startDecorator={copyIcon('install')}
          onClick={() => copy(INSTALL, 'install command', 'install')}
        >
          <code>{INSTALL}</code>
        </Button>
        <div className="docs-icons-header-end">
          <DocsSearch />
          <PlatformToggle />
          <ColorSchemeMenu />
        </div>
      </header>

      <main className="docs-icons-main">
        {icons.length === 0 ? (
          <p className="docs-icons-empty">No icons yet.</p>
        ) : shown.length === 0 ? (
          <p className="docs-icons-empty">No icon matches &ldquo;{query}&rdquo;.</p>
        ) : (
          <ul className="docs-icons-grid" aria-label="Icons">
            {shown.map((Icon) => {
              const s = snippets(Icon);
              const justCopied = copiedKey === Icon.slug;
              return (
                <li key={Icon.slug} className="docs-icon-tile" data-mode={mode}>
                  <div className="docs-icon-preview">
                    <Icon mode={mode} size="100%" />
                  </div>
                  <div className="docs-icon-name">{Icon.displayName}</div>
                  <code className="docs-icon-slug">{Icon.slug}</code>
                  <div className="docs-icon-actions">
                    <Button
                      size="sm"
                      variant="soft"
                      color={justCopied ? 'success' : 'primary'}
                      startDecorator={copyIcon(Icon.slug)}
                      onClick={() => copy(s.import, `import { ${Icon.displayName} }`, Icon.slug)}
                    >
                      {justCopied ? 'Copied' : 'Copy import'}
                    </Button>
                    <Dropdown>
                      <MenuButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        className="docs-icon-more"
                        aria-label={`More for ${Icon.displayName}`}
                        title="More"
                      >
                        <MoreHorizRoundedIcon />
                      </MenuButton>
                      <Menu size="sm">
                        <MenuItem onClick={() => copy(s.jsx, 'JSX')}>Copy JSX</MenuItem>
                        <MenuItem onClick={() => copy(s.light, 'light URL')}>Copy light URL</MenuItem>
                        {s.dark && <MenuItem onClick={() => copy(s.dark!, 'dark URL')}>Copy dark URL</MenuItem>}
                        <MenuItem onClick={() => copy(s.img, '<img> markup')}>Copy &lt;img&gt; markup</MenuItem>
                        <MenuItem onClick={() => copy(Icon.slug, 'slug')}>Copy slug</MenuItem>
                      </Menu>
                    </Dropdown>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Snackbar open={copied !== null} onClose={closeSnackbar} autoHideDuration={1500} size="sm">
        Copied {copied}
      </Snackbar>
    </div>
  );
}
