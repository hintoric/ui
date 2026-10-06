import { useState } from 'react';
import { AccountMenu, MenuItem } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const LOCALES = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en-US', label: 'English' },
];

export function AccountMenuPage() {
  const [locale, setLocale] = useState('de-DE');
  const [signedOut, setSignedOut] = useState(0);

  return (
    <>
      <h1>AccountMenu</h1>
      <p className="docs-lede">
        The signed-in person in one pill — avatar and menu button — with a card, appearance and
        language as sub-views, your own items and sign-out.
      </p>

      <Demo>
        <AccountMenu
          user={{ email: 'erika.mustermann@example.com' }}
          subtitle="Muster & Söhne GmbH"
          locales={LOCALES}
          locale={locale}
          onLocaleChange={setLocale}
          items={<MenuItem>Layouts</MenuItem>}
          onSignOut={() => setSignedOut((count) => count + 1)}
        />
      </Demo>
      {signedOut > 0 && <p>Sign out clicked {signedOut}×.</p>}
      <Code>{`<AccountMenu
  user={{ email: session.email }}
  subtitle={workspace.name}
  locales={LOCALES}
  locale={locale}
  onLocaleChange={setLocale}
  items={<MenuItem onClick={() => navigate('/settings/layouts')}>Layouts</MenuItem>}
  onSignOut={signOut}
/>`}</Code>

      <h2>Sub-views stay in the menu</h2>
      <p>
        &ldquo;Appearance&rdquo; and &ldquo;Language&rdquo; show their current value. A click
        swaps the popup&apos;s contents for the choices and a row back; a choice returns to the top,
        where the new value is the confirmation. Focus follows each swap, so the arrow keys keep
        working. Your own <code>items</code> and sign-out close the menu as usual, and the next
        opening starts at the top.
      </p>
      <p>
        The building block is <code>closeOnClick</code> on <code>MenuItem</code> (and on{' '}
        <code>ColorSchemeMenuItems</code>): an item with <code>closeOnClick={'{false}'}</code>{' '}
        leaves the menu open, so a menu of your own can drill down with nothing more than a{' '}
        <code>useState</code>.
      </p>

      <h2>No session, no routes, no i18n</h2>
      <p>
        Everything comes in through props, so applications that share no code show the same menu.
        Labels default to English and are overridden one by one. Without <code>locales</code> — and
        without a <code>LocaleProvider</code> to supply them — there is no language row. A
        signed-out visitor is yours to handle: there is nobody to show.
      </p>
      <Code>{`<AccountMenu
  user={{ email }}
  labels={{
    menu: 'Konto',
    appearance: 'Darstellung',
    language: 'Sprache',
    back: 'zurück',
    signOut: 'Abmelden',
    colorScheme: { system: 'System', light: 'Hell', dark: 'Dunkel' },
  }}
  onSignOut={signOut}
/>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'user', type: '{ email: string; name?: string; avatarSrc?: string }', description: 'Who is signed in. The avatar shows the first letter of the name, else of the address.' },
          { name: 'subtitle', type: 'ReactNode', description: 'Second line of the card — a workspace, a tenant.' },
          { name: 'labels', type: 'AccountMenuLabels', description: 'menu, appearance, language, back, signOut and colorScheme; English by default.' },
          { name: 'onSignOut', type: '() => void', description: 'Adds the sign-out row. Without it there is none.' },
          { name: 'signingOut', type: 'boolean', default: 'false', description: 'Disables the sign-out row while a sign-out is under way.' },
          { name: 'items', type: 'ReactNode', description: 'Your own MenuItems, between the settings and sign-out.' },
          { name: 'appearance', type: 'boolean', default: 'true', description: 'Offers the appearance view. Needs a ColorSchemeProvider above.' },
          { name: 'locales / locale / onLocaleChange', type: 'LocaleOption[] / string / (locale) => void', description: 'The language view. Each falls back to an enclosing LocaleProvider.' },
          { name: 'flags', type: 'boolean', default: 'true', description: 'Flags beside the languages, as in LocaleSwitcher.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the pill.' },
          { name: '…FloatingBar props', type: 'FloatingBarProps', description: 'placement, align, variant, className and the rest go to the pill.' },
        ]}
      />
    </>
  );
}
