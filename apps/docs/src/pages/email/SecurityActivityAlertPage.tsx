import { useEffect, useState } from 'react';
import { useColorScheme } from '@hintoric/ui';
import {
  SecurityActivityAlertEmail,
  renderEmail,
  securityActivityAlertMessagesDe,
  securityActivityAlertMessagesEn,
  type SecurityActivityAlertProps,
} from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { SegmentedToggle } from '../../components/SegmentedToggle';

type Example = Omit<SecurityActivityAlertProps, 'messages'>;

const shared = {
  reviewUrl: 'https://app.example.com/activity/4711',
  activityLogUrl: 'https://app.example.com/activity',
  timeZone: 'Europe/Berlin',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

const EXAMPLES: Record<'workspace' | 'account', Example> = {
  workspace: {
    ...shared,
    activity: {
      title: 'Bankverbindung geändert',
      actorName: 'Erika Mustermann',
      occurredAt: new Date('2026-09-28T17:31:00Z'),
      description: 'Erika Mustermann hat am 28. September 2026 um 19:31 die IBAN des Geschäftskontos geändert.',
    },
    target: { type: 'workspace', workspaceName: 'Muster GmbH' },
  },
  account: {
    ...shared,
    activity: {
      title: 'Passwort geändert',
      actorName: 'Max Mustermann',
      occurredAt: new Date('2026-09-28T17:31:00Z'),
      description: 'Das Passwort deines Kontos wurde am 28. September 2026 um 19:31 geändert.',
    },
    target: { type: 'account', email: 'max@muster.de' },
  },
};

export function SecurityActivityAlertPage() {
  const { resolvedMode } = useColorScheme();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [kind, setKind] = useState<'workspace' | 'account'>('workspace');
  const [html, setHtml] = useState('');

  // The real output, in an iframe: exactly the document a mail client gets.
  useEffect(() => {
    let current = true;
    renderEmail(
      <SecurityActivityAlertEmail
        {...EXAMPLES[kind]}
        messages={lang === 'de' ? securityActivityAlertMessagesDe : securityActivityAlertMessagesEn}
        colorScheme={resolvedMode}
      />,
    ).then((rendered) => {
      if (current) setHtml(rendered.html);
    });
    return () => {
      current = false;
    };
  }, [lang, kind, resolvedMode]);

  return (
    <>
      <h1>Security activity alert</h1>
      <p className="docs-lede">
        For security-relevant activity. A change in a workspace — new bank details, a new admin — goes to
        every admin of it; a change to an account — a new password, a sign-in from an unknown device — goes
        to the account&rsquo;s owner. The heading names the action, one sentence says what happened, and the
        button opens the entry in the activity log.
      </p>

      <h2>Preview</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <SegmentedToggle<'workspace' | 'account'>
            aria-label="Target"
            value={kind}
            options={[
              { value: 'workspace', label: 'Workspace' },
              { value: 'account', label: 'Account' },
            ]}
            onChange={setKind}
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
        {/* allow-same-origin and nothing else: scripts stay blocked. An empty
            sandbox left the frame blank after srcDoc changed. Keyed on the
            HTML so each render gets a fresh document. */}
        {html && (
          <iframe
            key={html}
            title="Security activity alert preview"
            srcDoc={html}
            sandbox="allow-same-origin"
            style={{ width: '100%', height: 720, border: 0, display: 'block' }}
          />
        )}
      </Demo>

      <h2>Sending</h2>
      <Code>{`import { renderSecurityActivityAlert, securityActivityAlertMessagesDe } from '@hintoric/email';

const { subject, html, text } = await renderSecurityActivityAlert({
  activity: {
    title: 'Bankverbindung geändert',
    actorName: entry.user.name,
    occurredAt: entry.createdAt,
    description: \`\${entry.user.name} hat die IBAN des Geschäftskontos geändert.\`, // optional
  },
  target: { type: 'workspace', workspaceName: workspace.name },
  reviewUrl: \`https://app.example.com/activity/\${entry.id}\`,
  activityLogUrl: 'https://app.example.com/activity',
  messages: securityActivityAlertMessagesDe,
  timeZone: 'Europe/Berlin',
});

await mailer.send({ to: admins.map((a) => a.email), subject, html, text });

// An account event goes to the account's owner:
await renderSecurityActivityAlert({
  activity: { title: 'Passwort geändert', actorName: user.name, occurredAt: entry.createdAt },
  target: { type: 'account', email: user.email },
  // …
});`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'activity',
            type: '{ title; actorName; occurredAt; description? }',
            description: 'The heading, who did it and when. description is free text for the paragraph; without it, messages.summary builds one.',
          },
          {
            name: 'target',
            type: "{ type: 'workspace'; workspaceName } | { type: 'account'; email }",
            description: 'What the activity concerns: shown under the heading, and it picks the footer — admin of the workspace, or owner of the account.',
          },
          { name: 'reviewUrl', type: 'string', description: 'Behind the button. Unsafe schemes are dropped.' },
          { name: 'activityLogUrl', type: 'string', description: 'Optional link under the button.' },
          {
            name: 'messages',
            type: 'SecurityActivityAlertMessages',
            description: 'Every string. Pass securityActivityAlertMessagesDe / …En or spread one and override.',
          },
          { name: 'timeZone', type: 'string', description: 'IANA zone for occurredAt.' },
          { name: 'legalNotice', type: 'string', description: 'Optional line under the footer.' },
          { name: 'colorScheme', type: "'light' | 'dark'", description: 'Forces a scheme. Previews only.' },
        ]}
      />
    </>
  );
}
