import { useState } from 'react';
import { LocaleProvider, LocaleSwitcher, RelativeTime, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const LOCALES = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en-US', label: 'English' },
  { value: 'fr-FR', label: 'Français' },
];

const THREE_DAYS_AGO = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

export function LocaleProviderPage() {
  const [locale, setLocale] = useState('de-DE');

  return (
    <>
      <h1>LocaleProvider</h1>
      <p className="docs-lede">
        One source for the display language. <code>LocaleSwitcher</code> writes to it,{' '}
        <code>RelativeTime</code> reads from it, and neither needs the other to know it exists.
      </p>

      <h2>The switcher and the timestamp agree</h2>
      <Demo>
        <LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
          <LocaleSwitcher aria-label="Choose language" />
          <Typography level="body-sm">
            <RelativeTime date={THREE_DAYS_AGO} />
          </Typography>
        </LocaleProvider>
      </Demo>
      <Code>{`<LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
  <LocaleSwitcher />
  <RelativeTime date={threeDaysAgo} />
</LocaleProvider>`}</Code>

      <h2>It does not own the language</h2>
      <p>
        <code>locale</code> is a required prop and the provider only mirrors it. There is no state
        here, no <code>localStorage</code> and no browser-language detection — in a real application
        i18next already owns all three, and a second copy would drift apart the moment the language
        changes for a reason other than the switcher. Wiring the two together is one line:
      </p>
      <Code>{`<LocaleProvider
  locale={i18n.language}
  onLocaleChange={i18n.changeLanguage}
  locales={LOCALES}
>
  <App />
</LocaleProvider>`}</Code>
      <p>
        The library itself knows no i18n library, and never will — that choice belongs to the
        application, not to a presentation library.
      </p>

      <h2>Precedence</h2>
      <p>
        Date and time components resolve their language in this order, narrowest first. Nothing is
        ambiguous: a deliberate <code>DateTimeProvider</code> locale (&ldquo;the UI is English but
        dates are German&rdquo;) survives an app-wide language.
      </p>
      <Code>{`prop on the component  >  DateTimeProvider.locale  >  LocaleProvider.locale  >  runtime default`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'locale',
            type: 'string',
            description:
              'The current language. Required — the provider mirrors it rather than owning it.',
          },
          {
            name: 'onLocaleChange',
            type: '(locale: string) => void',
            description:
              'Called when a descendant changes the language. Omit it for a read-only source; a LocaleSwitcher below then needs its own onChange.',
          },
          {
            name: 'locales',
            type: 'readonly LocaleOption[]',
            description: 'The offered languages, so a LocaleSwitcher below needs no props at all.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Content that should know the language.',
          },
        ]}
      />

      <h2>useLocale()</h2>
      <p>
        Returns <code>{'{ locale, setLocale, locales }'}</code>. Must be called from inside a{' '}
        <code>LocaleProvider</code> — it throws otherwise. <code>setLocale</code> and{' '}
        <code>locales</code> are <code>undefined</code> when the provider was not given{' '}
        <code>onLocaleChange</code> or <code>locales</code>.
      </p>
    </>
  );
}
