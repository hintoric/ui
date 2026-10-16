import { useEffect, useState } from 'react';
import { useColorScheme } from '@hintoric/ui';
import { AuthLinkEmail, authLinkMessagesDe, authLinkMessagesEn, renderEmail, type AuthLinkPurpose } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { EmailPreview } from '../../components/EmailPreview';
import { PropsTable } from '../../components/PropsTable';
import { SegmentedToggle } from '../../components/SegmentedToggle';

const shared = {
  email: 'max@muster.de',
  expiresInMinutes: 60,
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

const URLS: Record<AuthLinkPurpose, string> = {
  verification: 'https://auth.example.com/self-service/verification?flow=1&token=abc',
  recovery: 'https://auth.example.com/self-service/recovery?flow=1&token=abc',
};

export function AuthLinkPage() {
  const { resolvedMode } = useColorScheme();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [purpose, setPurpose] = useState<AuthLinkPurpose>('verification');
  const [html, setHtml] = useState('');

  useEffect(() => {
    let current = true;
    renderEmail(
      <AuthLinkEmail
        {...shared}
        purpose={purpose}
        url={URLS[purpose]}
        messages={lang === 'de' ? authLinkMessagesDe : authLinkMessagesEn}
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
      <h1>Auth link</h1>
      <p className="docs-lede">
        A link from a sign-in flow that has no code: confirming an address or recovering an account. The
        counterpart of <a href="/email/templates/auth-code">auth code</a> for Kratos&rsquo; <code>link</code>{' '}
        method. The link is the whole mail, so the button is the one thing on it.
      </p>

      <h2>Preview</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <SegmentedToggle<AuthLinkPurpose>
            aria-label="Flow"
            value={purpose}
            options={[
              { value: 'verification', label: 'Verification' },
              { value: 'recovery', label: 'Recovery' },
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
        {html && <EmailPreview key={html} html={html} title="Auth link preview" height={620} />}
      </Demo>

      <h2>Sending</h2>
      <p>
        From Kratos&rsquo; HTTP courier: <code>template_type</code> is <code>verification_valid</code> or{' '}
        <code>recovery_valid</code>, and <code>template_data</code> carries the URL. Kratos doesn&rsquo;t pass how
        long the link lasts, so <code>expiresInMinutes</code> is the flow&rsquo;s configured lifespan. An address
        without an account is the <a href="/email/templates/auth-no-account">auth no-account</a> mail with{' '}
        <code>channel: &apos;link&apos;</code>.
      </p>
      <Code>{`import { renderAuthLink, authLinkMessagesDe } from '@hintoric/email';

// verification_valid
const { subject, html, text } = await renderAuthLink({
  purpose: 'verification',
  url: data.verification_url,
  email: data.to,
  expiresInMinutes: 60,
  messages: authLinkMessagesDe,
});

await mailer.send({ to: data.to, subject, html, text });`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'purpose',
            type: "'verification' | 'recovery'",
            description: 'The flow. Picks heading and subject; recovery also says not to pass the link on.',
          },
          { name: 'url', type: 'string', description: 'The link the flow sent. Unsafe schemes are dropped, which leaves the mail without a button.' },
          { name: 'email', type: 'string', description: 'Optional. The address the link was sent to, named in the intro.' },
          { name: 'expiresInMinutes', type: 'number', description: 'Optional line under the button.' },
          {
            name: 'messages',
            type: 'AuthLinkMessages',
            description: 'Every string. Pass authLinkMessagesDe / …En or spread one and override.',
          },
          { name: 'legalNotice', type: 'string', description: 'Optional line under the footer.' },
          { name: 'colorScheme', type: "'light' | 'dark'", description: 'Forces a scheme. Previews only.' },
        ]}
      />
    </>
  );
}
