import { useState } from 'react';
import {
  Button,
  MailCard,
  MailCardAction,
  MailCardFeedback,
  MailCardFooter,
  MailCardHeader,
  MailCardRow,
  MailCardRows,
  Typography,
  parseCardSpec,
  useColorScheme,
} from '@hintoric/ui';
import type { CardSpec, MailCardAlternative, MailCardMessages, MailCardProps } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { CodeBlock } from '../components/CodeBlock';
import { PropsTable } from '../components/PropsTable';
import { SegmentedToggle } from '../components/SegmentedToggle';

type Theme = NonNullable<MailCardProps['theme']>;

// The package ships no texts: these are the host's, in the reader's language.
const MESSAGES_DE: MailCardMessages = {
  moreActions: 'Weitere Aktionen anzeigen',
  feedbackYes: 'Als richtig bewerten',
  feedbackNo: 'Als falsch bewerten',
  feedbackThanks: 'Danke, deine Rückmeldung wurde gesendet.',
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
    offerTitle: ({ name, seller }) => `Angebot von ${seller}: ${name}`,
    invoiceTitle: ({ provider }) => `Rechnung von ${provider}`,
    orderTitle: ({ merchant, orderNumber }) => `Bestellung ${orderNumber} bei ${merchant}`,
    parcelTitle: ({ carrier, item }) =>
      item ? `Lieferung mit ${carrier}: ${item}` : `Lieferung mit ${carrier}`,
    view: 'Ansehen',
    track: 'Sendung verfolgen',
  },
};

const MESSAGES_CODE = `const messages: MailCardMessages = {
  moreActions: 'Weitere Aktionen anzeigen',
  feedbackYes: 'Als richtig bewerten',
  feedbackNo: 'Als falsch bewerten',
  feedbackThanks: 'Danke, deine Rückmeldung wurde gesendet.',
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
    // Functions, because word order differs between languages.
    offerTitle: ({ name, seller }) => \`Angebot von \${seller}: \${name}\`,
    invoiceTitle: ({ provider }) => \`Rechnung von \${provider}\`,
    orderTitle: ({ merchant, orderNumber }) => \`Bestellung \${orderNumber} bei \${merchant}\`,
    parcelTitle: ({ carrier, item }) =>
      item ? \`Lieferung mit \${carrier}: \${item}\` : \`Lieferung mit \${carrier}\`,
    view: 'Ansehen',
    track: 'Sendung verfolgen',
  },
};`;

// The card from the mail-cards spec, as Core sends it.
const WOHNUNGSGEBER = {
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

// The same card once the offer ran: a status in place of the actions.
const WOHNUNGSGEBER_DONE = {
  ...WOHNUNGSGEBER,
  blocks: [
    ...WOHNUNGSGEBER.blocks.filter((block) => block.type !== 'actions'),
    { type: 'status', label: 'Bestätigung wurde ausgestellt und versendet.', tone: 'success' },
  ],
};

// What Core sends is untrusted JSON: parsed once, then rendered. The examples are valid, so the
// parser hands them back unchanged.
const SPEC = parseCardSpec(WOHNUNGSGEBER) as CardSpec;
const SPEC_DONE = parseCardSpec(WOHNUNGSGEBER_DONE) as CardSpec;

// schema.org markup as a mail carries it (JSON-LD), one per mapped type.
const OFFER = {
  '@context': 'http://schema.org',
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
  '@context': 'http://schema.org',
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
  '@context': 'http://schema.org',
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
  '@context': 'http://schema.org',
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

const json = (value: unknown) => JSON.stringify(value, null, 2);

type SharedProps = Omit<MailCardProps, 'spec' | 'jsonLd' | 'children'>;

/** A schema.org example: the card, and the markup it was made from. */
function SchemaOrgExample({ jsonLd, shared }: { jsonLd: object; shared: SharedProps }) {
  return (
    <>
      <Demo>
        <MailCard jsonLd={jsonLd} {...shared} />
      </Demo>
      <CodeBlock language="javascript">{json(jsonLd)}</CodeBlock>
    </>
  );
}

export function MailCardPage() {
  const { resolvedMode, setMode } = useColorScheme();
  const [theme, setTheme] = useState<Theme>('joy');
  // A new key gives a fresh card, as a new mail does: the feedback answer is the card's own state.
  const [mail, setMail] = useState(0);
  const [lastCall, setLastCall] = useState<string>();

  // What every demo shares. The scheme is the page's, as a host passes its own: the extension
  // reads Gmail's and hands it over.
  const shared = {
    theme,
    colorScheme: resolvedMode,
    messages: MESSAGES_DE,
    locale: 'de-DE',
    onOffer: (alternative?: MailCardAlternative) =>
      setLastCall(alternative ? `onOffer(${json(alternative.label)})` : 'onOffer()'),
    onFeedback: (answer: 'yes' | 'no') => setLastCall(`onFeedback(${json(answer)})`),
  } satisfies SharedProps;

  return (
    <>
      <h1>MailCard</h1>
      <p className="docs-lede">
        A card at a mail, in the layout of Gmail&rsquo;s own cards: a header with the Hintoric mark,
        rows of label and value in two columns, and a footer with a feedback question and the
        actions, or a status once they ran. Hintoric&rsquo;s Chrome extension shows it at a mail in
        Gmail, inside a shadow root. It takes Core&rsquo;s block JSON, a schema.org object from the
        mail, or blocks composed in JSX.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <SegmentedToggle<Theme>
          aria-label="Theme"
          value={theme}
          options={[
            { value: 'joy', label: 'joy' },
            { value: 'google', label: 'google' },
          ]}
          onChange={setTheme}
        />
        <SegmentedToggle<'light' | 'dark'>
          aria-label="Color scheme"
          value={resolvedMode}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          onChange={setMode}
        />
      </div>
      <p>
        The theme switch applies to every card on this page. The scheme switch sets the docs&rsquo;
        own scheme, and the cards get it through <code>colorScheme</code>, the way a host passes its
        page&rsquo;s scheme.
      </p>

      <h2>From Core&rsquo;s block JSON</h2>
      <p>
        Core sends a card as a list of blocks: <code>header</code>, <code>rows</code>,{' '}
        <code>actions</code>, <code>feedback</code> and <code>status</code>. The JSON is untrusted,
        so it goes through <code>parseCardSpec</code> first, which drops what it cannot use: unknown
        blocks, broken rows, and every link that is not <code>https:</code>. A spec without a header
        renders nothing — never a broken card.
      </p>
      <p>
        A primary <code>offer</code> with <code>alternatives</code> becomes a split button: the main
        part calls <code>onOffer()</code>, an item of the menu behind the arrow calls{' '}
        <code>onOffer(alternative)</code>. The menu opens upwards, inside the card.
      </p>
      <Demo>
        <MailCard key={mail} spec={SPEC} {...shared} />
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setMail((n) => n + 1)}
          >
            Next mail
          </Button>
          <Typography level="body-sm">
            {lastCall ? (
              <>
                Last call: <code>{lastCall}</code>
              </>
            ) : (
              'Use the button, the menu or the feedback to see the callbacks.'
            )}
          </Typography>
        </div>
      </Demo>
      <CodeBlock language="javascript">{json(WOHNUNGSGEBER)}</CodeBlock>
      <Code>{`import { MailCard, parseCardSpec } from '@hintoric/ui';

const spec = parseCardSpec(await response.json()); // null if there is no card

{spec && (
  <MailCard
    key={messageId}
    spec={spec}
    theme="google"
    colorScheme={gmailScheme}
    messages={messages}
    onOffer={(alternative) => startWorkflow(alternative?.preapprove)}
    onFeedback={(answer) => sendFeedback(answer)}
  />
)}`}</Code>

      <h3>A status in place of the actions</h3>
      <p>
        Once the offer ran, the card comes with a <code>status</code> block. It takes the
        actions&rsquo; place in the footer, at the same height, so the card does not jump. Its{' '}
        <code>tone</code> is <code>neutral</code>, <code>success</code>, <code>warning</code> or{' '}
        <code>danger</code>.
      </p>
      <Demo>
        <MailCard spec={SPEC_DONE} {...shared} />
      </Demo>
      <CodeBlock language="javascript">
        {json({
          type: 'status',
          label: 'Bestätigung wurde ausgestellt und versendet.',
          tone: 'success',
        })}
      </CodeBlock>

      <h2>From schema.org markup</h2>
      <p>
        <code>jsonLd</code> takes the schema.org object a mail carries, and{' '}
        <code>jsonLdToSpec</code> maps it to blocks. Four types are mapped: <code>Offer</code>,{' '}
        <code>Invoice</code>, <code>Order</code> and <code>ParcelDelivery</code>. The markup has no
        labels or titles, so those come from <code>messages.schemaOrg</code>; amounts are written
        with <code>locale</code>, and the link is a text link. Any other type, or one that lacks a
        required field, renders nothing.
      </p>
      <h3>Offer</h3>
      <SchemaOrgExample jsonLd={OFFER} shared={shared} />

      <h3>Invoice</h3>
      <SchemaOrgExample jsonLd={INVOICE} shared={shared} />

      <h3>Order</h3>
      <p>An order shows its first item.</p>
      <SchemaOrgExample jsonLd={ORDER} shared={shared} />

      <h3>ParcelDelivery</h3>
      <SchemaOrgExample jsonLd={PARCEL} shared={shared} />

      <Code>{`<MailCard jsonLd={jsonLdFromTheMail} messages={messages} locale="de-DE" />`}</Code>

      <h2>Composed in JSX</h2>
      <p>
        The blocks are components of their own, for a card that is not described by JSON. Inside a{' '}
        <code>MailCard</code> they take <code>messages</code>, <code>locale</code> and the callbacks
        from the card. In the footer the feedback goes first and keeps to the left; the actions line
        up on the right.
      </p>
      <Demo>
        <MailCard {...shared}>
          <MailCardHeader
            title="Rechnung von Elektro Maier GmbH"
            subtitle="Elektroinstallation Küche"
          />
          <MailCardRows>
            <MailCardRow icon="payments" label="Betrag" value="1.428,00 €" />
            <MailCardRow icon="schedule" label="Fällig am" value={{ date: '2026-11-02' }} />
          </MailCardRows>
          <MailCardFooter>
            <MailCardFeedback question="Ist das richtig?" />
            <MailCardAction
              action={{
                label: 'Rechnung ansehen',
                url: 'https://rechnung.elektro-maier.example/2026-0815',
              }}
            />
            <MailCardAction action={{ label: 'Zahlung vormerken', offer: true, primary: true }} />
          </MailCardFooter>
        </MailCard>
      </Demo>
      <Code>{`<MailCard messages={messages} onOffer={onOffer} onFeedback={onFeedback}>
  <MailCardHeader title="Rechnung von Elektro Maier GmbH" subtitle="Elektroinstallation Küche" />
  <MailCardRows>
    <MailCardRow icon="payments" label="Betrag" value="1.428,00\u00a0€" />
    <MailCardRow icon="schedule" label="Fällig am" value={{ date: '2026-11-02' }} />
  </MailCardRows>
  <MailCardFooter>
    <MailCardFeedback question="Ist das richtig?" />
    <MailCardAction action={{ label: 'Rechnung ansehen', url: 'https://…' }} />
    <MailCardAction action={{ label: 'Zahlung vormerken', offer: true, primary: true }} />
  </MailCardFooter>
</MailCard>`}</Code>

      <h2>Messages</h2>
      <p>
        The library ships no texts. Everything the card shows that is not in its input comes through{' '}
        <code>messages</code>, in the reader&rsquo;s language: the name of the arrow, the names of
        the thumbs, the thanks after an answer, and the labels and titles of schema.org cards. The
        values are shown as the input says; the card only formats dates and amounts.
      </p>
      <Code>{MESSAGES_CODE}</Code>

      <h2>Themes</h2>
      <p>
        <code>joy</code> (the default) paints with the library&rsquo;s tokens, like a{' '}
        <code>Card</code> with a solid primary <code>Button</code>. <code>google</code> uses
        Gmail&rsquo;s measured colours and its font. Both share one box — the same padding, corners,
        line heights and card height — so switching the theme or the scheme does not move the
        layout; only the two fonts set a word to different widths.
      </p>
      <p>
        The dark values of <code>google</code> are provisional: they are Gmail&rsquo;s own dark
        tokens, read from its stylesheet, not yet measured on a Gmail in its dark theme.
      </p>

      <h2>JSON Schema for the backend</h2>
      <p>
        The contract for Core is the JSON Schema of <code>CardSpec</code>, shipped as{' '}
        <code>@hintoric/ui/card-spec.schema.json</code>. The schema is strict: Core checks every
        card it sends against it. The parser is lenient: a client keeps working when a newer Core
        sends a block it does not know yet.
      </p>
      <p>
        Outside JavaScript, the file is at{' '}
        <code>node_modules/@hintoric/ui/src/components/MailCard/card-spec.schema.json</code>. Its
        patterns are ECMA-262 regular expressions, as JSON Schema defines them.
      </p>
      <Code>{`import schema from '@hintoric/ui/card-spec.schema.json' with { type: 'json' };
import Ajv from 'ajv/dist/2020';

const validate = new Ajv().compile(schema);
if (!validate(card)) throw new Error(JSON.stringify(validate.errors));`}</Code>

      <h2>In the host</h2>
      <ul>
        <li>
          <strong>Placing the card is the host&rsquo;s job.</strong> <code>MailCard</code> has no
          outer margin. In Gmail, the measured margin of a card is <code>8px 0 16px 16px</code>; the
          host sets it on the element it mounts the card in.
        </li>
        <li>
          <strong>Key the card per mail.</strong> The feedback answer is the card&rsquo;s own state
          and outlives a new <code>spec</code>. With <code>{'key={messageId}'}</code> the next mail
          asks its question afresh (<em>Next mail</em> above).
        </li>
        <li>
          <strong>Pass the scheme.</strong> <code>colorScheme=&quot;dark&quot;</code> alone turns
          the card dark, with no <code>ColorSchemeProvider</code>, so it works in a shadow root.
          Without it the card follows the provider above it. A <code>joy</code> card cannot be light
          inside a dark page: the library&rsquo;s light tokens live only on <code>:root</code>.
        </li>
        <li>
          <strong>Do not clip it.</strong> Nothing is portalled: the menu of the split button is
          inside the card and opens upwards over the rows, so the host must not cut the card off
          with <code>overflow: hidden</code>.
        </li>
      </ul>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'spec',
            type: 'CardSpec',
            description:
              'The card as blocks, after parseCardSpec. Ignored when there are children.',
          },
          {
            name: 'jsonLd',
            type: 'unknown',
            description:
              'A schema.org object, mapped with jsonLdToSpec. Ignored when there are children or a spec.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'The card composed from the MailCard* blocks. Wins over spec and jsonLd.',
          },
          {
            name: 'messages',
            type: 'MailCardMessages',
            description: 'Every string the card shows that is not in its input. Required.',
          },
          {
            name: 'theme',
            type: "'joy' | 'google'",
            default: "'joy'",
            description: 'Whose look: the library’s tokens, or Gmail’s measured values.',
          },
          {
            name: 'colorScheme',
            type: "'light' | 'dark'",
            description:
              'The scheme to paint in. Without it, the ColorSchemeProvider’s; with neither, joy follows the page and google is light.',
          },
          {
            name: 'provider',
            type: "'google'",
            default: "'google'",
            description: 'Whose layout the blocks follow.',
          },
          {
            name: 'locale',
            type: 'string',
            description: 'Formats dates and amounts. Falls back to the DateTimeProvider’s locale.',
          },
          {
            name: 'showLogo',
            type: 'boolean',
            default: 'true',
            description:
              'The Hintoric mark in front of the title. Without it the text keeps its edge.',
          },
          {
            name: 'onOffer',
            type: '(alternative?: MailCardAlternative) => void',
            description:
              'Called by an offer action; with the chosen variant from the menu of a split button.',
          },
          {
            name: 'onFeedback',
            type: "(answer: 'yes' | 'no') => void",
            description: 'Called once with the answer to the feedback question.',
          },
          { name: 'className', type: 'string', description: 'Extra classes on the card root.' },
        ]}
      />
    </>
  );
}
