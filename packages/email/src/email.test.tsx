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
  renderAuthLink,
  renderCompanyDataFound,
  COMPANY_DATA_FOUND_ICON,
  companyDataFoundMessagesDe,
  companyDataFoundMessagesEn,
  type CompanyDataFoundProps,
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
  authLinkMessagesDe,
  authLinkMessagesEn,
  type AuthLinkProps,
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

  it('needs no actor: a fact about an account, like a sign-in, names nobody', async () => {
    const account: SecurityActivityAlertProps = {
      ...props,
      activity: { title: 'Passwort geändert', occurredAt: props.activity.occurredAt },
      target: { type: 'account', email: 'max@muster.de' },
    };
    const de = await renderSecurityActivityAlert(account);
    expect(de.text).toContain('Am 28. September 2026 um 19:31 Uhr wurde etwas an deinem Konto geändert, das die Sicherheit betrifft.');
    expect(de.text).not.toContain('undefined');
    const en = await renderSecurityActivityAlert({ ...account, messages: securityActivityAlertMessagesEn });
    expect(en.text).toContain('Something security-relevant changed on your account on 28 September 2026');
    expect(en.text).not.toContain('undefined');
    expect(de.html).not.toContain('undefined');
  });

  it('sends the reader of an account alert to secure the account, not to an activity', async () => {
    const account: SecurityActivityAlertProps = { ...props, target: { type: 'account', email: 'max@muster.de' }, activityLogUrl: undefined };
    const de = await renderSecurityActivityAlert(account);
    expect(de.text).toContain('Wenn du das nicht warst, sichere dein Konto jetzt.');
    expect([...parse(de.html).querySelectorAll('a')].map((a) => a.textContent)).toContain('Konto prüfen');
    const en = await renderSecurityActivityAlert({ ...account, messages: securityActivityAlertMessagesEn });
    expect(en.text).toContain("If this wasn't you, secure your account now.");
    expect([...parse(en.html).querySelectorAll('a')].map((a) => a.textContent)).toContain('Review account');
    // A workspace admin keeps the activity wording.
    expect((await renderSecurityActivityAlert(props)).text).toContain('Wenn du diese Änderung nicht erwartet hast, prüfe die Aktivität jetzt.');
  });

  it('still takes a plain string as the button label', async () => {
    const { html } = await renderSecurityActivityAlert({ ...props, messages: { ...securityActivityAlertMessagesDe, reviewButton: 'Ansehen' } });
    expect([...parse(html).querySelectorAll('a')].map((a) => a.textContent)).toContain('Ansehen');
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

describe('renderAuthNoAccount for the link flows', () => {
  const noAccount: AuthNoAccountProps = { purpose: 'recovery', channel: 'link', email: 'max@muster.de', messages: authNoAccountMessagesDe };

  it('speaks of a link, never of a code', async () => {
    const recovery = await renderAuthNoAccount(noAccount);
    expect(recovery.text).toContain('Für max@muster.de wurde ein Wiederherstellungslink angefordert.');
    expect(recovery.text).toContain('Wenn du den Link nicht angefordert hast');
    expect(recovery.text).not.toMatch(/code/i);
    const verification = await renderAuthNoAccount({ ...noAccount, purpose: 'verification' });
    expect(verification.text).toContain('Für max@muster.de wurde ein Bestätigungslink angefordert.');
  });

  it('speaks English too', async () => {
    const { text } = await renderAuthNoAccount({ ...noAccount, messages: authNoAccountMessagesEn });
    expect(text).toContain('A recovery link was requested for max@muster.de.');
    expect(text).toContain("If you didn't request the link");
    expect(text).not.toMatch(/code/i);
  });

  it('keeps the code wording when no channel is given', async () => {
    const { text } = await renderAuthNoAccount({ ...noAccount, channel: undefined });
    expect(text).toContain('wurde ein Wiederherstellungscode angefordert.');
  });
});

describe('renderAuthLink', () => {
  const url = 'https://auth.hint-dev.com/self-service/verification?flow=1&token=abc';
  const link: AuthLinkProps = { purpose: 'verification', url, email: 'max@muster.de', messages: authLinkMessagesDe };

  it('returns subject, HTML and a plain-text part with the link, and no code anywhere', async () => {
    const { subject, html, text } = await renderAuthLink(link);
    expect(subject).toBe('Dein Bestätigungslink für hintoric');
    expect(html).toMatch(/^<!DOCTYPE html/);
    expect(html).toContain('lang="de"');
    expect(parse(html).querySelector('[data-auth-code]')).toBeNull();
    expect(text).toContain(url);
    expect(text).not.toMatch(/code/i);
  });

  it('picks heading, subject and button by purpose', async () => {
    const read = async (purpose: AuthLinkProps['purpose']) => {
      const { subject, html } = await renderAuthLink({ ...link, purpose });
      const doc = parse(html);
      return [subject, doc.querySelector('h1')?.textContent, [...doc.querySelectorAll('a')].find((a) => a.getAttribute('href') === url)?.textContent];
    };
    expect(await read('verification')).toEqual(['Dein Bestätigungslink für hintoric', 'Adresse bestätigen', 'Adresse bestätigen']);
    expect(await read('recovery')).toEqual(['Dein Wiederherstellungslink für hintoric', 'Konto wiederherstellen', 'Konto wiederherstellen']);
  });

  it('names the address, and says so when it is not known', async () => {
    expect((await renderAuthLink(link)).text).toContain('max@muster.de');
    expect((await renderAuthLink({ ...link, email: undefined })).text).toContain('deine E-Mail-Adresse');
  });

  it('refuses to link an unsafe scheme', async () => {
    const { html, text } = await renderAuthLink({ ...link, url: 'javascript:alert(1)' });
    expect(html).not.toContain('javascript:');
    expect(text).not.toContain('javascript:');
  });

  it('says how long the link is valid only when told', async () => {
    expect((await renderAuthLink(link)).text).not.toContain('Minuten');
    expect((await renderAuthLink({ ...link, expiresInMinutes: 15 })).text).toContain('Der Link ist 15 Minuten gültig.');
    expect((await renderAuthLink({ ...link, expiresInMinutes: 60, messages: authLinkMessagesEn })).text).toContain('The link is valid for 60 minutes.');
  });

  it('warns not to pass on a link that opens the account, and only that one', async () => {
    expect((await renderAuthLink({ ...link, purpose: 'recovery' })).text).toContain('Gib den Link an niemanden weiter');
    expect((await renderAuthLink(link)).text).not.toContain('an niemanden weiter');
  });

  it('renders in English with its own lang and subject', async () => {
    const { subject, html } = await renderAuthLink({ ...link, purpose: 'recovery', messages: authLinkMessagesEn });
    expect(subject).toBe('Your hintoric recovery link');
    expect(html).toContain('lang="en"');
  });

  it('escapes the address rather than rendering it as markup', async () => {
    const { html } = await renderAuthLink({ ...link, email: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img src=x');
  });

  it('puts the legal notice under the footer only when given', async () => {
    expect((await renderAuthLink(link)).text).not.toContain('Musterstraße');
    expect((await renderAuthLink({ ...link, legalNotice: 'Muster GmbH · Musterstraße 1' })).text).toContain('Musterstraße 1');
  });
});

describe('renderCompanyDataFound', () => {
  const reviewUrl = 'https://app.example.com/settings/company?suggestion=1';
  const found: CompanyDataFoundProps = {
    companyName: 'Muster Bau GmbH',
    website: 'muster-bau.de',
    reviewUrl,
    workspaceName: 'Muster Bau',
    messages: companyDataFoundMessagesDe,
  };

  it('returns subject, HTML and a plain-text part with the review link', async () => {
    const { subject, html, text } = await renderCompanyDataFound(found);
    expect(subject).toBe('Firmendaten von Muster Bau GmbH automatisch gefunden');
    expect(html).toMatch(/^<!DOCTYPE html/);
    expect(html).toContain('lang="de"');
    const doc = parse(html);
    expect(doc.querySelector('h1')?.textContent).toBe('Deine Firmendaten sind\u00a0schon\u00a0da');
    expect([...doc.querySelectorAll('a')].find((a) => a.getAttribute('href') === reviewUrl)?.textContent).toBe('Angaben prüfen');
    expect(text).toContain('Die Angaben zu Muster Bau GmbH wurden automatisch auf muster-bau.de gefunden. Du musst nichts abtippen, nur prüfen.');
    expect(text).toContain('Erst wenn du bestätigst, werden die Angaben übernommen.');
    expect(text).toContain(reviewUrl);
  });

  it('speaks of "your company" when no name was found, or only a blank one', async () => {
    for (const companyName of [undefined, '  ']) {
      const { subject, text } = await renderCompanyDataFound({ ...found, companyName });
      expect(subject).toBe('Deine Firmendaten wurden automatisch gefunden');
      expect(text).toContain('Die Angaben zu deiner Firma wurden automatisch auf muster-bau.de gefunden.');
    }
  });

  it('names the workspace in the footer', async () => {
    expect((await renderCompanyDataFound(found)).text).toContain('weil sie deinen Workspace „Muster Bau“ bei hintoric betrifft');
  });

  it('renders in English with its own lang, subject and button', async () => {
    const { subject, html, text } = await renderCompanyDataFound({ ...found, messages: companyDataFoundMessagesEn });
    expect(subject).toBe('Company details for Muster Bau GmbH found automatically');
    expect(html).toContain('lang="en"');
    expect(text).toContain('Review details');
    expect(text).toContain('Nothing is added until you confirm.');
    expect((await renderCompanyDataFound({ ...found, companyName: undefined, messages: companyDataFoundMessagesEn })).subject).toBe(
      'Your company details were found automatically',
    );
  });

  it('lists none of the fields and loads no image but the logo and its icon — no tracking pixel', async () => {
    const { html } = await renderCompanyDataFound(found);
    const sources = [...parse(html).querySelectorAll('img')].map((img) => img.getAttribute('src'));
    expect(sources).toEqual(expect.arrayContaining([COMPANY_DATA_FOUND_ICON.light, COMPANY_DATA_FOUND_ICON.dark]));
    expect(sources.every((src) => /^https:\/\/cdn\.hintoric\.com\/assets\/(logo|icons\/company-data-found)\//.test(src ?? ''))).toBe(true);
    expect(html).not.toMatch(/IBAN|USt|Handelsregister/);
  });

  it('refuses to link an unsafe scheme', async () => {
    const { html, text } = await renderCompanyDataFound({ ...found, reviewUrl: 'javascript:alert(1)' });
    expect(html).not.toContain('javascript:');
    expect(text).not.toContain('javascript:');
  });

  it('escapes a company name read off a website rather than rendering it as markup', async () => {
    const { html } = await renderCompanyDataFound({ ...found, companyName: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img src=x');
  });

  it('puts the legal notice under the footer only when given', async () => {
    expect((await renderCompanyDataFound(found)).text).not.toContain('Musterstraße');
    expect((await renderCompanyDataFound({ ...found, legalNotice: 'Muster GmbH · Musterstraße 1' })).text).toContain('Musterstraße 1');
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
