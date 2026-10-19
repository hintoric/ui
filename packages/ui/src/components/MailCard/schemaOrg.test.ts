import { describe, expect, it } from 'vitest';
import type { MailCardMessages } from './messages';
import { jsonLdToSpec } from './schemaOrg';

const TEST_MESSAGES: MailCardMessages['schemaOrg'] = {
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
};

const toSpec = (jsonLd: unknown, locale = 'de-DE') => jsonLdToSpec(jsonLd, TEST_MESSAGES, locale);

// `Intl` puts a no-break space between the number and the euro sign in German.
const EURO = (amount: string) => `${amount}\u00a0€`;

const CONTEXT = 'http://schema.org';

// The JSON-LD examples of `docs/research/gmail-cards-overview.html` (extension repo), adapted.
const OFFER = {
  '@context': CONTEXT,
  '@type': 'Offer',
  name: 'Badsanierung',
  seller: { '@type': 'Organization', name: 'Malerbetrieb Kraus' },
  price: '2380.00',
  priceCurrency: 'EUR',
  priceValidUntil: '2026-11-15',
  identifier: 'A-2026-118',
  url: 'https://angebote.maler-kraus.example/A-2026-118',
};

const INVOICE = {
  '@context': CONTEXT,
  '@type': 'Invoice',
  provider: { '@type': 'Organization', name: 'Elektro Maier GmbH' },
  description: 'Elektroinstallation Küche',
  confirmationNumber: '2026-0815',
  accountId: 'KD-20931',
  totalPaymentDue: { '@type': 'PriceSpecification', price: '1428.00', priceCurrency: 'EUR' },
  paymentDue: '2026-11-02T00:00:00+01:00',
  paymentStatus: 'http://schema.org/PaymentDue',
  url: 'https://rechnung.elektro-maier.example/2026-0815',
};

const ORDER = {
  '@context': CONTEXT,
  '@type': 'Order',
  merchant: { '@type': 'Organization', name: 'Baustoff Weber GmbH' },
  orderNumber: 'BW-2026-10442',
  orderDate: '2026-10-19T07:45:00+02:00',
  price: '348.60',
  priceCurrency: 'EUR',
  acceptedOffer: [
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: 'Porenbeton-Planstein PP2 24 cm' },
      price: '4.95',
      priceCurrency: 'EUR',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: 'Dünnbettmörtel 25 kg' },
      price: '12.90',
      priceCurrency: 'EUR',
    },
  ],
  url: 'https://shop.baustoff-weber.example/bestellungen/BW-2026-10442',
};

const PARCEL = {
  '@context': CONTEXT,
  '@type': 'ParcelDelivery',
  deliveryAddress: { '@type': 'PostalAddress', streetAddress: 'Gewerbestraße 4' },
  expectedArrivalFrom: '2026-10-21T08:00:00+02:00',
  expectedArrivalUntil: '2026-10-21T14:00:00+02:00',
  carrier: { '@type': 'Organization', name: 'DHL' },
  itemShipped: { '@type': 'Product', name: 'Bosch Bohrhammer GBH 2-26' },
  partOfOrder: { '@type': 'Order', orderNumber: 'WS-90317' },
  trackingNumber: '00340434161234567890',
  trackingUrl: 'https://www.dhl.example/sendungsverfolgung?id=00340434161234567890',
};

/** A copy of `node` with the field at `path` ("seller.name") replaced; `undefined` removes it. */
function patched(node: object, path: string, value?: unknown): unknown {
  const copy = JSON.parse(JSON.stringify(node)) as Record<string, unknown>;
  const keys = path.split('.');
  const last = keys.pop() as string;
  const parent = keys.reduce((object, key) => object[key] as Record<string, unknown>, copy);
  if (value === undefined) delete parent[last];
  else parent[last] = value;
  return copy;
}

/** The labels of the first `rows` block, for tests that only care which rows are there. */
function rowLabels(jsonLd: unknown): string[] {
  const spec = toSpec(jsonLd);
  const rows = spec?.blocks.find((block) => block.type === 'rows');
  return rows?.type === 'rows' ? rows.rows.map((row) => row.label) : [];
}

const hasActions = (jsonLd: unknown) =>
  toSpec(jsonLd)?.blocks.some((block) => block.type === 'actions') ?? false;

describe('jsonLdToSpec', () => {
  describe('the four mapped types', () => {
    it('maps an Offer', () => {
      expect(toSpec(OFFER)).toStrictEqual({
        kind: 'Offer',
        blocks: [
          { type: 'header', title: 'Badsanierung von Malerbetrieb Kraus' },
          {
            type: 'rows',
            rows: [
              { icon: 'payments', label: 'Betrag', value: EURO('2.380,00') },
              { icon: 'schedule', label: 'Gültig bis', value: { date: '2026-11-15' } },
              { label: 'Anbieter', value: 'Malerbetrieb Kraus' },
              { label: 'Nummer', value: 'A-2026-118' },
            ],
          },
          {
            type: 'actions',
            actions: [{ label: 'Ansehen', url: 'https://angebote.maler-kraus.example/A-2026-118' }],
          },
        ],
      });
    });

    it('maps an Invoice', () => {
      expect(toSpec(INVOICE)).toStrictEqual({
        kind: 'Invoice',
        blocks: [
          { type: 'header', title: 'Rechnung von Elektro Maier GmbH' },
          {
            type: 'rows',
            rows: [
              { icon: 'payments', label: 'Betrag', value: EURO('1.428,00') },
              {
                icon: 'schedule',
                label: 'Fällig am',
                value: { date: '2026-11-02T00:00:00+01:00' },
              },
              { label: 'Rechnungssteller', value: 'Elektro Maier GmbH' },
              { label: 'Kundennummer', value: 'KD-20931' },
            ],
          },
          {
            type: 'actions',
            actions: [
              { label: 'Ansehen', url: 'https://rechnung.elektro-maier.example/2026-0815' },
            ],
          },
        ],
      });
    });

    it('maps an Order and shows its first item', () => {
      expect(toSpec(ORDER)).toStrictEqual({
        kind: 'Order',
        blocks: [
          { type: 'header', title: 'Bestellung BW-2026-10442 bei Baustoff Weber GmbH' },
          {
            type: 'rows',
            rows: [
              { icon: 'payments', label: 'Betrag', value: EURO('348,60') },
              {
                icon: 'shopping_cart',
                label: 'Artikel',
                value: 'Porenbeton-Planstein PP2 24 cm',
              },
              { label: 'Händler', value: 'Baustoff Weber GmbH' },
              { label: 'Bestellnummer', value: 'BW-2026-10442' },
            ],
          },
          {
            type: 'actions',
            actions: [
              {
                label: 'Ansehen',
                url: 'https://shop.baustoff-weber.example/bestellungen/BW-2026-10442',
              },
            ],
          },
        ],
      });
    });

    it('maps a ParcelDelivery and links to the tracking page', () => {
      expect(toSpec(PARCEL)).toStrictEqual({
        kind: 'ParcelDelivery',
        blocks: [
          { type: 'header', title: 'Bosch Bohrhammer GBH 2-26 von DHL' },
          {
            type: 'rows',
            rows: [
              {
                icon: 'schedule',
                label: 'Zustellung bis',
                value: { date: '2026-10-21T14:00:00+02:00' },
              },
              { icon: 'local_shipping', label: 'Paketdienst', value: 'DHL' },
              { icon: 'shopping_cart', label: 'Artikel', value: 'Bosch Bohrhammer GBH 2-26' },
              { label: 'Sendungsnummer', value: '00340434161234567890' },
            ],
          },
          {
            type: 'actions',
            actions: [
              {
                label: 'Sendung verfolgen',
                url: 'https://www.dhl.example/sendungsverfolgung?id=00340434161234567890',
              },
            ],
          },
        ],
      });
    });

    it('does not mark the link as primary and adds no feedback block', () => {
      for (const example of [OFFER, INVOICE, ORDER, PARCEL]) {
        const spec = toSpec(example);
        expect(spec?.blocks.map((block) => block.type)).toStrictEqual([
          'header',
          'rows',
          'actions',
        ]);
        const actions = spec?.blocks.find((block) => block.type === 'actions');
        expect(actions?.type === 'actions' && actions.actions[0]).not.toHaveProperty('primary');
      }
    });
  });

  describe('unmapped input', () => {
    it.each([
      ['an unmapped @type', { '@type': 'Event', name: 'Konzert' }],
      ['a type that is only in the prototype chain', { '@type': 'constructor' }],
      [
        'no @type',
        { name: 'Badsanierung', seller: { name: 'X' }, price: '1', priceCurrency: 'EUR' },
      ],
      ['an @type array', { ...OFFER, '@type': ['Offer'] }],
      ['an @type that is not a string', { ...OFFER, '@type': 7 }],
      ['a lowercase @type', { ...OFFER, '@type': 'offer' }],
      ['an @graph', { '@context': CONTEXT, '@graph': [OFFER] }],
      ['an array of objects', [OFFER]],
      ['a string', JSON.stringify(OFFER)],
      ['null', null],
      ['undefined', undefined],
    ])('returns null for %s', (_name, jsonLd) => {
      expect(toSpec(jsonLd)).toBeNull();
    });

    it('does not need an @context', () => {
      expect(toSpec(patched(OFFER, '@context'))).not.toBeNull();
    });
  });

  describe('required fields', () => {
    it.each([
      ['Offer', 'name', OFFER],
      ['Offer', 'seller.name', OFFER],
      ['Offer', 'price', OFFER],
      ['Offer', 'priceCurrency', OFFER],
      ['Invoice', 'provider.name', INVOICE],
      ['Invoice', 'totalPaymentDue.price', INVOICE],
      ['Invoice', 'totalPaymentDue.priceCurrency', INVOICE],
      ['Order', 'merchant.name', ORDER],
      ['Order', 'orderNumber', ORDER],
      ['ParcelDelivery', 'carrier.name', PARCEL],
      ['ParcelDelivery', 'expectedArrivalUntil', PARCEL],
    ])('returns null for a %s without %s', (_type, path, example) => {
      expect(toSpec(patched(example, path))).toBeNull();
    });

    it('returns null for a required object that is missing altogether', () => {
      expect(toSpec(patched(OFFER, 'seller'))).toBeNull();
      expect(toSpec(patched(INVOICE, 'totalPaymentDue'))).toBeNull();
      expect(toSpec(patched(PARCEL, 'carrier'))).toBeNull();
    });

    it('returns null when a required text is blank, or not a string', () => {
      expect(toSpec(patched(OFFER, 'name', ''))).toBeNull();
      expect(toSpec(patched(OFFER, 'seller.name', '   '))).toBeNull();
      expect(toSpec(patched(INVOICE, 'provider.name', 7))).toBeNull();
      expect(toSpec(patched(ORDER, 'orderNumber', null))).toBeNull();
      expect(toSpec(patched(ORDER, 'merchant', 'Baustoff Weber GmbH'))).toBeNull();
      expect(toSpec(patched(PARCEL, 'carrier.name', ['DHL']))).toBeNull();
    });

    it('returns null when a required amount is not usable', () => {
      expect(toSpec(patched(OFFER, 'price', 'zwei'))).toBeNull();
      expect(toSpec(patched(OFFER, 'price', ''))).toBeNull();
      expect(toSpec(patched(OFFER, 'price', '0x10'))).toBeNull();
      expect(toSpec(patched(OFFER, 'price', null))).toBeNull();
      expect(toSpec(patched(OFFER, 'price', { value: 1 }))).toBeNull();
      expect(toSpec(patched(INVOICE, 'totalPaymentDue.price', 'NaN'))).toBeNull();
      expect(toSpec(patched(INVOICE, 'totalPaymentDue.price', 'Infinity'))).toBeNull();
    });

    it('returns null for a currency Intl does not know instead of throwing', () => {
      expect(toSpec(patched(OFFER, 'priceCurrency', 'EURO'))).toBeNull();
      expect(toSpec(patched(OFFER, 'priceCurrency', '€'))).toBeNull();
      expect(toSpec(patched(OFFER, 'priceCurrency', 7))).toBeNull();
      expect(toSpec(patched(INVOICE, 'totalPaymentDue.priceCurrency', ''))).toBeNull();
    });

    it('returns null when the required arrival date is not a date', () => {
      expect(toSpec(patched(PARCEL, 'expectedArrivalUntil', 'bald'))).toBeNull();
      expect(toSpec(patched(PARCEL, 'expectedArrivalUntil', '2026-02-30'))).toBeNull();
      expect(toSpec(patched(PARCEL, 'expectedArrivalUntil', 20261021))).toBeNull();
    });

    it('accepts the arrival date as a date without a time', () => {
      expect(rowLabels(patched(PARCEL, 'expectedArrivalUntil', '2026-10-21'))).toContain(
        'Zustellung bis',
      );
    });
  });

  describe('optional fields', () => {
    it.each([
      ['Offer', 'priceValidUntil', 'Gültig bis', OFFER],
      ['Offer', 'identifier', 'Nummer', OFFER],
      ['Invoice', 'paymentDue', 'Fällig am', INVOICE],
      ['Invoice', 'accountId', 'Kundennummer', INVOICE],
      ['Order', 'price', 'Betrag', ORDER],
      ['Order', 'acceptedOffer', 'Artikel', ORDER],
      ['ParcelDelivery', 'itemShipped', 'Artikel', PARCEL],
      ['ParcelDelivery', 'trackingNumber', 'Sendungsnummer', PARCEL],
    ])('leaves out the row of a %s without %s', (_type, path, label, example) => {
      const all = rowLabels(example);
      expect(all).toContain(label);
      expect(rowLabels(patched(example, path))).toStrictEqual(all.filter((row) => row !== label));
    });

    it('leaves out an optional field that is blank or has the wrong type', () => {
      expect(rowLabels(patched(OFFER, 'identifier', '  '))).not.toContain('Nummer');
      expect(rowLabels(patched(OFFER, 'identifier', 4711))).not.toContain('Nummer');
      expect(rowLabels(patched(INVOICE, 'accountId', null))).not.toContain('Kundennummer');
      expect(rowLabels(patched(PARCEL, 'itemShipped.name', ''))).not.toContain('Artikel');
    });

    it('keeps the rest of the card when every optional field is missing', () => {
      const bare = {
        '@type': 'Offer',
        name: 'Badsanierung',
        seller: { name: 'X' },
        price: 10,
        priceCurrency: 'EUR',
      };
      expect(toSpec(bare)).toStrictEqual({
        kind: 'Offer',
        blocks: [
          { type: 'header', title: 'Badsanierung von X' },
          {
            type: 'rows',
            rows: [
              { icon: 'payments', label: 'Betrag', value: EURO('10,00') },
              { label: 'Anbieter', value: 'X' },
            ],
          },
        ],
      });
    });

    it('drops the date row of an optional date that does not exist, and keeps the rest', () => {
      const labels = rowLabels(patched(OFFER, 'priceValidUntil', '2026-02-30'));
      expect(labels).toStrictEqual(['Betrag', 'Anbieter', 'Nummer']);
      expect(rowLabels(patched(INVOICE, 'paymentDue', 'bald'))).not.toContain('Fällig am');
      expect(rowLabels(patched(INVOICE, 'paymentDue', 20261102))).not.toContain('Fällig am');
    });

    it('takes the first offer of an Order, and also a lone offer object', () => {
      const item = (jsonLd: unknown) => {
        const rows = toSpec(jsonLd)?.blocks.find((block) => block.type === 'rows');
        return rows?.type === 'rows'
          ? rows.rows.find((row) => row.label === 'Artikel')?.value
          : null;
      };
      const loneOffer = { '@type': 'Offer', itemOffered: { name: 'Dünnbettmörtel 25 kg' } };
      expect(item(patched(ORDER, 'acceptedOffer', loneOffer))).toBe('Dünnbettmörtel 25 kg');
      expect(item(patched(ORDER, 'acceptedOffer', []))).toBeUndefined();
      expect(item(patched(ORDER, 'acceptedOffer', ['Dünnbettmörtel 25 kg']))).toBeUndefined();
    });

    it('leaves out the Order amount when only one of price and currency is there', () => {
      expect(rowLabels(patched(ORDER, 'priceCurrency'))).not.toContain('Betrag');
      expect(rowLabels(patched(ORDER, 'priceCurrency', 'EURO'))).not.toContain('Betrag');
      expect(rowLabels(patched(ORDER, 'price', 'viel'))).not.toContain('Betrag');
    });

    it('titles a ParcelDelivery without an item by its carrier alone', () => {
      expect(toSpec(patched(PARCEL, 'itemShipped'))?.blocks[0]).toStrictEqual({
        type: 'header',
        title: 'Paket von DHL',
      });
    });
  });

  describe('amounts', () => {
    const amount = (jsonLd: unknown, locale?: string) => {
      const rows = jsonLdToSpec(jsonLd, TEST_MESSAGES, locale)?.blocks.find(
        (block) => block.type === 'rows',
      );
      return rows?.type === 'rows' ? rows.rows[0].value : null;
    };

    it('formats the amount with the locale', () => {
      expect(amount(OFFER, 'de-DE')).toBe(EURO('2.380,00'));
      expect(amount(OFFER, 'de-DE')).toBe('2.380,00\u00a0€');
      expect(amount(OFFER, 'en-US')).toBe('€2,380.00');
    });

    it('formats the amount with the default locale when none is given', () => {
      expect(amount(OFFER)).toBe(
        new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(2380),
      );
    });

    it('takes the price as a number or a numeric string, negative amounts included', () => {
      expect(amount(patched(OFFER, 'price', 2380), 'de-DE')).toBe(EURO('2.380,00'));
      expect(amount(patched(OFFER, 'price', '2380'), 'de-DE')).toBe(EURO('2.380,00'));
      expect(amount(patched(OFFER, 'price', '12.5'), 'de-DE')).toBe(EURO('12,50'));
      expect(amount(patched(INVOICE, 'totalPaymentDue.price', '-35.10'), 'de-DE')).toBe(
        EURO('-35,10'),
      );
      expect(amount(patched(OFFER, 'price', 0), 'de-DE')).toBe(EURO('0,00'));
    });

    it('uses the currency of the markup', () => {
      expect(amount(patched(OFFER, 'priceCurrency', 'CHF'), 'de-DE')).toBe('2.380,00\u00a0CHF');
    });
  });

  describe('links', () => {
    it.each([
      ['http', 'http://angebote.maler-kraus.example/A-2026-118'],
      ['javascript', 'javascript:alert(1)'],
      ['data', 'data:text/html,<b>x</b>'],
      ['relative', '/angebote/A-2026-118'],
      ['protocol-relative', '//angebote.maler-kraus.example/A-2026-118'],
      ['blank', '  '],
      ['non-string', 7],
    ])('drops a %s url, and the card stays', (_name, url) => {
      for (const example of [OFFER, INVOICE, ORDER]) {
        expect(hasActions(patched(example, 'url', url))).toBe(false);
        expect(toSpec(patched(example, 'url', url))).not.toBeNull();
      }
      expect(hasActions(patched(PARCEL, 'trackingUrl', url))).toBe(false);
      expect(toSpec(patched(PARCEL, 'trackingUrl', url))).not.toBeNull();
    });

    it('has no actions block without a link', () => {
      for (const [example, path] of [
        [OFFER, 'url'],
        [INVOICE, 'url'],
        [ORDER, 'url'],
        [PARCEL, 'trackingUrl'],
      ] as const) {
        expect(hasActions(patched(example, path))).toBe(false);
      }
    });

    it('ignores the potentialAction of a ParcelDelivery and uses trackingUrl', () => {
      const withTarget = patched(PARCEL, 'potentialAction', {
        '@type': 'TrackAction',
        target: 'https://gls-group.example/track/1',
      });
      expect(toSpec(withTarget)).toStrictEqual(toSpec(PARCEL));
    });
  });
});
