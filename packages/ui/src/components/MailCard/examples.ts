import type { CardSpec } from './spec';

/**
 * The card from the mail-cards spec ("Wohnungsgeberbestätigung"), as Core would send it.
 * Shared by the tests of every MailCard part so the JSON exists once. Internal: not exported
 * from the package.
 */
export const WOHNUNGSGEBER_EXAMPLE: CardSpec = {
  kind: 'workflow',
  blocks: [
    {
      type: 'header',
      title: 'Wohnungsgeberbestätigung für Tobias Maurer',
      subtitle: 'Einzug am 1. Nov. in die Hauptstr. 1, 2. OG links',
    },
    {
      type: 'rows',
      rows: [
        { icon: 'person', label: 'Mieter', value: 'Tobias Maurer' },
        { icon: 'event', label: 'Einzug', value: { date: '2026-11-01' } },
        { icon: 'place', label: 'Wohnung', value: 'Hauptstr. 1, 2. OG links' },
      ],
    },
    {
      type: 'actions',
      actions: [
        {
          label: 'Bestätigung ausstellen',
          offer: true,
          primary: true,
          alternatives: [
            {
              label: 'Ausstellen und versenden',
              hint: 'Die Antwort geht ohne weitere Rückfrage an Tobias Maurer.',
              preapprove: ['send_reply'],
            },
            {
              label: 'Ausstellen und als Entwurf speichern',
              hint: 'Die Antwort liegt danach in deinen Entwürfen.',
              preapprove: ['save_draft'],
            },
          ],
        },
      ],
    },
    { type: 'feedback', question: 'Ist das richtig?' },
  ],
};
