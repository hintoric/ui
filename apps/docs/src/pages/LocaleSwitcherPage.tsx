import { useState } from 'react';
import { LocaleSwitcher } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const LOCALES = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

export function LocaleSwitcherPage() {
  const [basic, setBasic] = useState('de');
  const [sizes, setSizes] = useState('en');
  const [unknown, setUnknown] = useState('pt');

  return (
    <>
      <h1>LocaleSwitcher</h1>
      <p className="docs-lede">
        A compact control for the display language, sized for a header corner.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <LocaleSwitcher
          locales={LOCALES}
          value={basic}
          onChange={setBasic}
          aria-label="Choose language"
        />
      </Demo>
      <Code>{`const [locale, setLocale] = useState('de');

<LocaleSwitcher
  locales={[
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
  ]}
  value={locale}
  onChange={setLocale}
  aria-label="Choose language"
/>`}</Code>

      <h2>It knows no i18n library</h2>
      <p>
        <code>LocaleSwitcher</code> takes <code>locales</code>, <code>value</code> and{' '}
        <code>onChange</code> — nothing else. It does not import i18next, react-intl or any
        language context, because knowing one would push that dependency onto every application
        using this library.
      </p>
      <p>
        The language names come from you, which is why it never has to decide between
        &ldquo;Deutsch&rdquo;, &ldquo;German&rdquo; and &ldquo;DE&rdquo;. Naming each language in
        its own language is the usual choice: a list that says &ldquo;German&rdquo; is no help to
        someone who does not read English.
      </p>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LocaleSwitcher locales={LOCALES} value={sizes} onChange={setSizes} size="sm" />
          <LocaleSwitcher locales={LOCALES} value={sizes} onChange={setSizes} size="md" />
          <LocaleSwitcher locales={LOCALES} value={sizes} onChange={setSizes} size="lg" />
        </div>
      </Demo>

      <h2>A value you do not offer</h2>
      <p>
        A browser can report a language the application does not have. Rather than render an empty
        button, the raw value is shown — here <code>pt</code>, which is not in the list.
      </p>
      <Demo>
        <LocaleSwitcher locales={LOCALES} value={unknown} onChange={setUnknown} />
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'locales',
            type: 'readonly LocaleOption[]',
            description: 'The languages on offer. Each carries a value and a label.',
          },
          {
            name: 'value',
            type: 'string',
            description:
              'The current language. A value absent from locales renders as itself rather than blank.',
          },
          {
            name: 'onChange',
            type: '(value: string) => void',
            description: 'Called with the chosen value — never with the label.',
          },
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outlined' | 'plain'",
            default: "'plain'",
            description: 'Borderless by default, since the usual home is a header corner.',
          },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'neutral'",
            description: 'Applied to the button and the menu alike.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'sm'",
            description: 'Passed through to the button and the menu.',
          },
          {
            name: 'aria-label',
            type: 'string',
            description:
              'Names the control for assistive technology. Worth setting: the button reads as the current language alone.',
          },
        ]}
      />
    </>
  );
}
