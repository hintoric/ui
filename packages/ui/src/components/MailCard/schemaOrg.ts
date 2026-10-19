/**
 * Turns schema.org markup (the JSON-LD Gmail reads from a mail) into the block spec `MailCard`
 * renders, so one card component serves both Core's workflow cards and plain markup.
 *
 * Four types are mapped: `Offer`, `Invoice`, `Order` and `ParcelDelivery`. The markup carries no
 * labels or titles, so those come from `messages`; the values are shown as the markup gives them,
 * apart from amounts (formatted with the locale) and dates (formatted later, by the renderer).
 *
 * A field the card cannot do without is *required*: when it is missing, or not usable, there is no
 * card (`null`). A field it can do without leaves out its row. The spec goes through `parseCardSpec`
 * on its way out, which is what keeps the rules for links (`https:` only) and dates in one place.
 */
import type { MailCardMessages } from './messages';
import { isIsoDate, isRecord, isText, parseCardSpec } from './spec';
import type { CardSpec, MailCardBlock, MailCardIconName, MailCardValue } from './spec';

type Messages = MailCardMessages['schemaOrg'];
type JsonLd = Record<string, unknown>;

/** A row whose value may be missing. A row without a value is left out. */
type Row = {
  readonly icon?: MailCardIconName;
  readonly label: string;
  readonly value: MailCardValue | undefined;
};

/** The property at `path` of `node`. `undefined` wherever the markup has no object to look in. */
const prop = (node: unknown, ...path: string[]): unknown =>
  path.reduce<unknown>((value, key) => (isRecord(value) ? value[key] : undefined), node);

/** A text field, exactly as given. Blank and non-string values count as missing. */
function text(node: unknown, ...path: string[]): string | undefined {
  const value = prop(node, ...path);
  return isText(value) ? value : undefined;
}

/** A date field, passed on unformatted. Anything that is not a date on the calendar is missing. */
function date(node: unknown, ...path: string[]): { readonly date: string } | undefined {
  const value = prop(node, ...path);
  return isIsoDate(value) ? { date: value } : undefined;
}

// schema.org writes a price as a plain decimal. `Number()` alone would also read '0x10' as 16 and
// the empty string as 0, and an amount that was never in the markup must not show up in a card.
const DECIMAL = /^-?\d+(\.\d+)?$/;

/** `price` and `priceCurrency` of `holder`, written the way `locale` writes money. */
function amount(holder: unknown, locale: string | undefined): string | undefined {
  const price = prop(holder, 'price');
  const currency = prop(holder, 'priceCurrency');
  const value =
    typeof price === 'string' ? (DECIMAL.test(price.trim()) ? Number(price) : NaN) : price;
  if (typeof value !== 'number' || !Number.isFinite(value) || !isText(currency)) return undefined;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    // `Intl` throws a RangeError for a currency code it cannot read (or a locale it cannot parse).
    return undefined;
  }
}

/** The title, the rows that have a value, and the one link of the card (when the markup has one). */
function toSpec(
  kind: string,
  title: string,
  rows: readonly Row[],
  link: { readonly label: string; readonly url: string | undefined },
): CardSpec | null {
  const blocks: MailCardBlock[] = [
    { type: 'header', title },
    {
      type: 'rows',
      rows: rows.flatMap(({ value, ...row }) => (value === undefined ? [] : [{ ...row, value }])),
    },
  ];
  // Not primary: Gmail draws these as text links, and so do we.
  if (link.url !== undefined) {
    blocks.push({ type: 'actions', actions: [{ label: link.label, url: link.url }] });
  }
  return parseCardSpec({ kind, blocks });
}

function mapOffer(node: JsonLd, m: Messages, locale: string | undefined): CardSpec | null {
  const name = text(node, 'name');
  const seller = text(node, 'seller', 'name');
  const price = amount(node, locale);
  if (name === undefined || seller === undefined || price === undefined) return null;

  return toSpec(
    'Offer',
    m.offerTitle({ name, seller }),
    [
      { icon: 'payments', label: m.labels.amount, value: price },
      { icon: 'schedule', label: m.labels.validUntil, value: date(node, 'priceValidUntil') },
      { label: m.labels.seller, value: seller },
      { label: m.labels.number, value: text(node, 'identifier') },
    ],
    { label: m.view, url: text(node, 'url') },
  );
}

function mapInvoice(node: JsonLd, m: Messages, locale: string | undefined): CardSpec | null {
  const provider = text(node, 'provider', 'name');
  const total = amount(prop(node, 'totalPaymentDue'), locale);
  if (provider === undefined || total === undefined) return null;

  return toSpec(
    'Invoice',
    m.invoiceTitle({ provider }),
    [
      { icon: 'payments', label: m.labels.amount, value: total },
      { icon: 'schedule', label: m.labels.dueDate, value: date(node, 'paymentDue') },
      { label: m.labels.provider, value: provider },
      { label: m.labels.account, value: text(node, 'accountId') },
    ],
    { label: m.view, url: text(node, 'url') },
  );
}

function mapOrder(node: JsonLd, m: Messages, locale: string | undefined): CardSpec | null {
  const merchant = text(node, 'merchant', 'name');
  const orderNumber = text(node, 'orderNumber');
  if (merchant === undefined || orderNumber === undefined) return null;

  // One offer per item. The card shows the first; schema.org allows a lone offer object as well.
  const offer = Array.isArray(node.acceptedOffer) ? node.acceptedOffer[0] : node.acceptedOffer;

  return toSpec(
    'Order',
    m.orderTitle({ merchant, orderNumber }),
    [
      { icon: 'payments', label: m.labels.amount, value: amount(node, locale) },
      { icon: 'shopping_cart', label: m.labels.item, value: text(offer, 'itemOffered', 'name') },
      { label: m.labels.merchant, value: merchant },
      { label: m.labels.orderNumber, value: orderNumber },
    ],
    { label: m.view, url: text(node, 'url') },
  );
}

function mapParcelDelivery(node: JsonLd, m: Messages): CardSpec | null {
  const carrier = text(node, 'carrier', 'name');
  const arrival = date(node, 'expectedArrivalUntil');
  if (carrier === undefined || arrival === undefined) return null;

  const item = text(node, 'itemShipped', 'name');

  return toSpec(
    'ParcelDelivery',
    m.parcelTitle(item === undefined ? { carrier } : { carrier, item }),
    [
      { icon: 'schedule', label: m.labels.expectedArrival, value: arrival },
      { icon: 'local_shipping', label: m.labels.carrier, value: carrier },
      { icon: 'shopping_cart', label: m.labels.item, value: item },
      { label: m.labels.trackingNumber, value: text(node, 'trackingNumber') },
    ],
    { label: m.track, url: text(node, 'trackingUrl') },
  );
}

/**
 * Maps one schema.org object to a `CardSpec`, or returns `null` when it is not a card: a type this
 * does not map, or a required field that is missing or unusable. The caller renders nothing then.
 *
 * `@type` decides; `@context` is not required. An `@type` array and an `@graph` are not supported
 * yet and count as an unmapped type. Never throws on malformed input.
 *
 * @param messages Labels, titles and link texts in the reader's language (the package has none).
 * @param locale Formats the amounts. The runtime's default when omitted.
 */
export function jsonLdToSpec(
  jsonLd: unknown,
  messages: Messages,
  locale?: string,
): CardSpec | null {
  if (!isRecord(jsonLd)) return null;
  switch (jsonLd['@type']) {
    case 'Offer':
      return mapOffer(jsonLd, messages, locale);
    case 'Invoice':
      return mapInvoice(jsonLd, messages, locale);
    case 'Order':
      return mapOrder(jsonLd, messages, locale);
    case 'ParcelDelivery':
      return mapParcelDelivery(jsonLd, messages);
    default:
      return null;
  }
}
