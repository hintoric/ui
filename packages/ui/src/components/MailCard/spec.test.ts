import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import schema from './card-spec.schema.json';
import { WOHNUNGSGEBER_EXAMPLE } from './examples';
import { MAIL_CARD_ICON_NAMES, MAIL_CARD_STATUS_TONES, parseCardSpec } from './spec';

const header = { type: 'header', title: 'Titel' } as const;

/** A card around `blocks`, so each test only spells out the block it is about. */
const card = (...blocks: unknown[]) => ({ kind: 'workflow', blocks: [header, ...blocks] });

/** What reaches the client is parsed JSON, never a typed literal. */
const overTheWire = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe('parseCardSpec', () => {
  it('accepts the Wohnungsgeberbestätigung example', () => {
    const example = overTheWire(WOHNUNGSGEBER_EXAMPLE);
    expect(parseCardSpec(example)).toStrictEqual(example);
  });

  it('drops unknown blocks and keeps the rest', () => {
    const feedback = { type: 'feedback', question: 'Ist das richtig?' };
    expect(
      parseCardSpec(card({ type: 'carousel', items: [] }, feedback, 'not a block', null, 7)),
    ).toStrictEqual(card(feedback));
  });

  it('returns null when `blocks` is not an array or holds no object', () => {
    expect(parseCardSpec({ kind: 'w', blocks: header })).toBeNull();
    expect(parseCardSpec({ kind: 'w', blocks: [[header]] })).toBeNull();
  });

  describe('rows', () => {
    it('drops rows without label or value, and unknown icons', () => {
      expect(
        parseCardSpec(
          card({
            type: 'rows',
            rows: [
              { label: 'X' },
              { value: 'y' },
              { icon: 'rocket', label: 'A', value: 'b' },
              { icon: 'place', label: 'C', value: 'd' },
            ],
          }),
        ),
      ).toStrictEqual(
        card({
          type: 'rows',
          rows: [
            { label: 'A', value: 'b' },
            { icon: 'place', label: 'C', value: 'd' },
          ],
        }),
      );
    });

    it('drops rows whose label or value has the wrong type or is blank', () => {
      const bad = [
        { label: 1, value: 'a' },
        { label: 'a', value: 1 },
        { label: 'a', value: null },
        { label: 'a', value: ['b'] },
        { label: '  ', value: 'a' },
        { label: 'a', value: '' },
      ];
      expect(
        parseCardSpec(card({ type: 'rows', rows: [...bad, { label: 'ok', value: 'ok' }] })),
      ).toStrictEqual(card({ type: 'rows', rows: [{ label: 'ok', value: 'ok' }] }));
    });

    it('drops rows whose date is not an ISO 8601 date or date-time, or not on the calendar', () => {
      const dates = [
        '2026-11-01',
        '2026-11-01T09:30',
        '2026-11-01T09:30:15Z',
        '2026-11-01T09:30:15.250+01:00',
        '2028-02-29',
        '2000-02-29',
        '2026-02-28',
        '2026-04-30',
        '2026-12-31',
      ];
      const bad = [
        '1. Nov. 2026',
        '01.11.2026',
        '2026-13-01',
        '2026-11-32',
        '2026-11-01T24:00',
        '',
        // Calendar-impossible: each field is in range, the day is not in that month.
        '2026-02-29',
        '2026-02-30',
        '2026-02-31',
        '2026-04-31',
        '2026-06-31',
        '2026-09-31',
        '2026-11-31',
        '1900-02-29',
        '2026-02-30T10:00:00Z',
      ];
      const rows = (values: string[]) =>
        values.map((date) => ({ label: 'Einzug', value: { date } }));
      expect(
        parseCardSpec(card({ type: 'rows', rows: [...rows(bad), ...rows(dates)] })),
      ).toStrictEqual(card({ type: 'rows', rows: rows(dates) }));
      expect(
        parseCardSpec(card({ type: 'rows', rows: [{ label: 'a', value: { date: 20261101 } }] })),
      ).toStrictEqual(card());
    });

    it('drops a rows block that is empty after dropping its rows', () => {
      expect(parseCardSpec(card({ type: 'rows', rows: [{ label: 'X' }] }))).toStrictEqual(card());
      expect(parseCardSpec(card({ type: 'rows', rows: [] }))).toStrictEqual(card());
      expect(parseCardSpec(card({ type: 'rows' }))).toStrictEqual(card());
    });

    it('accepts every icon name and no other', () => {
      const rows = MAIL_CARD_ICON_NAMES.map((icon) => ({ icon, label: icon, value: 'v' }));
      expect(parseCardSpec(card({ type: 'rows', rows }))).toStrictEqual(
        card({ type: 'rows', rows }),
      );
    });
  });

  describe('actions', () => {
    it('drops actions whose url is not https', () => {
      const action = (url: string) => ({ label: 'Öffnen', url });
      const parsed = parseCardSpec(
        card({
          type: 'actions',
          actions: [
            action('javascript:alert(1)'),
            action('http://x'),
            action('/relative'),
            action('//hintoric.com/protocol-relative'),
            action('data:text/html,<b>x</b>'),
            action('HTTPS://hintoric.com/upper'),
            action(' https://hintoric.com/leading-space'),
            action('https://'),
            action('https://hintoric.com/a'),
          ],
        }),
      );
      expect(parsed).toStrictEqual(
        card({ type: 'actions', actions: [action('https://hintoric.com/a')] }),
      );
    });

    it('drops an action whose url is not a string', () => {
      expect(
        parseCardSpec(
          card({ type: 'actions', actions: [{ label: 'a', url: { href: 'https://x.de' } }] }),
        ),
      ).toStrictEqual(card());
    });

    it('keeps an offer action and drops one that is neither a link nor an offer', () => {
      expect(
        parseCardSpec(
          card({
            type: 'actions',
            actions: [
              { label: 'Starten', offer: true },
              { label: 'Nichts' },
              { label: 'Kein Angebot', offer: false },
              { label: 'Zeichenkette', offer: 'true' },
            ],
          }),
        ),
      ).toStrictEqual(card({ type: 'actions', actions: [{ label: 'Starten', offer: true }] }));
    });

    it('drops an action that is both a link and an offer, since it is ambiguous', () => {
      const both = { label: 'Beides', url: 'https://hintoric.com/a', offer: true };
      const neverALink = { label: 'Unsicher', url: 'javascript:alert(1)', offer: true };
      expect(parseCardSpec(card({ type: 'actions', actions: [both, neverALink] }))).toStrictEqual(
        card(),
      );
    });

    it('drops an action without a label', () => {
      expect(
        parseCardSpec(
          card({
            type: 'actions',
            actions: [{ offer: true }, { label: '', offer: true }, { label: ' ', offer: true }],
          }),
        ),
      ).toStrictEqual(card());
    });

    it('drops an actions block that is empty after dropping its actions', () => {
      expect(
        parseCardSpec(card({ type: 'actions', actions: [{ label: 'a', url: 'http://x' }] })),
      ).toStrictEqual(card());
      expect(parseCardSpec(card({ type: 'actions', actions: [] }))).toStrictEqual(card());
    });

    it('keeps `primary` only when it is a boolean', () => {
      const parsed = parseCardSpec(
        card({
          type: 'actions',
          actions: [
            { label: 'a', offer: true, primary: true },
            { label: 'b', offer: true, primary: false },
            { label: 'c', offer: true, primary: 'yes' },
            { label: 'd', offer: true, primary: 1 },
          ],
        }),
      );
      expect(parsed).toStrictEqual(
        card({
          type: 'actions',
          actions: [
            { label: 'a', offer: true, primary: true },
            { label: 'b', offer: true, primary: false },
            { label: 'c', offer: true },
            { label: 'd', offer: true },
          ],
        }),
      );
    });

    it('drops alternatives without preapprove strings', () => {
      const parsed = parseCardSpec(
        card({
          type: 'actions',
          actions: [
            {
              label: 'Ausstellen',
              offer: true,
              alternatives: [
                { label: 'ohne Feld' },
                { label: 'leer', preapprove: [] },
                { label: 'nur Zahlen', preapprove: [1, null, {}] },
                { label: 'kein Array', preapprove: 'send_reply' },
                { preapprove: ['send_reply'] },
                {
                  label: 'gemischt',
                  hint: 'Hinweis',
                  preapprove: ['send_reply', 7, '', 'save_draft'],
                },
              ],
            },
          ],
        }),
      );
      expect(parsed).toStrictEqual(
        card({
          type: 'actions',
          actions: [
            {
              label: 'Ausstellen',
              offer: true,
              alternatives: [
                { label: 'gemischt', hint: 'Hinweis', preapprove: ['send_reply', 'save_draft'] },
              ],
            },
          ],
        }),
      );
    });

    it('omits `alternatives` when none survive, and keeps a hint only when it is a string', () => {
      const action = (alternatives: unknown) => ({
        type: 'actions',
        actions: [{ label: 'Ausstellen', offer: true, alternatives }],
      });
      expect(parseCardSpec(card(action([{ label: 'x', preapprove: [] }])))).toStrictEqual(
        card({ type: 'actions', actions: [{ label: 'Ausstellen', offer: true }] }),
      );
      expect(parseCardSpec(card(action('not an array')))).toStrictEqual(
        card({ type: 'actions', actions: [{ label: 'Ausstellen', offer: true }] }),
      );
      expect(
        parseCardSpec(card(action([{ label: 'x', hint: 5, preapprove: ['a'] }]))),
      ).toStrictEqual(
        card({
          type: 'actions',
          actions: [
            { label: 'Ausstellen', offer: true, alternatives: [{ label: 'x', preapprove: ['a'] }] },
          ],
        }),
      );
    });
  });

  describe('status', () => {
    it('keeps a status block for every known tone', () => {
      const blocks = MAIL_CARD_STATUS_TONES.map((tone) => ({
        type: 'status',
        label: `Status ${tone}`,
        tone,
      }));
      expect(parseCardSpec(card(...blocks))).toStrictEqual(card(...blocks));
    });

    it('drops a status block with an unknown tone, without a label, or without a tone', () => {
      expect(
        parseCardSpec(
          card(
            { type: 'status', label: 'Läuft', tone: 'info' },
            { type: 'status', tone: 'success' },
            { type: 'status', label: 'Läuft' },
          ),
        ),
      ).toStrictEqual(card());
    });
  });

  describe('header and feedback', () => {
    it('keeps a subtitle only when it is a string', () => {
      expect(
        parseCardSpec({ kind: 'w', blocks: [{ type: 'header', title: 'T', subtitle: 5 }] }),
      ).toStrictEqual({
        kind: 'w',
        blocks: [{ type: 'header', title: 'T' }],
      });
    });

    it('drops a feedback block without a question', () => {
      expect(
        parseCardSpec(card({ type: 'feedback' }, { type: 'feedback', question: 3 })),
      ).toStrictEqual(card());
    });
  });

  it('returns null without a header title, for non-objects, and without kind', () => {
    expect(parseCardSpec(null)).toBeNull();
    expect(parseCardSpec(undefined)).toBeNull();
    expect(parseCardSpec('x')).toBeNull();
    expect(parseCardSpec(42)).toBeNull();
    expect(parseCardSpec([card()])).toBeNull();
    expect(parseCardSpec({ kind: 'w', blocks: [] })).toBeNull();
    expect(parseCardSpec({ blocks: [header] })).toBeNull();
    expect(parseCardSpec({ kind: '', blocks: [header] })).toBeNull();
    expect(parseCardSpec({ kind: 7, blocks: [header] })).toBeNull();
    expect(parseCardSpec({ kind: 'w' })).toBeNull();
    expect(parseCardSpec({ kind: 'w', blocks: [{ type: 'header' }] })).toBeNull();
    expect(parseCardSpec({ kind: 'w', blocks: [{ type: 'header', title: '' }] })).toBeNull();
    expect(parseCardSpec({ kind: 'w', blocks: [{ type: 'header', title: '   ' }] })).toBeNull();
    expect(parseCardSpec({ kind: 'w', blocks: [{ type: 'header', title: 5 }] })).toBeNull();
  });

  it('returns null when the only content is not a card: no header, however good the rest is', () => {
    const rows = { type: 'rows', rows: [{ label: 'a', value: 'b' }] };
    expect(parseCardSpec({ kind: 'w', blocks: [rows] })).toBeNull();
  });

  it('copies only known keys, so extra properties never reach the renderer', () => {
    const parsed = parseCardSpec({
      kind: 'workflow',
      extra: 1,
      blocks: [
        { type: 'header', title: 'T', onClick: 'x', dangerouslySetInnerHTML: { __html: '<i>' } },
        { type: 'rows', rows: [{ label: 'a', value: 'b', style: 'color: red' }], className: 'x' },
        {
          type: 'actions',
          actions: [
            {
              label: 'Öffnen',
              url: 'https://hintoric.com',
              target: '_top',
              alternatives: [{ label: 'x', preapprove: ['a'], onSelect: 'y' }],
            },
          ],
        },
      ],
    });
    expect(parsed).toStrictEqual({
      kind: 'workflow',
      blocks: [
        { type: 'header', title: 'T' },
        { type: 'rows', rows: [{ label: 'a', value: 'b' }] },
        {
          type: 'actions',
          actions: [
            {
              label: 'Öffnen',
              url: 'https://hintoric.com',
              alternatives: [{ label: 'x', preapprove: ['a'] }],
            },
          ],
        },
      ],
    });
  });

  it('does not modify its input', () => {
    const input = overTheWire({
      ...WOHNUNGSGEBER_EXAMPLE,
      extra: 1,
      blocks: [...WOHNUNGSGEBER_EXAMPLE.blocks, { type: 'x' }],
    });
    const before = JSON.stringify(input);
    parseCardSpec(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});

/*
 * The contract. Core validates what it sends against `card-spec.schema.json`; the client parses what
 * arrives with `parseCardSpec`. The schema is strict, the parser lenient — but a card the schema
 * accepts must come through the parser unchanged, and a card the schema rejects must be changed
 * (a piece dropped) or refused. The tables below pin that, so the two cannot drift apart silently.
 *
 * One known gap: a date like 2026-02-30 has every field in range, so the schema's pattern accepts
 * it, while the parser also checks the calendar and drops it. JSON Schema cannot express that
 * check. It is pinned separately below, not in the tables, which would otherwise claim otherwise.
 */
describe('card-spec.schema.json', () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);

  const link = { label: 'Öffnen', url: 'https://hintoric.com/a' };
  const offer = { label: 'Starten', offer: true };
  const actions = (...items: unknown[]) => ({ type: 'actions', actions: items });
  const rows = (...items: unknown[]) => ({ type: 'rows', rows: items });
  const date = (value: string) => rows({ label: 'Einzug', value: { date: value } });

  const accepted: Record<string, unknown> = {
    'the Wohnungsgeberbestätigung example': WOHNUNGSGEBER_EXAMPLE,
    'a header only': card(),
    'a subtitle': { kind: 'w', blocks: [{ type: 'header', title: 'T', subtitle: 'S' }] },
    'a link action': card(actions(link)),
    'a primary link action': card(actions({ ...link, primary: true })),
    'an offer action': card(actions(offer)),
    'alternatives on a link': card(
      actions({ ...link, alternatives: [{ label: 'a', preapprove: ['x'] }] }),
    ),
    'a date': card(date('2026-11-01')),
    'a date-time with a zone': card(date('2026-11-01T09:30:15.250+01:00')),
    'a date-time without a zone': card(date('2026-11-01T09:30')),
    'a leap day': card(date('2028-02-29')),
    'a row without an icon': card(rows({ label: 'a', value: 'b' })),
    'every icon': card(
      rows(...MAIL_CARD_ICON_NAMES.map((icon) => ({ icon, label: icon, value: 'v' }))),
    ),
    'every status tone': card(
      ...MAIL_CARD_STATUS_TONES.map((tone) => ({ type: 'status', label: 'l', tone })),
    ),
    'a feedback block': card({ type: 'feedback', question: '?' }),
  };

  const rejected: Record<string, unknown> = {
    'a non-https url': card(actions({ label: 'Öffnen', url: 'http://hintoric.com' })),
    'a javascript: url': card(actions({ label: 'Öffnen', url: 'javascript:alert(1)' })),
    'a relative url': card(actions({ label: 'Öffnen', url: '/relative' })),
    'a protocol-relative url': card(actions({ label: 'Öffnen', url: '//hintoric.com' })),
    'an upper-case scheme': card(actions({ label: 'Öffnen', url: 'HTTPS://hintoric.com' })),
    'a url without a host': card(actions({ label: 'Öffnen', url: 'https://' })),
    'a link that is also an offer': card(actions({ ...link, offer: true })),
    'an action that is neither': card(actions({ label: 'Nichts' })),
    'offer: false': card(actions({ label: 'Nein', offer: false })),
    'a non-boolean primary': card(actions({ ...offer, primary: 'yes' })),
    'an action without a label': card(actions({ offer: true })),
    'an empty actions block': card(actions()),
    'an empty alternatives list': card(actions({ ...offer, alternatives: [] })),
    'an alternative without preapprove': card(
      actions({ ...offer, alternatives: [{ label: 'a' }] }),
    ),
    'an empty preapprove list': card(
      actions({ ...offer, alternatives: [{ label: 'a', preapprove: [] }] }),
    ),
    'a non-string preapprove entry': card(
      actions({ ...offer, alternatives: [{ label: 'a', preapprove: ['x', 1] }] }),
    ),
    'a non-string hint': card(
      actions({ ...offer, alternatives: [{ label: 'a', hint: 1, preapprove: ['x'] }] }),
    ),
    'an unknown block type': card({ type: 'carousel' }),
    'an unknown key on a block': card({ type: 'feedback', question: '?', extra: 1 }),
    'an unknown key on the card': { ...card(), extra: 1 },
    'a row without a value': card(rows({ label: 'X' })),
    'a row without a label': card(rows({ value: 'x' })),
    'an unknown icon': card(rows({ icon: 'rocket', label: 'A', value: 'b' })),
    'an empty rows block': card(rows()),
    'a number as value': card(rows({ label: 'a', value: 5 })),
    'a date in German notation': card(date('01.11.2026')),
    'a month out of range': card(date('2026-13-01')),
    'a day out of range': card(date('2026-11-32')),
    'an hour out of range': card(date('2026-11-01T24:00')),
    'a blank date': card(date('')),
    'an unknown tone': card({ type: 'status', label: 'l', tone: 'info' }),
    'a status without a label': card({ type: 'status', tone: 'success' }),
    'a feedback without a question': card({ type: 'feedback' }),
    'a blank title': { kind: 'w', blocks: [{ type: 'header', title: ' ' }] },
    'no header': { kind: 'w', blocks: [rows({ label: 'a', value: 'b' })] },
    'no blocks': { kind: 'w', blocks: [] },
    'no kind': { blocks: [header] },
    'an empty kind': { kind: '', blocks: [header] },
  };

  it('accepts the example', () => {
    expect(validate(WOHNUNGSGEBER_EXAMPLE), JSON.stringify(validate.errors)).toBe(true);
  });

  it('rejects a non-https url, as the parser does', () => {
    const spec = card(actions({ label: 'Öffnen', url: 'http://hintoric.com/a' }));
    expect(validate(spec)).toBe(false);
    expect(parseCardSpec(spec)).toStrictEqual(card());
  });

  it.each(Object.entries(accepted))(
    'accepts %s, and the parser keeps it unchanged',
    (_name, spec) => {
      expect(validate(spec), JSON.stringify(validate.errors)).toBe(true);
      expect(parseCardSpec(overTheWire(spec))).toStrictEqual(overTheWire(spec));
    },
  );

  it.each(Object.entries(rejected))(
    'rejects %s, and the parser drops or refuses it',
    (_name, spec) => {
      expect(validate(spec)).toBe(false);
      expect(parseCardSpec(overTheWire(spec))).not.toStrictEqual(overTheWire(spec));
    },
  );

  it('cannot tell a date that is not on the calendar; the parser can', () => {
    const impossible = card(date('2026-02-30'));
    expect(validate(impossible)).toBe(true);
    expect(parseCardSpec(overTheWire(impossible))).toStrictEqual(card());
  });

  it('lists the same icons and tones as the parser', () => {
    const defs = schema.$defs;
    expect(defs.row.properties.icon.enum).toStrictEqual([...MAIL_CARD_ICON_NAMES]);
    expect(defs.status.properties.tone.enum).toStrictEqual([...MAIL_CARD_STATUS_TONES]);
  });
});
