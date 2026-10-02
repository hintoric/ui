import { useLocation, useNavigate } from 'react-router-dom';
import { SegmentedToggle } from './components/SegmentedToggle';
import { counterpartPath, isEmailPath } from './nav';

/*
 * The docs' global Web / E-Mail switch. The two are separate sections — the
 * web docs, and everything under /email — so the side the reader is on is
 * simply the URL: a shared /email/... link opens the email docs, and there is
 * no stored state to disagree with it. Switching jumps to the counterpart
 * page where one exists (/button ↔ /email/button), otherwise to the other
 * side's overview.
 */

export type Platform = 'web' | 'email';

export function usePlatform(): Platform {
  return isEmailPath(useLocation().pathname) ? 'email' : 'web';
}

export function PlatformToggle() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const platform: Platform = isEmailPath(pathname) ? 'email' : 'web';
  return (
    <SegmentedToggle<Platform>
      aria-label="Platform"
      value={platform}
      options={[
        { value: 'web', label: 'Web' },
        { value: 'email', label: 'E-Mail' },
      ]}
      onChange={() => navigate(counterpartPath(pathname))}
    />
  );
}
