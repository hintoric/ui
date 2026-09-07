import { NavLink, Outlet } from 'react-router-dom';
import { ColorSchemeMenu, useColorScheme } from '@hintoric/ui';
import { NAV } from './nav';

export function Layout() {
  // resolvedMode, not mode: mode can now be 'system', which would fall
  // through to the black logo on a dark background.
  const { resolvedMode } = useColorScheme();

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
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
      <div className="docs-main">
        <div className="docs-topbar">
          <ColorSchemeMenu />
        </div>
        <div className="docs-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
