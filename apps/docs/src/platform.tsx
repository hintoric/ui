import { useLocation, useNavigate } from 'react-router-dom';
import { SegmentedToggle } from './components/SegmentedToggle';
import { counterpartPath, isEmailPath, isIconsPath } from './nav';

/*
 * The docs' global Web / E-Mail switch. The two are separate sections — the
 * web docs, and everything under /email — so the side the reader is on is
 * simply the URL: a shared /email/... link opens the email docs, and there is
 * no stored state to disagree with it. Switching jumps to the counterpart
 * page where one exists (/button ↔ /email/button), otherwise to the other
 * side's overview. Icons is a third side with nothing to map onto: it always
 * opens the gallery, and leaving it opens the chosen side's overview.
 */

export type Platform = 'web' | 'email' | 'icons';

function platformOf(pathname: string): Platform {
  if (isIconsPath(pathname)) return 'icons';
  return isEmailPath(pathname) ? 'email' : 'web';
}

export function usePlatform(): Platform {
  return platformOf(useLocation().pathname);
}

export function PlatformToggle() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const platform = platformOf(pathname);
  return (
    <SegmentedToggle<Platform>
      aria-label="Platform"
      value={platform}
      options={[
        { value: 'web', label: 'Web' },
        { value: 'email', label: 'E-Mail' },
        { value: 'icons', label: 'Icons' },
      ]}
      onChange={(next) => {
        if (next === 'icons') navigate('/icons');
        else if (platform === 'icons') navigate(next === 'email' ? '/email' : '/');
        else navigate(counterpartPath(pathname));
      }}
    />
  );
}
