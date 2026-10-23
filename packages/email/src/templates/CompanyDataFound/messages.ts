import type { CompanyDataFoundMessages } from './types';

export const companyDataFoundMessagesDe: CompanyDataFoundMessages = {
  lang: 'de',
  subject: ({ companyName }) => (companyName ? `Firmendaten von ${companyName} automatisch gefunden` : 'Deine Firmendaten wurden automatisch gefunden'),
  preview: ({ website }) => `Prüfe die Angaben von ${website} und übernimm sie mit einem Klick.`,
  // No-break spaces keep "sind schon da" together: at the card's width the
  // heading wraps, and "da" alone on the second line reads like a typo.
  heading: 'Deine Firmendaten sind\u00a0schon\u00a0da',
  intro: ({ companyName, website }) =>
    `Die Angaben zu ${companyName ?? 'deiner Firma'} wurden automatisch auf ${website} gefunden. Du musst nichts abtippen, nur prüfen.`,
  button: 'Angaben prüfen',
  confirmHint: 'Erst wenn du bestätigst, werden die Angaben übernommen.',
  footer: ({ workspaceName }) => `Du erhältst diese E-Mail, weil sie deinen Workspace „${workspaceName}“ bei hintoric betrifft.`,
};

export const companyDataFoundMessagesEn: CompanyDataFoundMessages = {
  lang: 'en',
  subject: ({ companyName }) => (companyName ? `Company details for ${companyName} found automatically` : 'Your company details were found automatically'),
  preview: ({ website }) => `Review the details from ${website} and add them with one click.`,
  heading: 'Your company details are ready',
  intro: ({ companyName, website }) =>
    `The details for ${companyName ?? 'your company'} were found automatically on ${website}. No typing needed, just review them.`,
  button: 'Review details',
  confirmHint: 'Nothing is added until you confirm.',
  footer: ({ workspaceName }) => `We sent you this email because it concerns your workspace “${workspaceName}” at hintoric.`,
};
