import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ColorSchemeMenu, useColorScheme } from '@hintoric/ui';
import { NAV } from './nav';
import { DocsSearch } from './search/DocsSearch.tsx';
import { applyHeadingIds, scrollToAnchor } from './search/anchors.ts';

export function Layout() {
  // resolvedMode, not mode: mode can now be 'system', which would fall
  // through to the black logo on a dark background.
  const { resolvedMode } = useColorScheme();
  const { pathname, hash } = useLocation();
  const content = useRef<HTMLDivElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // After the page has rendered, not before: the headings the ids go on are
  // the outlet's children, and the hash cannot be jumped to until they exist.
  useEffect(() => {
    if (content.current) applyHeadingIds(content.current);
    scrollToAnchor(hash);
  }, [pathname, hash]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="docs-shell">
      <aside id="docs-navigation" className={`docs-sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
        <NavLink to="/" className="docs-sidebar-brand">
          <img
            src={`https://cdn.hintoric.com/assets/logo/ui/${resolvedMode === 'dark' ? 'white' : 'black'}.svg`}
            alt="hintoric/ui"
            className="docs-sidebar-logo"
          />
        </NavLink>
        {NAV.map((group) => (
          <div className="docs-nav-group" key={group.title}>
            <p className="docs-nav-group-title">{group.title}</p>
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `docs-nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>
      {mobileNavOpen && (
        <button
          type="button"
          className="docs-nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div className="docs-main">
        <div className="docs-topbar">
          <button
            type="button"
            className="docs-menu-button"
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileNavOpen}
            aria-controls="docs-navigation"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span aria-hidden="true">{mobileNavOpen ? '×' : '☰'}</span>
          </button>
          <DocsSearch />
          <ColorSchemeMenu className="docs-color-scheme-menu" />
        </div>
        <div className="docs-content" ref={content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
