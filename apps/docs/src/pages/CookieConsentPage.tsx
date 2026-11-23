import { Button, CookieConsent, CookieConsentProvider, useCookieConsent } from '@hintoric/ui';
import type { ConsentCategory } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const demoCategories: ConsentCategory[] = [
  { id: 'necessary', label: 'Necessary', description: 'Keep you signed in and the site secure.', required: true },
  { id: 'statistics', label: 'Statistics', description: 'Measure how the site is used.' },
  { id: 'marketing', label: 'Advertising', description: 'Show you matching ads on other sites.' },
];

function DemoState() {
  const { consent, openSettings } = useCookieConsent();
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outlined" color="neutral" onClick={openSettings}>
        Cookie settings
      </Button>
      <code>{consent ? JSON.stringify(consent.choices) : 'undecided'}</code>
    </div>
  );
}

export function CookieConsentPage() {
  return (
    <>
      <h1>CookieConsent</h1>
      <p className="docs-lede">
        A banner and a settings dialog that ask before anything beyond the necessary is loaded, with the hooks
        to wait for the answer. The choice is kept in a first-party cookie, so your server can read it too.
      </p>

      <h2>Demo</h2>
      <p>
        This demo uses its own cookie (<code>docs_consent_demo</code>). Decide once and the banner is gone;
        the button brings the settings back.
      </p>
      <Demo>
        <CookieConsentProvider
          categories={demoCategories}
          version="1"
          cookieName="docs_consent_demo"
          reloadOnWithdraw={false}
        >
          <DemoState />
          <CookieConsent privacyHref="#privacy" />
        </CookieConsentProvider>
      </Demo>

      <h2>Usage</h2>
      <p>
        Wrap the app in a <code>CookieConsentProvider</code> and put <code>&lt;CookieConsent /&gt;</code> early in
        the tree, so the banner comes before the page content in the tab order. The banner does not trap focus
        and has no backdrop. Settings stay reachable through a link of your own, typically in the footer.
      </p>
      <Code>{`import { CookieConsent, CookieConsentProvider, useCookieConsent } from '@hintoric/ui';

const categories = [
  { id: 'necessary', label: 'Necessary', required: true },
  { id: 'statistics', label: 'Statistics', description: 'Measure how the site is used.' },
];

export function App() {
  return (
    <CookieConsentProvider categories={categories} version="1">
      <CookieConsent privacyHref="/privacy" />
      <Page />
      <Footer />
    </CookieConsentProvider>
  );
}

function Footer() {
  const { openSettings } = useCookieConsent();
  return <button onClick={openSettings}>Cookie settings</button>;
}`}</Code>
      <p>
        Exactly one category must be <code>required</code>; it is always on and cannot be switched off. Every
        other category starts off. Reject and allow always look the same, and the banner cannot be dismissed
        without a choice.
      </p>

      <h2>German setup</h2>
      <p>The library ships English defaults. For German, pass these labels and categories:</p>
      <Code>{`const labels = {
  bannerTitle: 'Cookies erlauben?',
  bannerText: 'Einige Cookies sind für die Seite nötig. Alle anderen werden nur mit deiner Zustimmung gesetzt.',
  reject: 'Ablehnen',
  accept: 'Erlauben',
  customize: 'Einzeln auswählen',
  settingsTitle: 'Cookies auswählen',
  settingsText: 'Deine Auswahl kannst du jederzeit ändern.',
  alwaysOn: 'Immer an',
  save: 'Auswahl speichern',
  acceptAll: 'Alle erlauben',
  privacy: 'Datenschutzerklärung',
  close: 'Schließen',
};

const categories = [
  { id: 'necessary', label: 'Notwendig', description: 'Halten dich angemeldet und die Seite sicher.', required: true },
  { id: 'statistics', label: 'Statistik', description: 'Messen, wie die Seite genutzt wird.' },
  { id: 'marketing', label: 'Werbung', description: 'Zeigen dir auf anderen Seiten passende Anzeigen.' },
];

<CookieConsent labels={labels} privacyHref="/datenschutz" />`}</Code>

      <h2>Loading a script only after consent</h2>
      <p>
        <code>ConsentGate</code> renders its children only when the category is allowed; <code>useConsent</code>{' '}
        answers the same question in code. Undecided means no.
      </p>
      <Code>{`<ConsentGate category="statistics">
  <AnalyticsScript />
</ConsentGate>

const allowed = useConsent('marketing');`}</Code>

      <h2>Google Consent Mode</h2>
      <p>
        The library knows no tracking tool, so translate the choice yourself. Two things matter. Deny everything
        before the Google tag loads, or the tag acts as if it had consent until someone decides. And apply the
        stored choice on every page load, not only in <code>onChange</code>, which runs when someone decides and
        never when a page opens.
      </p>
      <Code>{`// In <head>, before the Google tag:
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
});

// Anywhere inside the provider: on every load and after every change.
function ConsentMode() {
  const { consent } = useCookieConsent();
  useEffect(() => {
    if (!consent) return;
    gtag('consent', 'update', {
      analytics_storage: consent.choices.statistics ? 'granted' : 'denied',
      ad_storage: consent.choices.marketing ? 'granted' : 'denied',
      ad_user_data: consent.choices.marketing ? 'granted' : 'denied',
      ad_personalization: consent.choices.marketing ? 'granted' : 'denied',
    });
  }, [consent]);
  return null;
}`}</Code>

      <h2>Reporting to your server</h2>
      <p>
        When a category is withdrawn, the page reloads right after <code>onChange</code> returns, because a
        script that already runs cannot be stopped. <code>onChange</code> is synchronous and nothing waits for
        it, so use a request that survives the reload:
      </p>
      <Code>{`onChange={(next, previous) => {
  fetch('/api/consent', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ next, previous }),
  });
}}`}</Code>

      <h2>Next.js App Router</h2>
      <p>
        Server components cannot import <code>@hintoric/ui</code>. Read the raw cookie on the server and hand it
        to a client wrapper of your own; the banner is then already in the HTML when it is needed, and never
        flashes for someone who has decided.
      </p>
      <Code>{`// app/layout.tsx (server component)
import { cookies } from 'next/headers';
import { Consent } from './Consent';

export default async function RootLayout({ children }) {
  const initialCookie = (await cookies()).get('hintoric_consent')?.value ?? null;
  return <Consent initialCookie={initialCookie}>{children}</Consent>;
}

// app/Consent.tsx
'use client';
import { CookieConsent, CookieConsentProvider } from '@hintoric/ui';

export function Consent({ initialCookie, children }) {
  return (
    <CookieConsentProvider categories={categories} version="1" initialCookie={initialCookie}>
      <CookieConsent />
      {children}
    </CookieConsentProvider>
  );
}`}</Code>
      <p>
        Whether a choice has expired is decided by the clock of whoever reads it. If a visitor&apos;s clock is
        off by more than a day, server and browser can disagree, and React renders the page again in the
        browser.
      </p>

      <h2>Asking again</h2>
      <p>
        Raise <code>version</code> when you add a category or change what one is for: a choice made under
        another version counts as undecided. A choice also expires after <code>maxAgeDays</code> (180), counted
        from when it was made.
      </p>

      <h2>CookieConsentProvider props</h2>
      <PropsTable
        rows={[
          { name: 'categories', type: 'ConsentCategory[]', description: 'What can be allowed. Exactly one is required.' },
          { name: 'version', type: 'string', description: 'Raise it to ask again.' },
          { name: 'cookieName', type: 'string', default: "'hintoric_consent'", description: 'The cookie that stores the choice.' },
          { name: 'cookieDomain', type: 'string', description: 'Sets the cookie for a parent domain.' },
          { name: 'maxAgeDays', type: 'number', default: '180', description: 'How long a choice counts, from when it was made.' },
          { name: 'initialCookie', type: 'string | null', description: 'Server rendering: the raw cookie value, or null when the request had none.' },
          { name: 'onChange', type: '(next, previous) => void', description: 'After every stored decision. Synchronous.' },
          { name: 'reloadOnWithdraw', type: 'boolean', default: 'true', description: 'Reload when a category goes from allowed to off.' },
        ]}
      />

      <h2>CookieConsent props</h2>
      <PropsTable
        rows={[
          { name: 'labels', type: 'CookieConsentLabels', description: 'Overrides single texts; the rest stay English.' },
          { name: 'privacyHref', type: 'string', description: 'Links the privacy policy from the banner and the dialog.' },
        ]}
      />
    </>
  );
}
