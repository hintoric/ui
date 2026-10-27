'use client';
import * as React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Link } from '../Link';
import { Typography } from '../Typography';
import { useCookieConsentState } from '../../theme/CookieConsentProvider';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { cx } from '../../utils/cx';
import { resolveCookieConsentLabels } from './labels';
import { CookieSettingsDialog } from './CookieSettingsDialog';
import type { CookieConsentProps } from './types';

export function CookieConsent({ labels: labelsProp, privacyHref }: CookieConsentProps) {
  const { known, consent, settingsOpen } = useCookieConsentState();
  const labels = resolveCookieConsentLabels(labelsProp);

  if (!known) return null;
  return (
    <>
      {consent === null && !settingsOpen && <Banner labels={labels} privacyHref={privacyHref} />}
      <CookieSettingsDialog labels={labels} privacyHref={privacyHref} />
    </>
  );
}

interface BannerProps {
  labels: ReturnType<typeof resolveCookieConsentLabels>;
  privacyHref?: string;
}

function Banner({ labels, privacyHref }: BannerProps) {
  const { acceptAll, rejectAll, openSettings } = useCookieConsentState();
  const reducedMotion = useReducedMotion();
  const titleId = React.useId();

  return (
    // Not a dialog: no backdrop, no focus trap, no Escape. Whoever ignores it
    // can keep reading, only without what needs consent.
    <Card
      component="section"
      aria-labelledby={titleId}
      className={cx(
        // Capped at the screen and scrollable, so a phone held sideways or a
        // 400 % zoom still reaches every button instead of losing the title.
        'fixed inset-x-0 bottom-0 z-40 max-h-dvh gap-4 overflow-y-auto rounded-t-[12px] rounded-b-none p-6 pb-8 shadow-lg',
        'sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-h-[calc(100dvh-48px)] sm:w-[440px] sm:max-w-[calc(100vw-48px)] sm:rounded-[12px] sm:pb-6',
        !reducedMotion && 'animate-consent-in',
      )}
    >
      <div className="flex flex-col gap-2">
        <Typography id={titleId} component="h2" level="title-lg">
          {labels.bannerTitle}
        </Typography>
        <Typography level="body-md" className="text-ink-secondary">
          {labels.bannerText}
        </Typography>
        {privacyHref && (
          <Link href={privacyHref} className="self-start text-sm">
            {labels.privacy}
          </Link>
        )}
      </div>
      {/* Reject comes first in the DOM on every width; on a phone CSS lifts
          Allow to the top, as the design shows. */}
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
        <Button variant="solid" color="primary" size="lg" onClick={rejectAll}>
          {labels.reject}
        </Button>
        <Button variant="solid" color="primary" size="lg" onClick={acceptAll} className="order-first sm:order-none">
          {labels.accept}
        </Button>
        <Button variant="plain" color="primary" size="lg" onClick={openSettings} className="sm:col-span-2 sm:justify-self-center">
          {labels.customize}
        </Button>
      </div>
    </Card>
  );
}
