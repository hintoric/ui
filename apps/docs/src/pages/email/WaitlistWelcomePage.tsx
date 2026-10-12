import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from '@hintoric/ui';
import { WaitlistWelcomeEmail, renderEmail, waitlistWelcomeMessagesDe, waitlistWelcomeMessagesEn } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { SegmentedToggle } from '../../components/SegmentedToggle';

const shared = {
  websiteUrl: 'https://hintoric.com',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

/** Written with document.write, not `srcDoc` — see SecurityActivityAlertPage. */
function EmailPreview({ html }: { html: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);
  return (
    <iframe
      ref={frame}
      title="Waitlist welcome preview"
      sandbox="allow-same-origin"
      style={{ width: '100%', height: 720, border: 0, display: 'block' }}
    />
  );
}

export function WaitlistWelcomePage() {
  const { resolvedMode } = useColorScheme();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [html, setHtml] = useState('');

  useEffect(() => {
    let current = true;
    renderEmail(
      <WaitlistWelcomeEmail
        {...shared}
        messages={lang === 'de' ? waitlistWelcomeMessagesDe : waitlistWelcomeMessagesEn}
        colorScheme={resolvedMode}
      />,
    ).then((rendered) => {
      if (current) setHtml(rendered.html);
    });
    return () => {
      current = false;
    };
  }, [lang, resolvedMode]);

  return (
    <>
      <h1>
        Waitlist welcome <span className="docs-badge-deprecated">Deprecated</span>
      </h1>
      <p className="docs-lede">
        Sent right after someone joins a waitlist: a thank-you, what happens next, and one button to your
        website. <strong>Deprecated:</strong> new consumers should not use this template.
      </p>

      <h2>Preview</h2>
      <Demo>
        <div style={{ marginBottom: 16 }}>
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
        {html && <EmailPreview key={html} html={html} />}
      </Demo>

      <h2>Sending</h2>
      <Code>{`import { renderWaitlistWelcome, waitlistWelcomeMessagesDe } from '@hintoric/email';

const { subject, html, text } = await renderWaitlistWelcome({
  messages: waitlistWelcomeMessagesDe,
  websiteUrl: 'https://hintoric.com',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg', // optional
  unsubscribeUrl: 'https://hintoric.com/unsubscribe?token=…', // optional
});

await mailer.send({ to: entry.email, subject, html, text });`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'messages',
            type: 'WaitlistWelcomeMessages',
            description: 'Every string, including the subject. Pass waitlistWelcomeMessagesDe / …En or spread one and override.',
          },
          { name: 'websiteUrl', type: 'string', description: 'Behind the button. Unsafe schemes are dropped.' },
          { name: 'legalNotice', type: 'string', description: 'Optional line under the footer.' },
          { name: 'unsubscribeUrl', type: 'string', description: 'Optional. Adds an unsubscribe link (label: messages.unsubscribe) as the last footer line.' },
          { name: 'colorScheme', type: "'light' | 'dark'", description: 'Forces a scheme. Previews only.' },
        ]}
      />
    </>
  );
}
