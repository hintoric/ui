import { useEffect, useState } from 'react';
import { useColorScheme } from '@hintoric/ui';
import { AuthNoAccountEmail, authNoAccountMessagesDe, authNoAccountMessagesEn, renderEmail, type AuthNoAccountPurpose } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { EmailPreview } from '../../components/EmailPreview';
import { PropsTable } from '../../components/PropsTable';
import { SegmentedToggle } from '../../components/SegmentedToggle';

const shared = {
  email: 'max@muster.de',
  registrationUrl: 'https://app.example.com/auth/registration',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

export function AuthNoAccountPage() {
  const { resolvedMode } = useColorScheme();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [purpose, setPurpose] = useState<AuthNoAccountPurpose>('recovery');
  const [html, setHtml] = useState('');

  useEffect(() => {
    let current = true;
    renderEmail(
      <AuthNoAccountEmail
        {...shared}
        purpose={purpose}
        messages={lang === 'de' ? authNoAccountMessagesDe : authNoAccountMessagesEn}
        colorScheme={resolvedMode}
      />,
    ).then((rendered) => {
      if (current) setHtml(rendered.html);
    });
    return () => {
      current = false;
    };
  }, [lang, purpose, resolvedMode]);

  return (
    <>
      <h1>Auth no-account</h1>
      <p className="docs-lede">
        The answer to a code request for an address without an account — Kratos&rsquo;{' '}
        <code>verification_code.invalid</code> and <code>recovery_code.invalid</code>. Saying &ldquo;no such
        account&rdquo; on screen would tell anyone which addresses have one; this mail tells only the
        address&rsquo;s owner. No code, the likely mix-up, and optionally a way to create the account.
      </p>

      <h2>Preview</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <SegmentedToggle<AuthNoAccountPurpose>
            aria-label="Flow"
            value={purpose}
            options={[
              { value: 'recovery', label: 'Recovery' },
              { value: 'verification', label: 'Verification' },
            ]}
            onChange={setPurpose}
          />
          <SegmentedToggle<'de' | 'en'>
            aria-label="Language"
            value={lang}
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'English' },
            ]}
            onChange={setLang}
          />
        </div>
        {html && <EmailPreview key={html} html={html} title="Auth no-account preview" />}
      </Demo>

      <h2>Sending</h2>
      <Code>{`import { renderAuthNoAccount, authNoAccountMessagesDe } from '@hintoric/email';

// recovery_code.invalid
const { subject, html, text } = await renderAuthNoAccount({
  purpose: 'recovery',
  email: data.to,
  registrationUrl: 'https://app.example.com/auth/registration',
  messages: authNoAccountMessagesDe,
});`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'purpose', type: "'verification' | 'recovery'", description: 'What was attempted.' },
          { name: 'email', type: 'string', description: 'The address that was entered — the one the mail goes to.' },
          { name: 'registrationUrl', type: 'string', description: 'Optional. Adds a button to create an account; unsafe schemes are dropped.' },
          {
            name: 'messages',
            type: 'AuthNoAccountMessages',
            description: 'Every string. Pass authNoAccountMessagesDe / …En or spread one and override.',
          },
          { name: 'legalNotice', type: 'string', description: 'Optional line under the footer.' },
          { name: 'colorScheme', type: "'light' | 'dark'", description: 'Forces a scheme. Previews only.' },
        ]}
      />
    </>
  );
}
