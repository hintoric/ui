import type { CompanyDataFoundMessages } from './types';

export const companyDataFoundMessagesDe: CompanyDataFoundMessages = {
  lang: 'de',
  subject: ({ companyName }) => (companyName ? `Firmendaten von ${companyName} gefunden` : 'Deine Firmendaten wurden gefunden'),
  preview: ({ website }) => `Prüfe die Angaben von ${website} und übernimm sie mit einem Klick.`,
  heading: 'Firmendaten gefunden',
  intro: ({ companyName, website }) =>
    `Auf ${website} wurden die Angaben zu ${companyName ?? 'deiner Firma'} gefunden. Prüfe sie und übernimm sie mit einem Klick.`,
  button: 'Angaben prüfen',
  confirmHint: 'Erst wenn du bestätigst, werden die Angaben übernommen.',
  footer: ({ workspaceName }) => `Du erhältst diese E-Mail, weil sie deinen Workspace „${workspaceName}“ bei hintoric betrifft.`,
};

export const companyDataFoundMessagesEn: CompanyDataFoundMessages = {
  lang: 'en',
  subject: ({ companyName }) => (companyName ? `Company details found for ${companyName}` : 'Your company details were found'),
  preview: ({ website }) => `Review the details from ${website} and add them with one click.`,
  heading: 'Company details found',
  intro: ({ companyName, website }) =>
    `The details for ${companyName ?? 'your company'} were found on ${website}. Review them and add them with one click.`,
  button: 'Review details',
  confirmHint: 'Nothing is added until you confirm.',
  footer: ({ workspaceName }) => `We sent you this email because it concerns your workspace “${workspaceName}” at hintoric.`,
};
