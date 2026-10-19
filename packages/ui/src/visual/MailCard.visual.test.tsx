import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MailCard } from '../components/MailCard';
import type { CardSpec, MailCardMessages } from '../components/MailCard';
import { WOHNUNGSGEBER_EXAMPLE } from '../components/MailCard/examples';
import {
  COLOR_SCHEMES,
  expectSameLineHeight,
  setColorScheme,
  settleTransitions,
  settleUntilStable,
} from './helpers';
import { parkPointer } from './errorParity';
import type { ColorScheme } from './helpers';

// MailCard has no @mui/joy counterpart — Joy has no card that sits at a mail — so it is exempt
// from the Joy parity comparison (CLAUDE.md, "Components without an `@mui/joy` counterpart"), not
// from scheme coverage. What stands in for the oracle here is the geometry of Gmail's own cards,
// measured on Gmail web (the mail-cards design spec, and `google-layout-geometry.md` of its plan):
// every number asserted below is one of those measurements. The screenshots are self-baselines
// per theme and scheme, for a human to compare with the reference shots of the spec.
//
// The scheme is set on the document (`setColorScheme`) *and* passed to the card as `colorScheme`,
// because that is how the extension renders it: it always passes the scheme it reads from Gmail.
// No `ColorSchemeProvider` — the card renders in a shadow root, where there is none.

const THEMES = ['joy', 'google'] as const;
type Theme = (typeof THEMES)[number];

const MESSAGES: MailCardMessages = {
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

const TITLE = 'Wohnungsgeberbestätigung für Tobias Maurer';
const PRIMARY = 'Bestätigung ausstellen';

/** The example with its actions swapped for a status, as the card looks once the offer ran. */
const DONE_EXAMPLE: CardSpec = {
  ...WOHNUNGSGEBER_EXAMPLE,
  blocks: WOHNUNGSGEBER_EXAMPLE.blocks.map((block) =>
    block.type === 'actions'
      ? { type: 'status', label: 'Bestätigung wurde ausgestellt und versendet.', tone: 'success' }
      : block,
  ),
};

/*
 * Review focus 3 of the plan: a 60-character title, five rows, a long primary label, at 600 px.
 * The long label is wider than the footer's content box on its own, so the pill has to wrap its
 * text. The reference number has no break opportunity at all (no space, no hyphen), so only the
 * card's `overflow-wrap: anywhere` keeps it in its 235 px column.
 */
const UNBREAKABLE = 'WGB20261100017734FREIBURGNORDHAUPTSTRASSE';
const LONG_TITLE = 'Wohnungsgeberbestätigung für Tobias Maurer und Lea Schneider';
const LONG_PRIMARY = 'Bestätigung ausstellen und an beide Mieter und die Hausverwaltung versenden';
const LONG_EXAMPLE: CardSpec = {
  kind: 'workflow',
  blocks: [
    {
      type: 'header',
      title: LONG_TITLE,
      subtitle: 'Einzug am 1. Nov. in die Hauptstraße 1, 2. OG links, 79098 Freiburg im Breisgau',
    },
    {
      type: 'rows',
      rows: [
        { icon: 'person', label: 'Mieter', value: 'Tobias Maurer und Lea Schneider' },
        { icon: 'event', label: 'Einzug', value: { date: '2026-11-01' } },
        {
          icon: 'place',
          label: 'Wohnung',
          value: 'Hauptstraße 1, 2. OG links, 79098 Freiburg im Breisgau',
        },
        {
          icon: 'store',
          label: 'Vermieter',
          value: 'Wohnungsbaugesellschaft Freiburg-Nord mbH & Co. KG',
        },
        {
          icon: 'description',
          label: 'Aktenzeichen',
          value: UNBREAKABLE,
        },
      ],
    },
    {
      type: 'actions',
      actions: [
        {
          label: LONG_PRIMARY,
          offer: true,
          primary: true,
          alternatives: [
            {
              label: 'Ausstellen und versenden',
              hint: 'Die Antwort geht ohne weitere Rückfrage an Tobias Maurer und Lea Schneider.',
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

// Gmail's message column is 852 px wide where the reference shots were taken.
const GMAIL_WIDTH = 852;
const NARROW_WIDTH = 600;

/*
 * The test iframe's default viewport (414 px) is narrower than one card. Wider, but no taller than
 * the headless window (720 px): the runner scales an iframe that does not fit down to fit, and the
 * screenshots come out scaled with it — 900 px of height turned the 852 px card into a 682 px PNG.
 * The parking spot of `parkPointer` (fixed, bottom right) stays clear of every card at this size.
 */
beforeEach(async () => {
  await page.viewport(1000, 680);
});

function renderCard(
  spec: CardSpec,
  { theme, scheme, width = GMAIL_WIDTH }: { theme: Theme; scheme: ColorScheme; width?: number },
) {
  const testId = `parent-${theme}-${width}`;
  render(
    <div data-testid={testId} style={{ width }}>
      <MailCard spec={spec} theme={theme} colorScheme={scheme} messages={MESSAGES} locale="de-DE" />
    </div>,
  );
  const parent = screen.getByTestId(testId);
  return { parent, card: parent.firstElementChild as HTMLElement };
}

/** The card's content box: inside its 1 px border and its 20 px / 40 px padding. */
function contentBox(card: HTMLElement) {
  const box = card.getBoundingClientRect();
  const s = getComputedStyle(card);
  return {
    left: box.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft),
    right: box.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight),
    top: box.top + parseFloat(s.borderTopWidth) + parseFloat(s.paddingTop),
    bottom: box.bottom - parseFloat(s.borderBottomWidth) - parseFloat(s.paddingBottom),
  };
}

const rect = (el: Element) => el.getBoundingClientRect();
const centreY = (el: Element) => rect(el).top + rect(el).height / 2;

/** Positions are compared to the half pixel: a grid column of 361 px may land on a fraction. */
function expectNear(actual: number, expected: number, what: string) {
  expect(Math.abs(actual - expected), `${what}: ${actual} vs ${expected}`).toBeLessThanOrEqual(0.5);
}

function expectType(el: Element, fontSize: string, lineHeight: string, fontWeight: string) {
  const s = getComputedStyle(el);
  expect({ fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: s.fontWeight }).toEqual({
    fontSize,
    lineHeight,
    fontWeight,
  });
}

/**
 * The colour `value` (a `var()` or a literal) resolves to inside `scope`. A probe appended to the
 * card picks up the theme's `--mail-card-*` properties and the card's `data-color-scheme`; it is
 * gone again before React looks at the DOM.
 */
function resolveColor(scope: Element, value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  scope.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

const footerOf = (card: HTMLElement) => card.querySelector('hr')!.parentElement as HTMLElement;
const footerRowOf = (card: HTMLElement) =>
  card.querySelector('hr')!.nextElementSibling as HTMLElement;
const rowsOf = (card: HTMLElement) =>
  Array.from(card.querySelectorAll<HTMLElement>('[data-mail-card-row]'));

describe('MailCard visual (self-baseline)', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const theme of THEMES) {
      it(`has Gmail's measured layout in ${theme}/${scheme}`, async () => {
        await setColorScheme(scheme);
        const { card } = renderCard(WOHNUNGSGEBER_EXAMPLE, { theme, scheme });
        await parkPointer(`workflow-${theme}`);
        await settleTransitions();

        // The card fills its fixed-width parent, as a block-level flex column.
        const s = getComputedStyle(card);
        expect(s.display).toBe('flex');
        expect(s.flexDirection).toBe('column');
        expect(s.width).toBe(`${GMAIL_WIDTH}px`);
        expect(rect(card).width).toBe(GMAIL_WIDTH);
        expect([s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft]).toEqual([
          '20px',
          '40px',
          '20px',
          '40px',
        ]);
        expect(s.borderRadius).toBe('8px');
        // Both themes keep the 1 px border (transparent in google), so they share one box.
        expect(s.borderTopWidth).toBe('1px');
        // 20 + 40 header + 2 × 56 rows + 16 + 1 rule + 12 + 36 footer + 20, plus 2 × 1 border.
        expect(rect(card).height).toBe(259);

        const content = contentBox(card);

        // Header: the mark in the icon column, centred on title and subtitle; the text 30 px in.
        const title = screen.getByText(TITLE);
        const subtitle = screen.getByText('Einzug am 1. Nov. in die Hauptstr. 1, 2. OG links');
        const headerText = title.parentElement as HTMLElement;
        const logo = card.querySelector('[data-mail-card-logo]') as SVGElement;
        expectType(title, '16px', '20px', '500');
        expectType(subtitle, '14px', '20px', '400');
        expectNear(rect(title).top, content.top, 'title top');
        expectNear(rect(title).left, content.left + 30, 'title text edge');
        expectNear(rect(subtitle).top, rect(title).bottom, 'subtitle right below the title');
        expect([rect(logo).width, rect(logo).height]).toEqual([24, 24]);
        expectNear(rect(logo).left, content.left, 'logo in the icon column');
        expectNear(centreY(logo), centreY(headerText), 'logo centred on the header text');

        // Rows: two columns 48 px apart, filled left to right; a cell is 56 px, its text 20 px
        // down and 30 px in, the 20 px icon centred on label and value.
        const [mieter, einzug, wohnung] = rowsOf(card);
        const headerBottom = rect(headerText.parentElement as HTMLElement).bottom;
        expectNear(rect(mieter).top, headerBottom, 'rows right below the header');
        expectNear(rect(mieter).left, content.left, 'first column at the content edge');
        expect(rect(mieter).width).toBeLessThanOrEqual(362);
        expectNear(rect(einzug).left - rect(mieter).left, rect(mieter).width + 48, 'second column');
        expectNear(rect(einzug).top, rect(mieter).top, 'second cell beside the first');
        expectNear(rect(wohnung).left, rect(mieter).left, 'third cell under the first');
        expectNear(rect(wohnung).top, rect(mieter).bottom, 'third cell under the first');
        for (const cell of [mieter, einzug, wohnung]) expect(rect(cell).height).toBe(56);

        const label = within(mieter).getByText('Mieter');
        const value = within(mieter).getByText('Tobias Maurer');
        const icon = mieter.querySelector('svg') as SVGElement;
        expectType(label, '12px', '16px', '500');
        expectType(value, '14px', '18px', '400');
        expectNear(rect(label).top, rect(mieter).top + 20, 'label 20 px into the cell');
        expectNear(rect(label).left, rect(mieter).left + 30, 'label text edge');
        expectNear(rect(value).top, rect(label).bottom + 2, 'value 2 px under the label');
        expect([rect(icon).width, rect(icon).height]).toEqual([20, 20]);
        expectNear(rect(icon).left, rect(mieter).left, 'row icon in the icon column');
        expectNear(
          centreY(icon),
          (rect(label).top + rect(value).bottom) / 2,
          'icon centred on label and value',
        );

        // Footer: a rule across the content box, 16 px under the rows and 12 px over a 36 px row.
        const rule = card.querySelector('hr') as HTMLElement;
        const footerRow = footerRowOf(card);
        expectNear(rect(rule).top - rect(wohnung).bottom, 16, 'space above the rule');
        expect(rect(rule).height).toBe(1);
        expectNear(rect(rule).left, content.left, 'rule from the icon column');
        expectNear(rect(rule).right, content.right, 'rule to the content edge');
        expectNear(rect(footerRow).top - rect(rule).bottom, 12, 'space under the rule');
        expect(rect(footerRow).height).toBe(36);
        expectNear(rect(footerRow).bottom, content.bottom, 'footer on the bottom padding');

        // Feedback on the left, its question on the text edge; the thumbs are 36 px round.
        const question = screen.getByText('Ist das richtig?');
        const thumbUp = screen.getByRole('button', { name: MESSAGES.feedbackYes });
        expectType(question, '14px', '20px', '500');
        expectNear(rect(question).left, content.left + 30, 'question text edge');
        expectNear(centreY(question), centreY(footerRow), 'question centred in the footer');
        expect([rect(thumbUp).width, rect(thumbUp).height]).toEqual([36, 36]);
        expect(getComputedStyle(thumbUp).borderTopLeftRadius).toBe('9999px');

        // The primary action: a pill in two parts, 36 px high, 14 px / 500, flush right.
        const main = screen.getByRole('button', { name: PRIMARY });
        const arrow = screen.getByRole('button', { name: MESSAGES.moreActions });
        const mainStyle = getComputedStyle(main);
        expect({
          minHeight: mainStyle.minHeight,
          borderTopLeftRadius: mainStyle.borderTopLeftRadius,
          borderBottomLeftRadius: mainStyle.borderBottomLeftRadius,
          borderTopRightRadius: mainStyle.borderTopRightRadius,
        }).toEqual({
          minHeight: '36px',
          borderTopLeftRadius: '9999px',
          borderBottomLeftRadius: '9999px',
          borderTopRightRadius: '0px',
        });
        expectType(main, '14px', '20px', '500');
        const arrowStyle = getComputedStyle(arrow);
        expect([arrowStyle.borderTopRightRadius, arrowStyle.borderBottomRightRadius]).toEqual([
          '9999px',
          '9999px',
        ]);
        expect(rect(main).height).toBe(36);
        expect([rect(arrow).width, rect(arrow).height]).toEqual([36, 36]);
        expectNear(rect(main).right, rect(arrow).left, 'arrow joined to the main part');
        expectNear(rect(arrow).right, content.right, 'pill flush with the content edge');
        expectNear(centreY(main), centreY(footerRow), 'pill centred in the footer');
        // The status live region is mounted, empty, beside the actions from the start. Out of the
        // flow, it costs no slot and no 24 px gap — which the flush-right pill above confirms.
        const emptyStatus = screen.getByRole('status');
        expect(emptyStatus.textContent).toBe('');
        expect(getComputedStyle(emptyStatus).position).toBe('absolute');

        await expect(page.elementLocator(card)).toMatchScreenshot(
          `mail-card-workflow-${theme}-${scheme}`,
        );
      });

      it(`opens the split menu upwards, inside the card, in ${theme}/${scheme}`, async () => {
        await setColorScheme(scheme);
        const { card } = renderCard(WOHNUNGSGEBER_EXAMPLE, { theme, scheme });
        await userEvent.click(screen.getByRole('button', { name: MESSAGES.moreActions }));
        // Off the arrow, so the screenshot shows the arrow at rest rather than hovered.
        await parkPointer(`menu-${theme}`);
        await settleTransitions();

        const menu = screen.getByRole('menu');
        const split = screen.getByRole('button', { name: PRIMARY }).parentElement as HTMLElement;
        const arrow = screen.getByRole('button', { name: MESSAGES.moreActions });
        const s = getComputedStyle(menu);
        expect(s.width).toBe('320px');
        expect(s.borderRadius).toBe('12px');
        expect(rect(menu).width).toBe(320);
        expect(rect(menu).bottom).toBeLessThanOrEqual(rect(split).top);
        expectNear(rect(menu).right, rect(arrow).right, 'menu flush with the arrow');
        expect(rect(menu).left).toBeGreaterThanOrEqual(rect(card).left);
        expect(rect(menu).right).toBeLessThanOrEqual(rect(card).right);
        expect(rect(menu).top).toBeGreaterThanOrEqual(rect(card).top);
        // Not portalled: in the card, so it works in a shadow root.
        expect(card.contains(menu)).toBe(true);

        // The items are the library's `title-sm` over `body-xs`, whose unitless line-heights
        // (1.42858, 1.5) carry their rounding: 20.0001px, hence `expectSameLineHeight`.
        const [first] = within(menu).getAllByRole('menuitem');
        const itemLabel = getComputedStyle(within(first).getByText('Ausstellen und versenden'));
        const itemHint = getComputedStyle(within(first).getByText(/ohne weitere Rückfrage/));
        expect([itemLabel.fontSize, itemLabel.fontWeight]).toEqual(['14px', '500']);
        expectSameLineHeight(itemLabel.lineHeight, '20px');
        expect([itemHint.fontSize, itemHint.fontWeight]).toEqual(['12px', '500']);
        expectSameLineHeight(itemHint.lineHeight, '18px');

        await expect(page.elementLocator(card)).toMatchScreenshot(
          `mail-card-menu-${theme}-${scheme}`,
        );
      });

      it(`shows a status in place of the actions, at the same height, in ${theme}/${scheme}`, async () => {
        await setColorScheme(scheme);
        const { card } = renderCard(DONE_EXAMPLE, { theme, scheme });
        await parkPointer(`done-${theme}`);
        await settleTransitions();

        const status = screen.getByRole('status');
        const footerRow = footerRowOf(card);
        expect(screen.queryByRole('button', { name: PRIMARY })).toBeNull();
        expect(status.textContent).toBe('Bestätigung wurde ausgestellt und versendet.');
        // The library's success tone — 500 in light, 300 in dark — in both themes.
        expect(getComputedStyle(status).color).toBe(
          resolveColor(document.body, 'var(--color-success-plain-color)'),
        );
        expectType(status, '14px', '20px', '400');
        // The footer keeps the 36 px of the pill it replaces, so the card does not jump.
        expect(rect(footerRow).height).toBe(36);
        expect(rect(card).height).toBe(259);
        expectNear(rect(status).right, contentBox(card).right, 'status flush right');
        expectNear(centreY(status), centreY(footerRow), 'status centred in the footer');

        await expect(page.elementLocator(card)).toMatchScreenshot(
          `mail-card-done-${theme}-${scheme}`,
        );
      });

      it(`changes the pill and the thumbs under the pointer in ${theme}/${scheme}`, async () => {
        await setColorScheme(scheme);
        const { card } = renderCard(WOHNUNGSGEBER_EXAMPLE, { theme, scheme });
        await parkPointer(`hover-${theme}`);
        await settleTransitions();

        const main = screen.getByRole('button', { name: PRIMARY });
        const thumbUp = screen.getByRole('button', { name: MESSAGES.feedbackYes });
        const background = (el: Element) => () => getComputedStyle(el).backgroundColor;

        const pillRest = await settleUntilStable(background(main));
        const thumbRest = await settleUntilStable(background(thumbUp));
        expect(pillRest).toBe(resolveColor(card, 'var(--mail-card-accent)'));
        expect(thumbRest).toBe('rgba(0, 0, 0, 0)');

        await userEvent.hover(main);
        const pillHover = await settleUntilStable(background(main));
        expect(pillHover).not.toBe(pillRest);
        expect(pillHover).toBe(resolveColor(card, 'var(--mail-card-accent-hover)'));

        await userEvent.hover(thumbUp);
        const thumbHover = await settleUntilStable(background(thumbUp));
        expect(thumbHover).not.toBe(thumbRest);
        // The pointer left the pill: it is back at rest.
        expect(await settleUntilStable(background(main))).toBe(pillRest);

        await parkPointer(`hover-${theme}-end`);
      });

      it(`draws a 2 px focus ring for the keyboard in ${theme}/${scheme}`, async () => {
        await setColorScheme(scheme);
        const { card } = renderCard(WOHNUNGSGEBER_EXAMPLE, { theme, scheme });
        await settleTransitions();

        const ring = (el: Element) => {
          const s = getComputedStyle(el);
          return {
            outlineStyle: s.outlineStyle,
            outlineWidth: s.outlineWidth,
            outlineOffset: s.outlineOffset,
            outlineColor: s.outlineColor,
          };
        };
        const focusColor = resolveColor(card, 'var(--mail-card-focus)');
        const expected = {
          outlineStyle: 'solid',
          outlineWidth: '2px',
          outlineOffset: '2px',
          outlineColor: focusColor,
        };

        // Keyboard focus, so `:focus-visible` matches as it does for a real user: from the
        // thumbs-up, Tab reaches the thumbs-down, then the pill.
        const thumbUp = screen.getByRole('button', { name: MESSAGES.feedbackYes });
        const thumbDown = screen.getByRole('button', { name: MESSAGES.feedbackNo });
        const main = screen.getByRole('button', { name: PRIMARY });
        thumbUp.focus();
        await userEvent.keyboard('{Tab}');
        await settleTransitions();
        expect(document.activeElement).toBe(thumbDown);
        expect(ring(thumbDown)).toEqual(expected);

        await userEvent.keyboard('{Tab}');
        await settleTransitions();
        expect(document.activeElement).toBe(main);
        expect(ring(main)).toEqual(expected);
        // The ring is not the surface: it has to be seen.
        expect(focusColor).not.toBe(getComputedStyle(card).backgroundColor);
      });
    }

    it(`lays out joy and google identically in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const joy = renderCard(WOHNUNGSGEBER_EXAMPLE, { theme: 'joy', scheme }).card;
      const google = renderCard(WOHNUNGSGEBER_EXAMPLE, { theme: 'google', scheme }).card;
      await settleTransitions();

      /** Where the parts sit relative to their card: what a theme must never move. */
      const layout = (card: HTMLElement) => {
        const s = getComputedStyle(card);
        const origin = rect(card);
        const at = (el: Element) => {
          const r = rect(el);
          return { top: r.top - origin.top, left: r.left - origin.left, height: r.height };
        };
        const arrow = within(card).getByRole('button', { name: MESSAGES.moreActions });
        return {
          padding: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft],
          border: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth],
          borderRadius: s.borderRadius,
          width: origin.width,
          height: origin.height,
          title: at(within(card).getByText(TITLE)),
          rows: rowsOf(card).map(at),
          rule: at(card.querySelector('hr') as HTMLElement),
          footerRow: at(footerRowOf(card)),
          arrow: { ...at(arrow), right: rect(arrow).right - origin.left },
        };
      };

      expect(layout(google)).toEqual(layout(joy));
    });

    it(`keeps long texts inside a 600 px card in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { card } = renderCard(LONG_EXAMPLE, { theme: 'joy', scheme, width: NARROW_WIDTH });
      await parkPointer('long');
      await settleTransitions();

      expect(LONG_TITLE).toHaveLength(60);
      // Wider than its column on one line: it really has to break inside the word.
      expect(rect(screen.getByText(UNBREAKABLE)).height).toBeGreaterThan(18);
      expect(rowsOf(card)).toHaveLength(5);
      const s = getComputedStyle(card);
      expect(s.display).toBe('flex');
      expect(s.width).toBe(`${NARROW_WIDTH}px`);

      // Nothing scrolls sideways, and no part pokes out of the card.
      const footer = footerOf(card);
      expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
      expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
      const content = contentBox(card);
      for (const el of Array.from(card.querySelectorAll('*'))) {
        const r = rect(el);
        if (r.width === 0 && r.height === 0) continue;
        expect(r.left, `${el.tagName} ${el.textContent?.slice(0, 30)}`).toBeGreaterThanOrEqual(
          content.left - 0.5,
        );
        expect(r.right, `${el.tagName} ${el.textContent?.slice(0, 30)}`).toBeLessThanOrEqual(
          content.right + 0.5,
        );
      }
      // The long label wraps inside the pill rather than widening it.
      const main = screen.getByRole('button', { name: LONG_PRIMARY });
      expect(rect(main).height).toBeGreaterThan(36);

      await expect(page.elementLocator(card)).toMatchScreenshot(`mail-card-long-${scheme}`);

      // The split menu, opened on this narrow card, stays inside it.
      await userEvent.click(screen.getByRole('button', { name: MESSAGES.moreActions }));
      await parkPointer('long-menu');
      const menu = screen.getByRole('menu');
      const split = main.parentElement as HTMLElement;
      expect(rect(menu).left).toBeGreaterThanOrEqual(rect(card).left);
      expect(rect(menu).right).toBeLessThanOrEqual(rect(card).right);
      expect(rect(menu).top).toBeGreaterThanOrEqual(rect(card).top);
      expect(rect(menu).bottom).toBeLessThanOrEqual(rect(split).top);
      expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    });
  }

  /**
   * A committed screenshot only catches a regression once a human looks at it. This is the
   * assertion a PNG cannot make: that the card's colours follow the scheme at all. The card stays
   * mounted across the flip; only the document's scheme and the `colorScheme` prop change.
   */
  for (const theme of THEMES) {
    it(`paints a different surface and title in dark than in light in ${theme}`, async () => {
      await setColorScheme('light');
      const { rerender } = render(
        <MailCard
          spec={WOHNUNGSGEBER_EXAMPLE}
          theme={theme}
          colorScheme="light"
          messages={MESSAGES}
        />,
      );
      const title = screen.getByText(TITLE);
      const card = title.closest('[data-color-scheme]') as HTMLElement;
      const read = () => ({
        surface: getComputedStyle(card).backgroundColor,
        title: getComputedStyle(title).color,
      });
      const light = read();

      await setColorScheme('dark');
      rerender(
        <MailCard
          spec={WOHNUNGSGEBER_EXAMPLE}
          theme={theme}
          colorScheme="dark"
          messages={MESSAGES}
        />,
      );
      await settleTransitions();
      const dark = read();

      expect(dark.surface).not.toBe(light.surface);
      expect(dark.title).not.toBe(light.title);
    });

    /*
     * Review focus 4: a host without `ColorSchemeProvider` and with a light document — Gmail, with
     * the card in a shadow root. `colorScheme="dark"` alone has to turn the card dark, with the same
     * colours as in a dark document. (The reverse, a light card in a dark document, is not
     * supported for `joy`: the library's light tokens live only on `:root`.)
     */
    it(`turns dark from colorScheme alone, in a light page without a provider, in ${theme}`, async () => {
      const read = () => {
        const title = screen.getByText(TITLE);
        const card = title.closest('[data-color-scheme]') as HTMLElement;
        const main = screen.getByRole('button', { name: PRIMARY });
        return {
          surface: getComputedStyle(card).backgroundColor,
          title: getComputedStyle(title).color,
          label: getComputedStyle(screen.getByText('Mieter')).color,
          value: getComputedStyle(screen.getByText('Tobias Maurer')).color,
          accent: getComputedStyle(main).backgroundColor,
        };
      };
      const card = (colorScheme: ColorScheme) => (
        <MailCard
          spec={WOHNUNGSGEBER_EXAMPLE}
          theme={theme}
          colorScheme={colorScheme}
          messages={MESSAGES}
        />
      );

      await setColorScheme('dark');
      render(card('dark'));
      await parkPointer(`island-${theme}`);
      const inDarkPage = read();
      cleanup();

      await setColorScheme('light');
      render(card('light'));
      const lightCard = read();
      cleanup();

      render(card('dark'));
      await settleTransitions();
      const darkIsland = read();

      expect(document.documentElement.getAttribute('data-color-scheme')).toBe('light');
      expect(darkIsland).toEqual(inDarkPage);
      expect(darkIsland.surface).not.toBe(lightCard.surface);
      expect(darkIsland.title).not.toBe(lightCard.title);
    });
  }
});
