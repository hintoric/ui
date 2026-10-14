import { useEffect, useState } from 'react';
import { useColorScheme } from '@hintoric/ui';
import { AuthCodeEmail, authCodeMessagesDe, authCodeMessagesEn, renderEmail, type AuthCodePurpose } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { EmailPreview } from '../../components/EmailPreview';
import { PropsTable } from '../../components/PropsTable';
import { SegmentedToggle } from '../../components/SegmentedToggle';

const shared = {
  code: '482915',
  email: 'max@muster.de',
  expiresInMinutes: 60,
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

// Only verification comes with a link: Kratos' verification URL carries the
// code. The other three flows send the code alone.
const VERIFICATION_URL = 'https://auth.example.com/self-service/verification?flow=1&code=482915';

export function AuthCodePage() {
  const { resolvedMode } = useColorScheme();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [purpose, setPurpose] = useState<AuthCodePurpose>('verification');
  const [html, setHtml] = useState('');

  useEffect(() => {
    let current = true;
    renderEmail(
      <AuthCodeEmail
        {...shared}
        purpose={purpose}
        url={purpose === 'verification' ? VERIFICATION_URL : undefined}
        messages={lang === 'de' ? authCodeMessagesDe : authCodeMessagesEn}
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
      <h1>Auth code</h1>
      <p className="docs-lede">
        A one-time code from a sign-in flow: confirming an address, creating an account, signing in, recovering
        an account. One template for Kratos&rsquo; four code mails. The heading names the flow, the code sits in
        its own box, large and in one piece, and when the flow has a link that does the same — verification
        does — a button follows.
      </p>

      <h2>Preview</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <SegmentedToggle<AuthCodePurpose>
            aria-label="Flow"
            value={purpose}
            options={[
              { value: 'verification', label: 'Verification' },
              { value: 'registration', label: 'Registration' },
              { value: 'login', label: 'Login' },
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
        {html && <EmailPreview key={html} html={html} title="Auth code preview" height={760} />}
      </Demo>

      <h2>Sending</h2>
      <p>
        From Kratos&rsquo; HTTP courier: <code>template_type</code> picks the purpose, <code>template_data</code>{' '}
        carries the code and, for verification, the URL. Kratos doesn&rsquo;t pass how long the code lasts, so{' '}
        <code>expiresInMinutes</code> is the flow&rsquo;s configured lifespan. Codes for an address without an
        account are the <a href="/email/templates/auth-no-account">auth no-account</a> mail.
      </p>
      <Code>{`import { renderAuthCode, authCodeMessagesDe } from '@hintoric/email';

// verification_code.valid
const { subject, html, text } = await renderAuthCode({
  purpose: 'verification',
  code: data.verification_code,
  url: data.verification_url,
  email: data.to,
  expiresInMinutes: 60,
  messages: authCodeMessagesDe,
});

await mailer.send({ to: data.to, subject, html, text });`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'purpose',
            type: "'verification' | 'registration' | 'login' | 'recovery'",
            description: 'The flow. Picks heading and subject; login and recovery also say not to pass the code on.',
          },
          { name: 'code', type: 'string', description: 'The one-time code, shown as it is.' },
          { name: 'email', type: 'string', description: 'Optional. The address the code was sent to, named in the intro.' },
          { name: 'url', type: 'string', description: 'Optional link that does what the code does. Adds a button; unsafe schemes are dropped.' },
          { name: 'expiresInMinutes', type: 'number', description: 'Optional line under the code.' },
          {
            name: 'messages',
            type: 'AuthCodeMessages',
            description: 'Every string. Pass authCodeMessagesDe / …En or spread one and override.',
          },
          { name: 'legalNotice', type: 'string', description: 'Optional line under the footer.' },
          { name: 'colorScheme', type: "'light' | 'dark'", description: 'Forces a scheme. Previews only.' },
        ]}
      />
    </>
  );
}
