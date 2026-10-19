'use client';
import * as React from 'react';
import { Card } from '../Card';
import { cx } from '../../utils/cx';
import { useOptionalColorScheme } from '../../theme/ColorSchemeProvider';
import { useDateTimeDefaults } from '../../theme/DateTimeProvider';
import { MailCardContext } from './MailCardContext';
import {
  MailCardAction,
  MailCardFeedback,
  MailCardFooter,
  MailCardHeader,
  MailCardRow,
  MailCardRows,
  MailCardStatus,
  isRenderableAction,
} from './blocks';
import { jsonLdToSpec } from './schemaOrg';
import { mailCardThemeStyle } from './themes';
import { parseCardSpec } from './spec';
import type { CardSpec, MailCardBlock } from './spec';
import type { MailCardProps } from './types';

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
 * The `google` layout: the first header, each rows block as its own grid, and a footer with the
 * feedback question on the left and, on the right, the status if there is one, or else the actions
 * — text links first, the primary on the right, whatever their order in the input. The footer is
 * left out when it would be empty.
 */
function GoogleLayout({ spec }: { spec: CardSpec }) {
  const [header] = blocksOf(spec, 'header');
  const [status] = blocksOf(spec, 'status');
  const [feedback] = blocksOf(spec, 'feedback');
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
      {(feedback || status || ordered.length > 0) && (
        <MailCardFooter>
          {feedback && <MailCardFeedback question={feedback.question} />}
          {!status && ordered.map((action, i) => <MailCardAction key={i} action={action} />)}
          {/* Always mounted, empty until there is a status: a live region only announces text
              that arrives *after* it is in the page. Nothing but the status is ever inside it —
              the actions, and the menu of a split button, are its siblings. Empty, it is taken
              out of the flow, so it costs no gap in the footer's row. */}
          <MailCardStatus label={status?.label ?? ''} tone={status?.tone ?? 'neutral'} />
        </MailCardFooter>
      )}
    </>
  );
}

/**
 * A card at a mail, in the layout of Gmail's own cards: a header with the Hintoric mark, rows of
 * label and value in two columns, and a footer with the feedback question, and the actions or a
 * status.
 *
 * Three inputs, first one present wins: `children` composed from the `MailCard*` blocks, a `spec`
 * (Core's block JSON), or a schema.org `jsonLd` object. A `spec` is run through `parseCardSpec`
 * here too, so a host that forwards Core's JSON cast to `CardSpec` cannot crash the page with a
 * malformed one: what the parser cannot use is dropped. A `spec` without a header, or `jsonLd` that
 * is not a card, renders nothing at all — not an empty card.
 *
 * Shows no text of its own: everything comes from the input or from `messages`. Self-contained for
 * a shadow root: `colorScheme` alone sets the scheme, and nothing is portalled out of the card.
 *
 * The feedback block keeps its answer in its own state, which outlives a change of `spec`: give the
 * card a `key` that is unique per mail (a message id), so the next mail asks its question afresh.
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
  // The theme's values are concrete colours, so it needs a scheme to pick them: the prop, else the
  // scheme a `ColorSchemeProvider` above has resolved, else light. In a shadow root there is no
  // provider, and the prop alone decides.
  const providerScheme = useOptionalColorScheme()?.resolvedMode;
  const scheme = colorScheme ?? providerScheme ?? 'light';
  const locale = localeProp ?? defaults.locale;
  const context = React.useMemo(
    () => ({ locale, messages, showLogo, onOffer, onFeedback }),
    [locale, messages, showLogo, onOffer, onFeedback],
  );

  const composed = React.Children.toArray(children).length > 0;

  // A `spec` is only typed, never checked: a cast of untrusted JSON gets here as it came. The
  // parser never throws, and hands a valid spec back as it is. A `spec` that is present decides,
  // even when it turns out to be no card: `jsonLd` is only for a card without one.
  const parsedSpec = React.useMemo(
    () => (composed || spec == null ? null : parseCardSpec(spec)),
    [composed, spec],
  );

  let card: CardSpec | null = null;
  if (!composed) {
    if (spec != null) card = parsedSpec;
    else if (jsonLd !== undefined) card = jsonLdToSpec(jsonLd, messages.schemaOrg, locale);
  }
  if (!composed && !card?.blocks.some((block) => block.type === 'header')) return null;

  return (
    <MailCardContext.Provider value={context}>
      <Card
        data-color-scheme={colorScheme}
        style={mailCardThemeStyle(theme, scheme)}
        className={cx(ROOT_CLASSES, className)}
      >
        {card ? <GoogleLayout spec={card} /> : children}
      </Card>
    </MailCardContext.Provider>
  );
}
