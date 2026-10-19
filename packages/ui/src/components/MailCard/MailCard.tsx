'use client';
import * as React from 'react';
import { Card } from '../Card';
import { cx } from '../../utils/cx';
import { useDateTimeDefaults } from '../../theme/DateTimeProvider';
import { MailCardContext } from './MailCardContext';
import {
  MailCardAction,
  MailCardFooter,
  MailCardHeader,
  MailCardRow,
  MailCardRows,
  MailCardStatus,
  isRenderableAction,
} from './blocks';
import { jsonLdToSpec } from './schemaOrg';
import type { CardSpec, MailCardBlock } from './spec';
import type { MailCardProps } from './types';

type Theme = NonNullable<MailCardProps['theme']>;

/*
 * A theme is nothing but values for the `--mail-card-*` properties the blocks paint with.
 *
 * `joy` is the library's own look, from the tokens `Card` (outlined, neutral), the ink scale and a
 * solid primary `Button` use — and so it follows `data-color-scheme` the way they do. Text colours
 * as in the reference screenshot of the card: title ink-primary, values ink-secondary, subtitle and
 * labels ink-tertiary, and the rule is the library's divider. The pill takes the solid primary
 * button's fill, hover, press and focus ring. Text links take the plain primary colour (500 light,
 * 300 dark): primary-500 as text on the dark surface is about 3.7:1, below the 4.5:1 that 14 px
 * text needs. The menu of a split button is a joy `Menu`: it paints with the popup surface (white
 * in light, black in dark) and `shadow.md`, and the item under the pointer or the keyboard takes
 * the plain neutral hover background of a `MenuItem`; its border is the card's.
 */
const JOY_THEME = {
  '--mail-card-surface': 'var(--color-surface)',
  '--mail-card-border': 'var(--color-neutral-outlined-border)',
  '--mail-card-shadow': 'none',
  '--mail-card-title': 'var(--color-ink-primary)',
  '--mail-card-text': 'var(--color-ink-secondary)',
  '--mail-card-label': 'var(--color-ink-tertiary)',
  '--mail-card-accent': 'var(--color-primary-solid-bg)',
  '--mail-card-accent-hover': 'var(--color-primary-solid-hover-bg)',
  '--mail-card-accent-active': 'var(--color-primary-solid-active-bg)',
  '--mail-card-on-accent': 'var(--color-primary-solid-color)',
  '--mail-card-focus': 'var(--color-primary-500)',
  '--mail-card-link': 'var(--color-primary-plain-color)',
  '--mail-card-rule': 'var(--color-divider)',
  '--mail-card-menu-surface': 'var(--color-surface-popup)',
  '--mail-card-menu-shadow': 'var(--shadow-md)',
  '--mail-card-menu-hover': 'var(--color-neutral-plain-hover-bg)',
  '--mail-card-font': 'var(--font-body)',
} as React.CSSProperties;

// `google` paints with joy's values until its measured ones land.
const THEMES: Record<Theme, React.CSSProperties> = { joy: JOY_THEME, google: JOY_THEME };

/*
 * Gmail's card: 20 px / 40 px padding, 8 px corners, measured on Gmail web. No outer margin —
 * where the card sits is the host's call. `overflow-wrap: anywhere` is inherited by every block,
 * so a long word or URL breaks rather than pushing the card wider than its parent.
 */
const ROOT_CLASSES = cx(
  'min-w-0 gap-0 rounded-[8px] p-[20px_40px] [overflow-wrap:anywhere]',
  'border-[var(--mail-card-border)] bg-[var(--mail-card-surface)] text-[var(--mail-card-text)]',
  '[box-shadow:var(--mail-card-shadow)] [font-family:var(--mail-card-font)]',
);

function blocksOf<T extends MailCardBlock['type']>(spec: CardSpec, type: T) {
  return spec.blocks.filter(
    (block): block is Extract<MailCardBlock, { type: T }> => block.type === type,
  );
}

/**
 * The `google` layout: the first header, each rows block as its own grid, and a footer that shows
 * the status if there is one, or else the actions — text links first, the primary on the right,
 * whatever their order in the input. The footer is left out when it would be empty.
 */
function GoogleLayout({ spec }: { spec: CardSpec }) {
  const [header] = blocksOf(spec, 'header');
  const [status] = blocksOf(spec, 'status');
  const actions = blocksOf(spec, 'actions')
    .flatMap((block) => block.actions)
    .filter(isRenderableAction);
  const ordered = [
    ...actions.filter((action) => !action.primary),
    ...actions.filter((action) => action.primary),
  ];

  return (
    <>
      <MailCardHeader title={header.title} subtitle={header.subtitle} />
      {blocksOf(spec, 'rows').map((block, i) => (
        <MailCardRows key={i}>
          {block.rows.map((row, j) => (
            <MailCardRow key={j} {...row} />
          ))}
        </MailCardRows>
      ))}
      {(status || ordered.length > 0) && (
        <MailCardFooter>
          {status ? (
            <MailCardStatus label={status.label} tone={status.tone} />
          ) : (
            ordered.map((action, i) => <MailCardAction key={i} action={action} />)
          )}
        </MailCardFooter>
      )}
    </>
  );
}

/**
 * A card at a mail, in the layout of Gmail's own cards: a header with the Hintoric mark, rows of
 * label and value in two columns, and a footer with the actions or a status.
 *
 * Three inputs, first one present wins: `children` composed from the `MailCard*` blocks, a `spec`
 * (Core's block JSON after `parseCardSpec`), or a schema.org `jsonLd` object. A `spec` without a
 * header, or `jsonLd` that is not a card, renders nothing at all — not an empty card.
 *
 * Shows no text of its own: everything comes from the input or from `messages`. Self-contained for
 * a shadow root: `colorScheme` alone sets the scheme, and nothing is portalled out of the card.
 */
export function MailCard({
  spec,
  jsonLd,
  children,
  theme = 'joy',
  colorScheme,
  messages,
  locale: localeProp,
  showLogo = true,
  onOffer,
  onFeedback,
  className,
}: MailCardProps) {
  const defaults = useDateTimeDefaults();
  const locale = localeProp ?? defaults.locale;
  const context = React.useMemo(
    () => ({ locale, messages, showLogo, onOffer, onFeedback }),
    [locale, messages, showLogo, onOffer, onFeedback],
  );

  const composed = React.Children.toArray(children).length > 0;
  const card = composed
    ? null
    : (spec ?? (jsonLd === undefined ? null : jsonLdToSpec(jsonLd, messages.schemaOrg, locale)));
  if (!composed && !card?.blocks.some((block) => block.type === 'header')) return null;

  return (
    <MailCardContext.Provider value={context}>
      <Card
        data-color-scheme={colorScheme}
        style={THEMES[theme]}
        className={cx(ROOT_CLASSES, className)}
      >
        {card ? <GoogleLayout spec={card} /> : children}
      </Card>
    </MailCardContext.Provider>
  );
}
