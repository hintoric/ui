'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { useDateTimeDefaults } from '../../theme/DateTimeProvider';
import { MailCardContext } from './MailCardContext';
import { FOCUS_RING, PILL_SURFACE_CLASSES } from './classes';
import { MailCardIcon, MailCardLogo } from './icons';
import { SplitAction } from './SplitAction';
import { isHttpsUrl } from './spec';
import type { MailCardActionData } from './spec';
import type {
  MailCardActionProps,
  MailCardFooterProps,
  MailCardHeaderProps,
  MailCardRowProps,
  MailCardRowsProps,
  MailCardStatusProps,
} from './types';

/*
 * Gmail's card layout, measured on Gmail web (spec table, 19.10.2026). Every text — title, labels,
 * values, the feedback question — starts 30 px right of the icon column, so each block lays out an
 * icon column plus a gap that add up to 30. The values are px, not Tailwind's rem scale: the card
 * renders inside Gmail's page, whose root font size is not ours to rely on.
 *
 * Colours and the font come only from the `--mail-card-*` properties the theme sets on the card
 * root, so a theme never has to restyle a block.
 */

/** A date-only ISO value: a day on the calendar, not a moment. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Day and short month, the way `locale` writes them ("1. Nov."). `new Date()` reads a date-only
 * value as midnight UTC, so it is formatted in UTC — in the reader's zone it would turn into the
 * day before everywhere west of Greenwich. A date-time is a moment and follows `timeZone`.
 */
function formatDate(
  date: string,
  locale: string | undefined,
  timeZone: string | undefined,
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: DATE_ONLY.test(date) ? 'UTC' : timeZone,
    }).format(new Date(date));
  } catch {
    // `Intl` throws a RangeError on an invalid date, locale or zone. The input as it came beats a
    // card that does not render.
    return date;
  }
}

/**
 * Links leave for `https:` only. `parseCardSpec` drops the rest from untrusted JSON; this is the
 * same rule (`isHttpsUrl`) for a typed `spec` or JSX, which no parser has seen.
 */
export function isRenderableAction(action: MailCardActionData): boolean {
  return !('url' in action) || isHttpsUrl(action.url);
}

/** The title and subtitle, with the Hintoric mark in the icon column. */
export function MailCardHeader({ title, subtitle, className }: MailCardHeaderProps) {
  const { showLogo } = React.useContext(MailCardContext);
  return (
    <div className={cx('grid grid-cols-[24px_minmax(0,1fr)] items-center gap-x-[6px]', className)}>
      {showLogo && <MailCardLogo className="text-[var(--mail-card-title)]" />}
      <div className="col-start-2 min-w-0">
        <div className="text-[16px]/[20px] font-medium text-[var(--mail-card-title)]">{title}</div>
        {subtitle && (
          <div className="text-[14px]/[20px] font-normal text-[var(--mail-card-label)]">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The rows in two columns of at most 362 px, 48 px apart, filled left to right. `minmax(0, …)` lets
 * a column shrink below its content on a narrow card, so a long value wraps instead of overflowing.
 */
export function MailCardRows({ children, className }: MailCardRowsProps) {
  return (
    <div className={cx('grid grid-cols-[repeat(2,minmax(0,362px))] gap-x-[48px]', className)}>
      {children}
    </div>
  );
}

/**
 * One cell: 20 px of space, then label and value (16 + 2 + 18 = 56 px for a one-line value), with
 * the icon centred on the two of them rather than on the cell. Without an icon the text keeps its
 * edge.
 */
export function MailCardRow({ icon, label, value, className }: MailCardRowProps) {
  const card = React.useContext(MailCardContext);
  const defaults = useDateTimeDefaults();
  return (
    <div
      data-mail-card-row=""
      className={cx(
        'grid min-w-0 grid-cols-[20px_minmax(0,1fr)] items-center gap-x-[10px] pt-[20px]',
        className,
      )}
    >
      {icon && <MailCardIcon name={icon} className="text-[var(--mail-card-label)]" />}
      <div className="col-start-2 min-w-0">
        <div className="text-[12px]/[16px] font-medium text-[var(--mail-card-label)]">{label}</div>
        <div className="mt-[2px] text-[14px]/[18px] font-normal text-[var(--mail-card-text)]">
          {typeof value === 'string' ? (
            value
          ) : (
            <time dateTime={value.date}>
              {formatDate(value.date, card.locale ?? defaults.locale, defaults.timeZone)}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A rule (16 px above, 12 px below) and one 36 px row — the height of the primary button, so the
 * card keeps its height when a status replaces the actions.
 *
 * The children line up on the right. The feedback block goes first and takes `margin-right: auto`,
 * which keeps it on the left and the rest on the right; on a narrow card the row wraps, still
 * aligned right.
 *
 * The footer is a size container, so the menu of a split button can cap its width at the card's
 * content width (`100cqw`) however narrow the card is.
 */
export function MailCardFooter({ children, className }: MailCardFooterProps) {
  return (
    <div className={cx('mt-[16px] [container-type:inline-size]', className)}>
      <hr className="m-0 h-px border-0 bg-[var(--mail-card-rule)]" />
      <div className="mt-[12px] flex min-h-[36px] flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
        {children}
      </div>
    </div>
  );
}

/**
 * The primary action: a pill, 36 px high, 14 px / 500, in the accent colour, darkening on hover
 * and press like a solid primary `Button` (`PILL_SURFACE_CLASSES`, which a split button shares).
 * `max-w-full` and the inherited `overflow-wrap: anywhere` wrap a long label inside the pill.
 */
export const PILL_CLASSES = cx(
  PILL_SURFACE_CLASSES,
  'max-w-full rounded-[9999px] px-[20px] py-[8px]',
);

/**
 * Any other action: a text link, 14 px / 500. Its own colour, not the accent: a fill colour that
 * carries white text is too dark to be text itself on a dark surface.
 */
const LINK_CLASSES = cx(
  'inline max-w-full cursor-pointer rounded-[2px] border-0 bg-transparent p-0 text-left',
  'text-[14px]/[20px] font-medium text-[var(--mail-card-link)] no-underline hover:underline',
  FOCUS_RING,
);

/**
 * An action: a pill when it is primary, a text link otherwise. A `url` opens in a new tab and tells
 * the target nothing about the mail it came from; an `offer` calls the card's `onOffer`.
 *
 * A primary offer with `alternatives` is a split button: the main part calls `onOffer()` as a plain
 * offer does, an item of the menu behind the arrow calls `onOffer(alternative)`. Only that case —
 * a link has nothing to pre-approve, and a text action has no pill to attach an arrow to. Outside a
 * `MailCard` there are no `messages` to name the arrow, so there the offer stays a plain pill.
 */
export function MailCardAction({ action, className }: MailCardActionProps) {
  const { onOffer, messages } = React.useContext(MailCardContext);
  if (!isRenderableAction(action)) return null;

  const classes = cx(action.primary ? PILL_CLASSES : LINK_CLASSES, className);
  if ('url' in action) {
    return (
      <a href={action.url} target="_blank" rel="noreferrer" className={classes}>
        {action.label}
      </a>
    );
  }
  if (action.primary && action.alternatives?.length && messages) {
    return (
      <SplitAction
        action={{ label: action.label, alternatives: action.alternatives }}
        onMain={() => onOffer?.()}
        onAlternative={(alternative) => onOffer?.(alternative)}
        moreActionsLabel={messages.moreActions}
        className={className}
      />
    );
  }
  return (
    <button type="button" className={classes} onClick={() => onOffer?.()}>
      {action.label}
    </button>
  );
}

/**
 * What happened, in place of the actions. A live region, so a status that replaces the buttons
 * after a click is read out.
 */
export function MailCardStatus({ label, tone, className }: MailCardStatusProps) {
  return (
    <p
      role="status"
      data-tone={tone}
      className={cx(
        'm-0 min-w-0 text-right text-[14px]/[20px] font-normal text-[var(--mail-card-label)]',
        className,
      )}
    >
      {label}
    </p>
  );
}
