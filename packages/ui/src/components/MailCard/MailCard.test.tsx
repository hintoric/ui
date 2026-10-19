import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimeProvider } from '../../theme/DateTimeProvider';
import { WOHNUNGSGEBER_EXAMPLE } from './examples';
import { MAIL_CARD_ICON_NAMES } from './spec';
import type { CardSpec } from './spec';
import type { MailCardMessages } from './messages';
import {
  MailCard,
  MailCardAction,
  MailCardFooter,
  MailCardHeader,
  MailCardIcon,
  MailCardRow,
  MailCardRows,
  MailCardStatus,
} from './index';

const TEST_MESSAGES: MailCardMessages = {
  moreActions: 'Weitere Aktionen',
  feedbackYes: 'Ja, das stimmt',
  feedbackNo: 'Nein, das stimmt nicht',
  feedbackThanks: 'Danke für deine Rückmeldung',
  schemaOrg: {
    labels: {
      amount: 'Betrag',
      validUntil: 'Gültig bis',
      seller: 'Anbieter',
      number: 'Nummer',
      provider: 'Rechnungssteller',
      account: 'Kundennummer',
      dueDate: 'Fällig am',
      merchant: 'Händler',
      orderNumber: 'Bestellnummer',
      item: 'Artikel',
      carrier: 'Paketdienst',
      expectedArrival: 'Zustellung bis',
      trackingNumber: 'Sendungsnummer',
    },
    offerTitle: ({ name, seller }) => `${name} von ${seller}`,
    invoiceTitle: ({ provider }) => `Rechnung von ${provider}`,
    orderTitle: ({ merchant, orderNumber }) => `Bestellung ${orderNumber} bei ${merchant}`,
    parcelTitle: ({ carrier, item }) => (item ? `${item} von ${carrier}` : `Paket von ${carrier}`),
    view: 'Ansehen',
    track: 'Sendung verfolgen',
  },
};

/** A card with one header, one row and the given further blocks. */
function specWith(...blocks: CardSpec['blocks']): CardSpec {
  return {
    kind: 'test',
    blocks: [
      { type: 'header', title: 'Titel' },
      { type: 'rows', rows: [{ label: 'Bezeichnung', value: 'Wert' }] },
      ...blocks,
    ],
  };
}

describe('MailCard', () => {
  it('renders header, rows and the primary action from a spec', () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={TEST_MESSAGES} locale="de-DE" />);

    expect(screen.getByText('Wohnungsgeberbestätigung für Tobias Maurer')).toBeInTheDocument();
    expect(
      screen.getByText('Einzug am 1. Nov. in die Hauptstr. 1, 2. OG links'),
    ).toBeInTheDocument();
    for (const label of ['Mieter', 'Einzug', 'Wohnung']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    for (const value of ['Tobias Maurer', '1. Nov.', 'Hauptstr. 1, 2. OG links']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Bestätigung ausstellen' })).toBeInTheDocument();
  });

  it('calls onOffer without an alternative when the main part is clicked', async () => {
    const onOffer = vi.fn();
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={TEST_MESSAGES} onOffer={onOffer} />);

    await userEvent.click(screen.getByRole('button', { name: 'Bestätigung ausstellen' }));

    expect(onOffer).toHaveBeenCalledTimes(1);
    expect(onOffer).toHaveBeenCalledWith();
  });

  it('renders nothing for jsonLd that does not map', () => {
    const { container } = render(
      <MailCard jsonLd={{ '@type': 'Movie', name: 'Metropolis' }} messages={TEST_MESSAGES} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a card for jsonLd that maps, with the labels from messages', () => {
    render(
      <MailCard
        jsonLd={{
          '@type': 'Invoice',
          provider: { name: 'Stadtwerke' },
          totalPaymentDue: { price: '42.00', priceCurrency: 'EUR' },
          url: 'https://example.com/rechnung',
        }}
        messages={TEST_MESSAGES}
        locale="de-DE"
      />,
    );
    expect(screen.getByText('Rechnung von Stadtwerke')).toBeInTheDocument();
    expect(screen.getByText('Betrag')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ansehen' })).toHaveAttribute(
      'href',
      'https://example.com/rechnung',
    );
  });

  it('renders nothing for a spec without a header', () => {
    const { container } = render(
      <MailCard
        spec={{ kind: 'test', blocks: [{ type: 'rows', rows: [{ label: 'A', value: 'B' }] }] }}
        messages={TEST_MESSAGES}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders only the first header block', () => {
    render(
      <MailCard
        spec={{
          kind: 'test',
          blocks: [
            { type: 'header', title: 'Erster Titel' },
            { type: 'header', title: 'Zweiter Titel' },
          ],
        }}
        messages={TEST_MESSAGES}
      />,
    );
    expect(screen.getByText('Erster Titel')).toBeInTheDocument();
    expect(screen.queryByText('Zweiter Titel')).not.toBeInTheDocument();
  });

  it('prefers children over spec, and spec over jsonLd', () => {
    const jsonLd = {
      '@type': 'Invoice',
      provider: { name: 'Stadtwerke' },
      totalPaymentDue: { price: '42.00', priceCurrency: 'EUR' },
    };
    const { rerender } = render(
      <MailCard spec={specWith()} jsonLd={jsonLd} messages={TEST_MESSAGES}>
        <MailCardHeader title="Aus JSX" />
      </MailCard>,
    );
    expect(screen.getByText('Aus JSX')).toBeInTheDocument();
    expect(screen.queryByText('Titel')).not.toBeInTheDocument();

    rerender(<MailCard spec={specWith()} jsonLd={jsonLd} messages={TEST_MESSAGES} />);
    expect(screen.getByText('Titel')).toBeInTheDocument();
    expect(screen.queryByText('Rechnung von Stadtwerke')).not.toBeInTheDocument();
  });

  it('formats a date value with the locale', () => {
    render(
      <MailCard
        spec={specWith({
          type: 'rows',
          rows: [{ icon: 'event', label: 'Einzug', value: { date: '2026-11-01' } }],
        })}
        messages={TEST_MESSAGES}
        locale="de-DE"
      />,
    );
    expect(screen.getByText('1. Nov.')).toBeInTheDocument();
  });

  it('shows a date-only value on its own day in a time zone west of UTC', () => {
    // `new Date('2026-11-01')` is midnight UTC, which is still 31 October in Los Angeles.
    render(
      <DateTimeProvider timeZone="America/Los_Angeles">
        <MailCard
          spec={specWith({
            type: 'rows',
            rows: [{ label: 'Einzug', value: { date: '2026-11-01' } }],
          })}
          messages={TEST_MESSAGES}
          locale="de-DE"
        />
      </DateTimeProvider>,
    );
    expect(screen.getByText('1. Nov.')).toBeInTheDocument();
  });

  it('shows a date-time value in the time zone of the DateTimeProvider', () => {
    render(
      <DateTimeProvider timeZone="America/Los_Angeles">
        <MailCard
          spec={specWith({
            type: 'rows',
            rows: [{ label: 'Zustellung', value: { date: '2026-11-01T02:00:00Z' } }],
          })}
          messages={TEST_MESSAGES}
          locale="de-DE"
        />
      </DateTimeProvider>,
    );
    expect(screen.getByText('31. Okt.')).toBeInTheDocument();
  });

  it('takes the locale from the DateTimeProvider when it has no locale prop', () => {
    render(
      <DateTimeProvider locale="en-US">
        <MailCard
          spec={specWith({ type: 'rows', rows: [{ label: 'Due', value: { date: '2026-11-01' } }] })}
          messages={TEST_MESSAGES}
        />
      </DateTimeProvider>,
    );
    expect(screen.getByText('Nov 1')).toBeInTheDocument();
  });

  it('shows a date it cannot read as given instead of failing', () => {
    render(
      <MailCard
        spec={specWith({ type: 'rows', rows: [{ label: 'Datum', value: { date: 'demnächst' } }] })}
        messages={TEST_MESSAGES}
        locale="de-DE"
      />,
    );
    expect(screen.getByText('demnächst')).toBeInTheDocument();
  });

  it('shows a status block in place of the actions', () => {
    render(
      <MailCard
        spec={{
          ...WOHNUNGSGEBER_EXAMPLE,
          blocks: [
            ...WOHNUNGSGEBER_EXAMPLE.blocks,
            {
              type: 'status',
              label: 'Bestätigung wurde ausgestellt und versendet.',
              tone: 'success',
            },
          ],
        }}
        messages={TEST_MESSAGES}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Bestätigung wurde ausgestellt und versendet.',
    );
    expect(
      screen.queryByRole('button', { name: 'Bestätigung ausstellen' }),
    ).not.toBeInTheDocument();
  });

  it('renders url actions as links with target _blank and noreferrer', () => {
    render(
      <MailCard
        spec={specWith({
          type: 'actions',
          actions: [{ label: 'Rechnung ansehen', url: 'https://example.com/rechnung' }],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    const link = screen.getByRole('link', { name: 'Rechnung ansehen' });
    expect(link).toHaveAttribute('href', 'https://example.com/rechnung');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it.each([
    ['javascript:', 'javascript:alert(1)'],
    ['http:', 'http://example.com/rechnung'],
    ['relative', '/rechnung'],
    ['https: without slashes', 'https:example.com'],
  ])('drops a %s url action from a typed spec, and the footer with it', (_, url) => {
    const { container } = render(
      <MailCard
        spec={specWith({
          type: 'actions',
          actions: [{ label: 'Rechnung ansehen', url, primary: true }],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    expect(screen.getByText('Titel')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Rechnung ansehen')).not.toBeInTheDocument();
    expect(container.querySelector('hr')).toBeNull();
  });

  it('keeps the https actions when another one is dropped', () => {
    render(
      <MailCard
        spec={specWith({
          type: 'actions',
          actions: [
            { label: 'Böse', url: 'javascript:alert(1)' },
            { label: 'Ansehen', url: 'https://example.com/a' },
          ],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Ansehen' })).toBeInTheDocument();
  });

  it('renders a primary url action as a link too', () => {
    render(
      <MailCard
        spec={specWith({
          type: 'actions',
          actions: [{ label: 'Sendung verfolgen', url: 'https://example.com/t', primary: true }],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    const link = screen.getByRole('link', { name: 'Sendung verfolgen' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('puts the primary action after the text links, whatever the order in the input', () => {
    render(
      <MailCard
        spec={specWith({
          type: 'actions',
          actions: [
            { label: 'Starten', offer: true, primary: true },
            { label: 'Ansehen', url: 'https://example.com/a' },
          ],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    const link = screen.getByRole('link', { name: 'Ansehen' });
    const button = screen.getByRole('button', { name: 'Starten' });
    expect(link.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('calls onOffer without an argument from a non-primary offer action', async () => {
    const onOffer = vi.fn();
    render(
      <MailCard
        spec={specWith({ type: 'actions', actions: [{ label: 'Später', offer: true }] })}
        messages={TEST_MESSAGES}
        onOffer={onOffer}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Später' }));
    expect(onOffer).toHaveBeenCalledWith();
  });

  it('draws no footer when there is nothing to put in it', () => {
    const { container } = render(<MailCard spec={specWith()} messages={TEST_MESSAGES} />);
    expect(container.querySelector('hr')).toBeNull();
  });

  it('sets data-color-scheme on its root when colorScheme is given', () => {
    const { container, rerender } = render(
      <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={TEST_MESSAGES} colorScheme="dark" />,
    );
    expect(container.firstElementChild).toHaveAttribute('data-color-scheme', 'dark');

    rerender(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={TEST_MESSAGES} />);
    expect(container.firstElementChild).not.toHaveAttribute('data-color-scheme');
  });

  it('paints from the --mail-card-* variables, which the joy theme sets on the root', () => {
    const { container } = render(
      <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={TEST_MESSAGES} className="custom" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('custom');
    expect(root.style.getPropertyValue('--mail-card-surface')).toBe('var(--color-surface)');
    expect(root.style.getPropertyValue('--mail-card-accent')).toBe('var(--color-primary-solid-bg)');
  });

  it("gives the joy pill the solid primary Button's hover, press and focus ring", () => {
    const { container } = render(
      <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={TEST_MESSAGES} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--mail-card-accent-hover')).toBe(
      'var(--color-primary-solid-hover-bg)',
    );
    expect(root.style.getPropertyValue('--mail-card-accent-active')).toBe(
      'var(--color-primary-solid-active-bg)',
    );
    expect(root.style.getPropertyValue('--mail-card-focus')).toBe('var(--color-primary-500)');
    expect(screen.getByRole('button', { name: 'Bestätigung ausstellen' })).toHaveClass(
      'hover:bg-[var(--mail-card-accent-hover)]',
      'active:bg-[var(--mail-card-accent-active)]',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-[var(--mail-card-focus)]',
    );
  });

  it('colours text links with the plain primary colour, not the button fill', () => {
    const { container } = render(
      <MailCard
        spec={specWith({
          type: 'actions',
          actions: [{ label: 'Ansehen', url: 'https://example.com' }],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    // primary-500 in light and primary-300 in dark: primary-500 text on the dark surface is ~3.7:1.
    expect(root.style.getPropertyValue('--mail-card-link')).toBe(
      'var(--color-primary-plain-color)',
    );
    expect(screen.getByRole('link', { name: 'Ansehen' })).toHaveClass(
      'text-[var(--mail-card-link)]',
    );
  });

  it('shows the Hintoric mark beside the title, unless showLogo is false', () => {
    const { container, rerender } = render(<MailCard spec={specWith()} messages={TEST_MESSAGES} />);
    expect(container.querySelector('[data-mail-card-logo]')).toHaveAttribute('aria-hidden', 'true');

    rerender(<MailCard spec={specWith()} messages={TEST_MESSAGES} showLogo={false} />);
    expect(container.querySelector('[data-mail-card-logo]')).toBeNull();
    expect(screen.getByText('Titel')).toBeInTheDocument();
  });

  it('composes from JSX blocks', async () => {
    const onOffer = vi.fn();
    render(
      <MailCard messages={TEST_MESSAGES} onOffer={onOffer} locale="de-DE">
        <MailCardHeader title="Angebot" subtitle="von Heizung Huber GmbH" />
        <MailCardRows>
          <MailCardRow icon="payments" label="Angebotssumme" value="2.380,00 €" />
          <MailCardRow icon="schedule" label="Gültig bis" value={{ date: '2026-11-30' }} />
        </MailCardRows>
        <MailCardFooter>
          <MailCardAction action={{ label: 'Angebot ansehen', url: 'https://example.com/a' }} />
          <MailCardAction action={{ label: 'Annehmen', offer: true, primary: true }} />
        </MailCardFooter>
      </MailCard>,
    );
    expect(screen.getByText('Angebot')).toBeInTheDocument();
    expect(screen.getByText('30. Nov.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Angebot ansehen' })).toHaveAttribute(
      'target',
      '_blank',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Annehmen' }));
    expect(onOffer).toHaveBeenCalledWith();
  });
});

describe('MailCard blocks', () => {
  it.each(['javascript:alert(1)', 'http://example.com', 'https:example.com'])(
    'MailCardAction renders nothing for %s',
    (url) => {
      const { container } = render(
        <MailCardAction action={{ label: 'Los', url, primary: true }} />,
      );
      expect(container).toBeEmptyDOMElement();
    },
  );

  it('render outside a MailCard', () => {
    render(
      <div>
        <MailCardHeader title="Allein" />
        <MailCardRows>
          <MailCardRow label="Datum" value={{ date: '2026-11-01' }} />
        </MailCardRows>
        <MailCardFooter>
          <MailCardStatus label="Erledigt" tone="success" />
        </MailCardFooter>
        <MailCardAction action={{ label: 'Los', offer: true }} />
      </div>,
    );
    expect(screen.getByText('Allein')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Erledigt');
    expect(screen.getByRole('button', { name: 'Los' })).toBeInTheDocument();
  });

  it('MailCardStatus carries its tone', () => {
    render(<MailCardStatus label="Fehlgeschlagen" tone="danger" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'danger');
  });
});

describe('MailCardIcon', () => {
  it.each(MAIL_CARD_ICON_NAMES)('draws %s as a hidden 20px Material icon', (name) => {
    const { container } = render(<MailCardIcon name={name} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy();
  });

  it.each(['rocket', 'toString', 'constructor'])(
    'draws nothing for a name it has no path for (%s)',
    (name) => {
      const { container } = render(<MailCardIcon name={name as never} />);
      expect(container).toBeEmptyDOMElement();
    },
  );

  it('keeps the row when its icon is unknown', () => {
    render(
      <MailCard
        spec={specWith({
          type: 'rows',
          rows: [{ icon: 'rocket' as never, label: 'Start', value: 'Morgen' }],
        })}
        messages={TEST_MESSAGES}
      />,
    );
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Morgen')).toBeInTheDocument();
  });

  it('is part of the row, in front of the label', () => {
    render(
      <MailCardRows>
        <MailCardRow icon="person" label="Mieter" value="Tobias Maurer" />
      </MailCardRows>,
    );
    const label = screen.getByText('Mieter');
    const cell = label.closest('[data-mail-card-row]') as HTMLElement;
    expect(within(cell).getByText('Tobias Maurer')).toBeInTheDocument();
    expect(cell.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
