import { useCallback, useMemo, useState } from 'react';
import { Button, Dropdown, Input, Menu, MenuButton, MenuItem, Snackbar } from '@hintoric/ui';
import { icons, type HintoricIcon, type IconMode } from '@hintoric/icons';
import { Code } from '../../components/Demo';
import { copyToClipboard } from '../../components/CodeBlock';
import { SegmentedToggle } from '../../components/SegmentedToggle';

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

export function IconsPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<IconMode>('auto');
  const [copied, setCopied] = useState<string | null>(null);
  const closeSnackbar = useCallback(() => setCopied(null), []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? icons.filter((Icon) => Icon.slug.includes(q) || Icon.displayName.toLowerCase().includes(q)) : icons;
  }, [query]);

  const copy = async (text: string, what: string) => {
    await copyToClipboard(text);
    setCopied(what);
  };

  return (
    <>
      <h1>Icons</h1>
      <p className="docs-lede">
        hintoric&rsquo;s icons and spot illustrations, each with a light and a dark variant. Use them as React
        components from <code>@hintoric/icons</code>, or as image URLs anywhere React is not.
      </p>

      <h2>Install</h2>
      <Code>{`npm install @hintoric/icons`}</Code>

      <h2>Usage</h2>
      <Code>{`import { EmptyInboxIcon } from '@hintoric/icons';

<EmptyInboxIcon className="size-40" />               // follows the colour scheme
<EmptyInboxIcon size={96} title="Inbox is empty" />  // named for assistive technology
<EmptyInboxIcon mode="dark" />                       // dark variant on any scheme`}</Code>
      <p>
        With <code>mode=&quot;auto&quot;</code> (the default) the icon shows its dark variant while{' '}
        <code>&lt;html&gt;</code> has <code>data-color-scheme=&quot;dark&quot;</code>, which{' '}
        <code>ColorSchemeProvider</code> from <code>@hintoric/ui</code> sets. Without <code>title</code> an icon
        is decorative and hidden from screen readers. Icons render inline as SVG; for places outside React,
        every component also carries its image URLs as <code>Icon.cdn.light</code> and{' '}
        <code>Icon.cdn.dark</code>.
      </p>

      <h2>All icons</h2>
      <div className="docs-icons-toolbar">
        <Input
          className="docs-icons-search"
          type="search"
          placeholder="Search icons"
          aria-label="Search icons"
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
      </div>

      {icons.length === 0 ? (
        <p className="docs-icons-empty">No icons yet.</p>
      ) : shown.length === 0 ? (
        <p className="docs-icons-empty">No icon matches &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul className="docs-icons-grid" aria-label="Icons">
          {shown.map((Icon) => {
            const s = snippets(Icon);
            return (
              <li key={Icon.slug} className="docs-icon-tile" data-mode={mode}>
                <div className="docs-icon-preview">
                  <Icon mode={mode} size="100%" />
                </div>
                <div className="docs-icon-name">{Icon.displayName}</div>
                <code className="docs-icon-slug">{Icon.slug}</code>
                <div className="docs-icon-actions">
                  <Button size="sm" variant="soft" color="primary" onClick={() => copy(s.import, `import { ${Icon.displayName} }`)}>
                    Copy import
                  </Button>
                  <Dropdown>
                    <MenuButton size="sm" variant="plain" color="neutral" aria-label={`More for ${Icon.displayName}`}>
                      More
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

      <Snackbar open={copied !== null} onClose={closeSnackbar} autoHideDuration={1500} size="sm">
        Copied {copied}
      </Snackbar>
    </>
  );
}
