import { describe, expect, it } from 'vitest';
import { emailStylesheet } from './styles';
import {
  EMAIL_COLORS,
  EMAIL_VARIANTS,
  Button,
  Link,
  emailSchemes,
  mainColor,
  variantTokens,
  renderEmail,
  renderSecurityActivityAlert,
  safeHref,
  securityActivityAlertMessagesDe,
  securityActivityAlertMessagesEn,
  type SecurityActivityAlertProps,
} from './index';

const props: SecurityActivityAlertProps = {
  activity: {
    title: 'Bankverbindung geändert',
    actorName: 'Erika Mustermann',
    occurredAt: new Date('2026-09-28T17:31:00Z'),
  },
  target: { type: 'workspace', workspaceName: 'Muster GmbH' },
  reviewUrl: 'https://app.example.com/activity/4711',
  activityLogUrl: 'https://app.example.com/activity',
  messages: securityActivityAlertMessagesDe,
  timeZone: 'Europe/Berlin',
};

function parse(html: string) {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('renderSecurityActivityAlert', () => {
  it('returns subject, HTML and a plain-text part', async () => {
    const { subject, html, text } = await renderSecurityActivityAlert(props);
    expect(subject).toBe('Bankverbindung geändert – Muster GmbH');
    expect(html).toMatch(/^<!DOCTYPE html/);
    expect(html).toContain('lang="de"');
    expect(text).toContain('Erika Mustermann hat am');
    expect(text).toContain('https://app.example.com/activity/4711');
  });

  it('shows the heading, the account, the sentence, the button and the link', async () => {
    const doc = parse((await renderSecurityActivityAlert(props)).html);
    expect(doc.querySelector('h1')?.textContent).toBe('Bankverbindung geändert');
    expect(doc.body.textContent).toContain('Muster GmbH');
    const links = [...doc.querySelectorAll('a')];
    expect(links.find((a) => a.textContent === 'Aktivität prüfen')?.getAttribute('href')).toBe('https://app.example.com/activity/4711');
    expect(links.find((a) => a.textContent === 'Aktivitätsprotokoll')?.getAttribute('href')).toBe('https://app.example.com/activity');
  });

  it('formats the time in the given zone, not the server’s', async () => {
    const { text } = await renderSecurityActivityAlert(props);
    // 17:31 UTC is 19:31 in Berlin under summer time.
    expect(text).toMatch(/28\. September 2026.*19:31/);
  });

  it('uses the activity’s own description instead of the summary, guidance still following', async () => {
    const { html, text } = await renderSecurityActivityAlert({
      ...props,
      activity: { ...props.activity, description: 'Erika Mustermann hat die IBAN des Geschäftskontos geändert.' },
    });
    expect(text).toContain('Erika Mustermann hat die IBAN des Geschäftskontos geändert. Wenn du diese Änderung nicht erwartet hast');
    expect(html).not.toContain('eine sicherheitsrelevante Änderung vorgenommen');
  });

  it('shows the account and explains the mail differently for an account target', async () => {
    const { subject, html, text } = await renderSecurityActivityAlert({
      ...props,
      activity: { ...props.activity, title: 'Passwort geändert' },
      target: { type: 'account', email: 'max@muster.de' },
    });
    expect(subject).toBe('Passwort geändert – max@muster.de');
    expect(text).toContain('über wichtige Änderungen an deinem hintoric-Konto');
    expect(text).not.toContain('Administrator');
    expect(parse(html).body.textContent).toContain('max@muster.de');
  });

  it('tells a workspace admin why they got it', async () => {
    const { text } = await renderSecurityActivityAlert(props);
    expect(text).toContain('als Administrator über wichtige Änderungen in deinem Workspace');
  });

  it('escapes activity data rather than rendering it as markup', async () => {
    const { html } = await renderSecurityActivityAlert({
      ...props,
      activity: { ...props.activity, actorName: '<img src=x onerror=alert(1)>' },
    });
    expect(html).not.toContain('<img src=x');
  });

  it('drops a review link with an unsafe scheme instead of rendering it', async () => {
    const { html, text } = await renderSecurityActivityAlert({ ...props, reviewUrl: 'javascript:alert(1)' });
    expect(html).not.toContain('javascript:');
    expect(text).not.toContain('javascript:');
  });

  it('carries every string from the messages it is given', async () => {
    const { html } = await renderSecurityActivityAlert({ ...props, messages: securityActivityAlertMessagesEn });
    expect(html).toContain('lang="en"');
    expect(html).toContain('Review activity');
  });

  it('paints light tokens inline and ships the dark overrides in the stylesheet', async () => {
    const { html } = await renderSecurityActivityAlert(props);
    expect(html).toContain(emailSchemes.light.surface);
    expect(html).toContain('@media (prefers-color-scheme:dark)');
    expect(html).toContain(`[data-color-scheme="dark"] .hx-layout-card{background-color:${emailSchemes.dark.surface1}!important`);
  });
});

describe('email tokens', () => {
  it('follow theme.css, including neutral’s light-mode -700 override', () => {
    expect(variantTokens('light', 'solid', 'primary')).toEqual({ color: '#FFFFFF', backgroundColor: '#0B6BCB' });
    expect(variantTokens('light', 'outlined', 'neutral')).toEqual({ color: '#32383E', borderColor: '#CDD7E1' });
    expect(variantTokens('light', 'outlined', 'danger')).toEqual({ color: '#C41C1C', borderColor: '#F09898' });
    expect(variantTokens('dark', 'soft', 'success')).toEqual({ color: '#C7F7C7', backgroundColor: '#042F04' });
    expect(mainColor('dark', 'primary')).toBe('#4393E4');
    expect(emailSchemes.dark).toMatchObject({ inkPrimary: '#F0F4F8', surface: '#0B0D0E' });
  });

  it('ships a dark rule for every variant × colour', () => {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        expect(emailStylesheet).toContain(`[data-color-scheme="dark"] .hx-${variant}-${color}{`);
      }
    }
  });
});

describe('safeHref', () => {
  it.each(['https://a.example', 'http://a.example', 'mailto:help@a.example'])('lets %s through', (href) => {
    expect(safeHref(href)).toBeDefined();
  });
  it.each(['javascript:alert(1)', 'data:text/html,x', '/relative', '', undefined])('rejects %s', (href) => {
    expect(safeHref(href)).toBeUndefined();
  });
  it('renders an unsafe Link as text and an unsafe Button as nothing', async () => {
    expect((await renderEmail(<Link href="javascript:x">label</Link>)).html).not.toContain('<a');
    expect((await renderEmail(<Button href="javascript:x">label</Button>)).html).not.toContain('label');
  });
});
