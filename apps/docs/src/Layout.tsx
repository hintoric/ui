import { NavLink, Outlet } from 'react-router-dom';
import { IconButton, useColorScheme } from '@hintoric/ui';
import { NAV } from './nav';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Layout() {
  const { mode, setMode } = useColorScheme();

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <NavLink to="/" className="docs-sidebar-brand">
          <img
            src={`https://cdn.hintoric.com/assets/logo/ui/${mode === 'dark' ? 'white' : 'black'}.svg`}
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
          <IconButton
            variant="outlined"
            color="neutral"
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          >
            {mode === 'light' ? <MoonIcon /> : <SunIcon />}
          </IconButton>
        </div>
        <div className="docs-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
