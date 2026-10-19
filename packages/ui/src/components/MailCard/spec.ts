/**
 * The block description of a mail card, and the parser that turns untrusted JSON into one.
 *
 * Core (the backend) sends card JSON; this package renders it. The contract Core checks its answers
 * against is `card-spec.schema.json` next to this file. The schema is strict, the parser lenient:
 * Core must send exactly what the schema says, while a client keeps working when a newer Core sends
 * something it does not know yet. So the parser drops what it cannot use instead of throwing, and
 * copies only the keys it knows — nothing the backend adds ever reaches the renderer.
 *
 * Whatever the schema accepts passes the parser unchanged, with one exception: a date that is not
 * on the calendar (2026-02-30). Every field of it is in range, so the schema's pattern accepts it,
 * and JSON Schema cannot express "this day exists in this month". The parser drops it. Keep the two
 * in step: the tables in `spec.test.ts` fail when they drift apart.
 */

/** The icons a row can show. The renderer maps each name to a Material Symbol. */
export const MAIL_CARD_ICON_NAMES = [
  'person',
  'event',
  'place',
  'payments',
  'schedule',
  'shopping_cart',
  'local_shipping',
  'receipt',
  'confirmation_number',
  'store',
  'description',
] as const;

export const MAIL_CARD_STATUS_TONES = ['neutral', 'success', 'warning', 'danger'] as const;

export type MailCardIconName = (typeof MAIL_CARD_ICON_NAMES)[number];
export type MailCardStatusTone = (typeof MAIL_CARD_STATUS_TONES)[number];

/** Text, or a point in time to format for the reader. The date is ISO 8601: a date or a date-time. */
export type MailCardValue = string | { readonly date: string };

export type MailCardRowData = {
  readonly icon?: MailCardIconName;
  readonly label: string;
  readonly value: MailCardValue;
};

/** A variant behind the arrow of the primary button. Approving it up front grants later workflow steps. */
export type MailCardAlternative = {
  readonly label: string;
  readonly hint?: string;
  readonly preapprove: readonly string[];
};

/** A link (`https:` only) or an offer, which starts or resumes the workflow behind the card. */
export type MailCardActionData = {
  readonly label: string;
  readonly primary?: boolean;
  readonly alternatives?: readonly MailCardAlternative[];
} & ({ readonly url: string } | { readonly offer: true });

export type MailCardBlock =
  | { readonly type: 'header'; readonly title: string; readonly subtitle?: string }
  | { readonly type: 'rows'; readonly rows: readonly MailCardRowData[] }
  | { readonly type: 'actions'; readonly actions: readonly MailCardActionData[] }
  | { readonly type: 'feedback'; readonly question: string }
  | { readonly type: 'status'; readonly label: string; readonly tone: MailCardStatusTone };

export type CardSpec = { readonly kind: string; readonly blocks: readonly MailCardBlock[] };

type Json = Record<string, unknown>;

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A string with something to show: empty and whitespace-only strings paint nothing. */
const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

const isIconName = (value: unknown): value is MailCardIconName =>
  (MAIL_CARD_ICON_NAMES as readonly unknown[]).includes(value);

const isTone = (value: unknown): value is MailCardStatusTone =>
  (MAIL_CARD_STATUS_TONES as readonly unknown[]).includes(value);

// `https://` and a host, no whitespace. Case-sensitive on purpose: it is the schema's pattern, and
// a scheme that is not spelled exactly like this is not worth guessing at.
const HTTPS_URL = /^https:\/\/[^\s/?#]\S*$/;

// A date, or a date-time with optional seconds and zone. Ranges are checked here, and the calendar
// in `isIsoDate`, because `Intl` throws on a date it cannot read (or a browser rolls 2026-02-31
// over to March, which shows a value the input never said). Either would turn one bad row into a
// broken or wrong card.
const ISO_DATE =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)?)?$/;

/** An ISO 8601 date or date-time whose day exists in its month (leap years included). */
function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  // `setUTCFullYear` rather than `Date.UTC`, which maps years 0 to 99 onto 1900 to 1999.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Parses each entry of `items` (if it is an array) and keeps what survives. */
function parseEach<T>(items: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => parse(item) ?? []);
}

function parseValue(value: unknown): MailCardValue | null {
  if (isText(value)) return value;
  if (isRecord(value) && isIsoDate(value.date)) return { date: value.date };
  return null;
}

function parseRow(raw: unknown): MailCardRowData | null {
  if (!isRecord(raw) || !isText(raw.label)) return null;
  const value = parseValue(raw.value);
  if (value === null) return null;
  return isIconName(raw.icon)
    ? { icon: raw.icon, label: raw.label, value }
    : { label: raw.label, value };
}

function parseAlternative(raw: unknown): MailCardAlternative | null {
  if (!isRecord(raw) || !isText(raw.label) || !Array.isArray(raw.preapprove)) return null;
  const preapprove = raw.preapprove.filter(
    (step): step is string => typeof step === 'string' && step !== '',
  );
  if (preapprove.length === 0) return null;
  return isText(raw.hint)
    ? { label: raw.label, hint: raw.hint, preapprove }
    : { label: raw.label, preapprove };
}

function parseAction(raw: unknown): MailCardActionData | null {
  if (!isRecord(raw) || !isText(raw.label)) return null;

  const alternatives = parseEach(raw.alternatives, parseAlternative);
  const common = {
    label: raw.label,
    ...(typeof raw.primary === 'boolean' ? { primary: raw.primary } : {}),
    ...(alternatives.length > 0 ? { alternatives } : {}),
  };

  // A link and an offer are different things. An action that claims to be both is invalid, and
  // dropping it is the safe reading: a `javascript:` url must never survive as "just an offer".
  if (raw.offer === true) return raw.url === undefined ? { ...common, offer: true } : null;
  return typeof raw.url === 'string' && HTTPS_URL.test(raw.url)
    ? { ...common, url: raw.url }
    : null;
}

function parseBlock(raw: unknown): MailCardBlock | null {
  if (!isRecord(raw)) return null;
  switch (raw.type) {
    case 'header':
      if (!isText(raw.title)) return null;
      return isText(raw.subtitle)
        ? { type: 'header', title: raw.title, subtitle: raw.subtitle }
        : { type: 'header', title: raw.title };
    case 'rows': {
      const rows = parseEach(raw.rows, parseRow);
      return rows.length > 0 ? { type: 'rows', rows } : null;
    }
    case 'actions': {
      const actions = parseEach(raw.actions, parseAction);
      return actions.length > 0 ? { type: 'actions', actions } : null;
    }
    case 'feedback':
      return isText(raw.question) ? { type: 'feedback', question: raw.question } : null;
    case 'status':
      return isText(raw.label) && isTone(raw.tone)
        ? { type: 'status', label: raw.label, tone: raw.tone }
        : null;
    default:
      return null;
  }
}

/**
 * Turns whatever arrived into a `CardSpec`, or `null` when there is nothing to show.
 *
 * Never throws. Unknown block types, malformed rows and actions, and links that are not `https:`
 * are dropped; the rest of the card stays. A card without a header with a title is not a card —
 * `null`, so the caller renders nothing instead of a headless fragment.
 */
export function parseCardSpec(input: unknown): CardSpec | null {
  if (!isRecord(input) || !isText(input.kind)) return null;
  const blocks = parseEach(input.blocks, parseBlock);
  if (!blocks.some((block) => block.type === 'header')) return null;
  return { kind: input.kind, blocks };
}
