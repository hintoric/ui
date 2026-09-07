import { useState } from 'react';
import { LocaleSwitcher } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const LOCALES = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en-US', label: 'English' },
  { value: 'fr-FR', label: 'Français' },
];

// A mix on purpose: one tag that carries its own country, one that has none to
// carry, and one that needs to be told.
const MIXED_LOCALES = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português', region: 'PT' },
];

export function LocaleSwitcherPage() {
  const [basic, setBasic] = useState('de-DE');
  const [sizes, setSizes] = useState('en-GB');
  const [unknown, setUnknown] = useState('pt');
  const [mixed, setMixed] = useState('de-DE');
  const [noFlags, setNoFlags] = useState('de-DE');

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
      <Code>{`const [locale, setLocale] = useState('de-DE');

<LocaleSwitcher
  locales={[
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'en-US', label: 'English' },
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

      <h2>Flags</h2>
      <p>
        A flag needs a country, and a language is not one. <code>de-DE</code> carries its country
        in the tag itself and gets a flag from it; a bare <code>en</code> has none to carry — and
        deliberately so, since English belongs to no single country — and gets none. Where a tag
        has no region but you still want a flag, name it with <code>region</code>.
      </p>
      <Demo>
        <LocaleSwitcher locales={MIXED_LOCALES} value={mixed} onChange={setMixed} aria-label="Language" />
      </Demo>
      <Code>{`<LocaleSwitcher
  locales={[
    { value: 'de-DE', label: 'Deutsch' },          // flag from the region subtag
    { value: 'en', label: 'English' },             // no country, no flag
    { value: 'pt', label: 'Português', region: 'PT' }, // country named explicitly
  ]}
  value={locale}
  onChange={setLocale}
/>`}</Code>
      <p>
        The flags are SVGs from <code>country-flag-icons</code>, not emoji — Windows renders emoji
        flags as a pair of letters. The package stays external rather than bundled, so it only
        reaches applications that actually render a switcher.
      </p>

      <h2>Turning flags off</h2>
      <Demo>
        <LocaleSwitcher
          locales={LOCALES}
          value={noFlags}
          onChange={setNoFlags}
          flags={false}
          aria-label="Language, no flags"
        />
      </Demo>
      <Code>{`<LocaleSwitcher locales={LOCALES} value={locale} onChange={setLocale} flags={false} />`}</Code>

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
            description:
              'The languages on offer. Each carries a value, a label and optionally a region for its flag.',
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
            default: "'outlined'",
            description: 'Bordered by default, so the control reads as a control.',
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
            name: 'flags',
            type: 'boolean',
            default: 'true',
            description:
              'Show a country flag beside each label, where a country can be determined. false drops them everywhere.',
          },
          {
            name: '…button props',
            type: "React.ComponentProps<'button'>",
            description:
              'Anything else — className, data attributes, event handlers — is forwarded to the trigger button.',
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
