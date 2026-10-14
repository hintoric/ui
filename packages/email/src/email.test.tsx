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
  renderAuthCode,
  renderAuthNoAccount,
  renderSecurityActivityAlert,
  renderWaitlistWelcome,
  waitlistWelcomeMessagesDe,
  waitlistWelcomeMessagesEn,
  safeHref,
  Alert,
  HintoricLogo,
  emailAlertIconFiles,
  securityActivityAlertMessagesDe,
  securityActivityAlertMessagesEn,
  type SecurityActivityAlertProps,
  authCodeMessagesDe,
  authCodeMessagesEn,
  authNoAccountMessagesDe,
  authNoAccountMessagesEn,
  type AuthCodeProps,
  type AuthNoAccountProps,
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

  it('builds the avatar from the letters of the name, not from its symbols', async () => {
    const avatarOf = async (workspaceName: string) => {
      const doc = parse((await renderSecurityActivityAlert({ ...props, target: { type: 'workspace', workspaceName } })).html);
      const leaves = [...doc.body.querySelectorAll('*')].filter((e) => e.children.length === 0);
      return leaves.find((e) => e.textContent!.length <= 2 && e.textContent !== '')?.textContent;
    };

    expect(await avatarOf('Müller & Söhne GmbH')).toBe('MS');
    expect(await avatarOf('„Alpha“ - Beta')).toBe('AB');
  });

  it('formats the time in the given zone, not the server’s', async () => {
    const { text } = await renderSecurityActivityAlert(props);
    // 17:31 UTC is 19:31 in Berlin under summer time.
    expect(text).toContain('28. September 2026 um 19:31 Uhr');
  });

  it('uses the activity’s own description instead of the summary, guidance still following', async () => {
    const { html, text } = await renderSecurityActivityAlert({
      ...props,
      activity: { ...props.activity, description: 'Erika Mustermann hat die IBAN des Geschäftskontos geändert.' },
    });
    expect(text).toContain('Erika Mustermann hat die IBAN des Geschäftskontos geändert. Wenn du diese Änderung nicht erwartet hast');
    expect(html).not.toContain('das die Sicherheit betrifft');
  });

  it('shows the account and explains the mail differently for an account target', async () => {
    const { subject, html, text } = await renderSecurityActivityAlert({
      ...props,
      activity: { ...props.activity, title: 'Passwort geändert' },
      target: { type: 'account', email: 'max@muster.de' },
    });
    expect(subject).toBe('Passwort geändert – max@muster.de');
    expect(text).toContain('weil sie dein Konto bei hintoric betrifft');
    expect(text).not.toContain('Workspace verwaltest');
    expect(parse(html).body.textContent).toContain('max@muster.de');
  });

  it('tells a workspace admin why they got it', async () => {
    const { text } = await renderSecurityActivityAlert(props);
    expect(text).toContain('weil du diesen Workspace verwaltest');
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

describe('renderWaitlistWelcome', () => {
  const waitlist = { messages: waitlistWelcomeMessagesDe, websiteUrl: 'https://hintoric.com' };

  it('returns subject, HTML and a plain-text part', async () => {
    const { subject, html, text } = await renderWaitlistWelcome(waitlist);
    expect(subject).toBe('Du stehst auf der Warteliste von hintoric');
    expect(html).toMatch(/^<!DOCTYPE html/);
    expect(html).toContain('lang="de"');
    expect(text).toContain('Du stehst auf der Warteliste.');
    expect(text).toContain('https://hintoric.com');
  });

  it('shows the heading and a button to the website', async () => {
    const doc = parse((await renderWaitlistWelcome(waitlist)).html);
    expect(doc.querySelector('h1')?.textContent).toBe('Willkommen bei hintoric');
    const button = [...doc.querySelectorAll('a')].find((a) => a.textContent === 'Zu hintoric.com');
    expect(button?.getAttribute('href')).toBe('https://hintoric.com/');
  });

  it('renders in English with its own lang and subject', async () => {
    const { subject, html } = await renderWaitlistWelcome({ ...waitlist, messages: waitlistWelcomeMessagesEn });
    expect(subject).toBe("You're on the hintoric waitlist");
    expect(html).toContain('lang="en"');
  });

  it('adds the legal notice under the footer only when given', async () => {
    expect((await renderWaitlistWelcome(waitlist)).text).not.toContain('Musterstraße');
    expect((await renderWaitlistWelcome({ ...waitlist, legalNotice: 'Muster GmbH · Musterstraße 1' })).text).toContain('Musterstraße 1');
  });

  it('renders the unsubscribe link only when a URL is given', async () => {
    const link = (html: string) => [...parse(html).querySelectorAll('a')].find((a) => a.textContent === 'E-Mails abbestellen');
    expect(link((await renderWaitlistWelcome(waitlist)).html)).toBeUndefined();
    const withUrl = await renderWaitlistWelcome({ ...waitlist, unsubscribeUrl: 'https://hintoric.com/unsubscribe?t=1' });
    expect(link(withUrl.html)?.getAttribute('href')).toBe('https://hintoric.com/unsubscribe?t=1');
    expect(link((await renderWaitlistWelcome({ ...waitlist, unsubscribeUrl: 'javascript:x' })).html)).toBeUndefined();
  });
});

describe('renderAuthCode', () => {
  const auth: AuthCodeProps = { purpose: 'login', code: '482915', email: 'max@muster.de', messages: authCodeMessagesDe };

  it('returns subject, HTML and a plain-text part with the code in all three', async () => {
    const { subject, html, text } = await renderAuthCode(auth);
    expect(subject).toBe('Dein Anmeldecode für hintoric');
    expect(html).toMatch(/^<!DOCTYPE html/);
    expect(html).toContain('lang="de"');
    expect(html).toContain('482915');
    expect(text).toContain('482915');
  });

  it('shows the code as one unbroken run, so a double-click selects all of it', async () => {
    const doc = parse((await renderAuthCode(auth)).html);
    const code = doc.querySelector('[data-auth-code]');
    expect(code?.textContent).toBe('482915');
    expect(code?.children.length).toBe(0);
  });

  it('puts the code in the inbox preview line', async () => {
    const doc = parse((await renderAuthCode(auth)).html);
    expect(doc.body.textContent).toContain('Dein Code: 482915');
  });

  it('names the flow in heading and subject, in the words core uses for it', async () => {
    const heading = async (purpose: AuthCodeProps['purpose']) => {
      const { subject, html } = await renderAuthCode({ ...auth, purpose });
      return [subject, parse(html).querySelector('h1')?.textContent];
    };
    expect(await heading('verification')).toEqual(['Dein Bestätigungscode für hintoric', 'Adresse bestätigen']);
    expect(await heading('registration')).toEqual(['Dein Registrierungscode für hintoric', 'Konto anlegen']);
    expect(await heading('login')).toEqual(['Dein Anmeldecode für hintoric', 'Anmelden']);
    expect(await heading('recovery')).toEqual(['Dein Wiederherstellungscode für hintoric', 'Konto wiederherstellen']);
  });

  it('adds a button only when a link is given, and only a safe one', async () => {
    const button = (html: string) => [...parse(html).querySelectorAll('a')].find((a) => a.textContent === 'Adresse bestätigen');
    expect(button((await renderAuthCode({ ...auth, purpose: 'verification' })).html)).toBeUndefined();
    const url = 'https://auth.hint-dev.com/self-service/verification?flow=1&code=482915';
    const withUrl = await renderAuthCode({ ...auth, purpose: 'verification', url });
    expect(button(withUrl.html)?.getAttribute('href')).toBe(url);
    expect(withUrl.text).toContain(url);
    const unsafe = await renderAuthCode({ ...auth, purpose: 'verification', url: 'javascript:alert(1)' });
    expect(unsafe.html).not.toContain('javascript:');
  });

  it('says how long the code is valid only when told', async () => {
    expect((await renderAuthCode(auth)).text).not.toContain('Minuten');
    expect((await renderAuthCode({ ...auth, expiresInMinutes: 15 })).text).toContain('15 Minuten');
    expect((await renderAuthCode({ ...auth, expiresInMinutes: 60, messages: authCodeMessagesEn })).text).toContain('60 minutes');
  });

  it('names the address the code is for, when given', async () => {
    expect((await renderAuthCode(auth)).text).toContain('max@muster.de');
    expect((await renderAuthCode({ ...auth, email: undefined })).text).not.toContain('@');
  });

  it('warns more firmly for recovery, which hands over the account', async () => {
    expect((await renderAuthCode(auth)).text).toContain('kannst du diese E-Mail ignorieren');
    expect((await renderAuthCode({ ...auth, purpose: 'recovery' })).text).toContain('Gib den Code an niemanden weiter');
  });

  it('escapes the code and the address rather than rendering them as markup', async () => {
    const { html } = await renderAuthCode({ ...auth, code: '<b>1</b>', email: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<b>1</b>');
    expect(html).not.toContain('<img src=x');
  });

  it('renders in English with its own lang and subject', async () => {
    const { subject, html } = await renderAuthCode({ ...auth, messages: authCodeMessagesEn });
    expect(subject).toBe('Your hintoric sign-in code');
    expect(html).toContain('lang="en"');
  });

  it('adds the legal notice under the footer only when given', async () => {
    expect((await renderAuthCode(auth)).text).not.toContain('Musterstraße');
    expect((await renderAuthCode({ ...auth, legalNotice: 'Muster GmbH · Musterstraße 1' })).text).toContain('Musterstraße 1');
  });
});

describe('renderAuthNoAccount', () => {
  const noAccount: AuthNoAccountProps = { purpose: 'recovery', email: 'max@muster.de', messages: authNoAccountMessagesDe };

  it('returns subject, HTML and a plain-text part, and no code anywhere', async () => {
    const { subject, html, text } = await renderAuthNoAccount(noAccount);
    expect(subject).toBe('Zu dieser Adresse gibt es kein Konto bei hintoric');
    expect(html).toMatch(/^<!DOCTYPE html/);
    expect(parse(html).querySelector('[data-auth-code]')).toBeNull();
    expect(text).toContain('max@muster.de');
  });

  it('says what was attempted, for recovery and for verification', async () => {
    expect((await renderAuthNoAccount(noAccount)).text).toContain('Für max@muster.de wurde ein Wiederherstellungscode angefordert.');
    expect((await renderAuthNoAccount({ ...noAccount, purpose: 'verification' })).text).toContain('Für max@muster.de wurde ein Bestätigungscode angefordert.');
  });

  it('states the missing account in a warning alert, not in the running text', async () => {
    const doc = parse((await renderAuthNoAccount(noAccount)).html);
    const alert = doc.querySelector('table.hx-soft-warning');
    expect(alert?.textContent).toBe('Zu dieser Adresse gibt es kein Konto bei hintoric.');
    expect([...doc.querySelectorAll('p')].some((p) => p.textContent?.includes('kein Konto bei hintoric'))).toBe(false);
  });

  it('offers to create an account only when a registration link is given', async () => {
    const button = (html: string) => [...parse(html).querySelectorAll('a')].find((a) => a.textContent === 'Konto anlegen');
    expect(button((await renderAuthNoAccount(noAccount)).html)).toBeUndefined();
    const withUrl = await renderAuthNoAccount({ ...noAccount, registrationUrl: 'https://hint-dev.com/auth/registration' });
    expect(button(withUrl.html)?.getAttribute('href')).toBe('https://hint-dev.com/auth/registration');
  });

  it('renders in English with its own lang and subject', async () => {
    const { subject, html } = await renderAuthNoAccount({ ...noAccount, messages: authNoAccountMessagesEn });
    expect(subject).toBe('No hintoric account with this address');
    expect(html).toContain('lang="en"');
  });
});

describe('Alert icons', () => {
  const imgs = async (node: React.ReactElement) => [...parse((await renderEmail(node)).html).querySelectorAll('img')];

  it('shows the icon for its colour as a light / dark pair by default', async () => {
    const [light, dark] = await imgs(<Alert color="warning">Hinweis</Alert>);
    expect(light?.getAttribute('src')).toBe('https://cdn.hintoric.com/assets/email/alert/warning-492b08.png');
    expect(dark?.getAttribute('src')).toBe('https://cdn.hintoric.com/assets/email/alert/warning-fce1c2.png');
    expect(light?.getAttribute('alt')).toBe('');
    expect(light?.getAttribute('width')).toBe('20');
  });

  it('is 24px at lg', async () => {
    const [light] = await imgs(<Alert size="lg">Hinweis</Alert>);
    expect(light?.getAttribute('width')).toBe('24');
    expect(light?.getAttribute('src')).toContain('/info-');
  });

  it('shows no icon for startDecorator={null}, and a given decorator instead of it', async () => {
    expect(await imgs(<Alert startDecorator={null}>Hinweis</Alert>)).toHaveLength(0);
    const html = (await renderEmail(<Alert startDecorator={<span>!</span>}>Hinweis</Alert>)).html;
    expect(parse(html).querySelectorAll('img')).toHaveLength(0);
    expect(html).toContain('<span>!</span>');
  });

  it('asks for exactly the files in assets/email/alert, the CDN folder', () => {
    const onDisk = Object.keys(import.meta.glob('../assets/email/alert/*.png')).map((path) => path.split('/').pop());
    expect(emailAlertIconFiles().map(({ file }) => file).sort()).toEqual(onDisk.sort());
  });
});

describe('HintoricLogo', () => {
  // The web logo's viewBox (@hintoric/ui HintoricLogo: 1484 × 326), which the
  // hosted PNGs are drawn at twice. A ratio that drifts from it squeezes the
  // wordmark, as it did once the PNGs were replaced by the 2968 × 652 artwork.
  const WEB_RATIO = 1484 / 326;

  it("keeps the wordmark's proportions, at the height of the auth screen's logo", async () => {
    const imgs = [...parse((await renderEmail(<HintoricLogo />)).html).querySelectorAll('img')];
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      const width = Number(img.getAttribute('width'));
      const height = Number(img.getAttribute('height'));
      expect(height).toBe(26);
      expect(Math.abs(width / height - WEB_RATIO)).toBeLessThan(0.05);
    }
  });
});
