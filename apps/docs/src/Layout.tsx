import { NavLink, Outlet } from 'react-router-dom';
import { useColorScheme } from '@hintoric/ui';
import { NAV } from './nav';

export function Layout() {
  const { mode, setMode } = useColorScheme();

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <NavLink to="/" className="docs-sidebar-brand">
          <img src="https://cdn.hintoric.com/assets/logo/black.svg" alt="" className="docs-sidebar-logo" />
          @hintoric/ui
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
          <button
            type="button"
            className="docs-toggle"
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          >
            {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <div className="docs-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
