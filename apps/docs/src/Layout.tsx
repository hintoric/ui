import { useEffect, useRef, useState, type SVGProps } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ColorSchemeMenu,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  ModalDialog,
  ReducedMotionProvider,
  Switch,
  Typography,
  useColorScheme,
} from '@hintoric/ui';
import { NAV } from './nav';
import { DocsSearch } from './search/DocsSearch.tsx';
import { applyHeadingIds, scrollToAnchor } from './search/anchors.ts';

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14.01 2h-4a.49.49 0 0 0-.49.42L9.15 5.07c-.61.24-1.18.56-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.13.22.39.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.37 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.37-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.22.08.48 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12.01 15.5A3.5 3.5 0 1 1 12.01 8a3.5 3.5 0 0 1 0 7.5Z" />
    </svg>
  );
}

export function Layout() {
  // resolvedMode, not mode: mode can now be 'system', which would fall
  // through to the black logo on a dark background.
  const { resolvedMode } = useColorScheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const content = useRef<HTMLDivElement>(null);

  // After the page has rendered, not before: the headings the ids go on are
  // the outlet's children, and the hash cannot be jumped to until they exist.
  useEffect(() => {
    if (content.current) applyHeadingIds(content.current);
    scrollToAnchor(hash);
  }, [pathname, hash]);

  return (
    <ReducedMotionProvider reducedMotion={reducedMotion}>
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
            <DocsSearch />
            <IconButton
              aria-label="Settings"
              title="Settings"
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon className="size-5" />
            </IconButton>
            <ColorSchemeMenu />
            <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
              <ModalDialog size="sm" data-testid="docs-settings-dialog">
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Typography level="title-sm">Reduced motion</Typography>
                      <Typography level="body-sm" className="text-ink-tertiary">
                        Disable decorative animations in the docs preview.
                      </Typography>
                    </div>
                    <Switch
                      aria-label="Reduced motion"
                      checked={reducedMotion}
                      onCheckedChange={setReducedMotion}
                    />
                  </div>
                </DialogContent>
              </ModalDialog>
            </Modal>
          </div>
          <div className="docs-content" ref={content}>
            <Outlet />
          </div>
        </div>
      </div>
    </ReducedMotionProvider>
  );
}
