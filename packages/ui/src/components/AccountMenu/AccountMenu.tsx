'use client';
import * as React from 'react';
import { Avatar } from '../Avatar';
import { ColorSchemeMenuItems } from '../ColorSchemeMenuItems';
import { Dropdown } from '../Dropdown';
import { FloatingBar, FloatingBarMenuButton } from '../FloatingBar';
import { ListDivider } from '../ListDivider';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { Typography } from '../Typography';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { useLocaleContext } from '../../theme/LocaleProvider';
import { resolveColorSchemeLabels } from '../../internal/colorScheme';
import { LocaleFlag } from '../../internal/localeFlag';
import { ArrowBackIcon } from '../../internal/svg-icons/ArrowBackIcon';
import { ChevronRightIcon } from '../../internal/svg-icons/ChevronRightIcon';
import { DarkModeIcon } from '../../internal/svg-icons/DarkModeIcon';
import { LogoutIcon } from '../../internal/svg-icons/LogoutIcon';
import { MenuIcon } from '../../internal/svg-icons/MenuIcon';
import { TranslateIcon } from '../../internal/svg-icons/TranslateIcon';
import type { AccountMenuProps } from './types';

type View = 'root' | 'appearance' | 'language';

const ICON = 'size-5 shrink-0';

/**
 * The first letter of the name, or of the address — a letter, not the first
 * character: "(Max)" or "_info@" must not put a bracket or a dash on the face.
 */
function initialOf(text: string): string {
  return (text.match(/\p{L}/u)?.[0] ?? text.charAt(0)).toUpperCase();
}

/** A row that opens a sub-view, showing the setting's current value. */
const ViewRow = React.forwardRef<
  HTMLDivElement,
  { icon: React.ReactNode; label: React.ReactNode; value: React.ReactNode; onOpen: () => void }
>(function ViewRow({ icon, label, value, onOpen }, ref) {
  return (
    <MenuItem ref={ref} closeOnClick={false} onClick={onOpen}>
      {icon}
      <span>{label}</span>
      <span className="ml-auto pl-4 text-ink-tertiary">{value}</span>
      <ChevronRightIcon className={`${ICON} -mr-1 text-ink-tertiary`} />
    </MenuItem>
  );
});

/** Its own component so `useColorScheme` only runs when the view is offered. */
const AppearanceRow = React.forwardRef<
  HTMLDivElement,
  { label: React.ReactNode; labels: AccountMenuProps['labels']; onOpen: () => void }
>(function AppearanceRow({ label, labels, onOpen }, ref) {
  const { mode } = useColorScheme();
  return (
    <ViewRow
      ref={ref}
      icon={<DarkModeIcon className={ICON} />}
      label={label}
      value={resolveColorSchemeLabels(labels?.colorScheme)[mode]}
      onOpen={onOpen}
    />
  );
});

/**
 * The signed-in person in one pill — avatar and menu button — and a menu that
 * opens with a card (avatar, address, subtitle), then the two settings a
 * person changes for themselves, then the caller's own items and sign-out.
 *
 * Appearance and language drill down in place: the row shows the current
 * value, a click swaps the popup's contents for the choices and a row back,
 * and a choice returns to the top showing the new value — the confirmation is
 * the menu itself. Those rows are `closeOnClick={false}`; everything else
 * closes the menu as usual, and the next opening starts at the top again.
 *
 * Knows no session, no routes and no i18n: who, the labels and what signing
 * out does all come in as props, so applications that share no code show the
 * same menu. A signed-out visitor is the caller's to handle — there is no one
 * to show here.
 */
export function AccountMenu({
  user,
  subtitle,
  labels,
  onSignOut,
  signingOut = false,
  items,
  appearance = true,
  locales: localesProp,
  locale: localeProp,
  onLocaleChange: onLocaleChangeProp,
  flags = true,
  size = 'md',
  ...barProps
}: AccountMenuProps) {
  const [view, setView] = React.useState<View>('root');
  const previous = React.useRef<View>('root');
  const backRow = React.useRef<HTMLDivElement>(null);
  const appearanceRow = React.useRef<HTMLDivElement>(null);
  const languageRow = React.useRef<HTMLDivElement>(null);
  const viaKeyboard = React.useRef(false);

  const context = useLocaleContext();
  const locales = localesProp ?? context?.locales;
  const locale = localeProp ?? context?.locale;
  const onLocaleChange = onLocaleChangeProp ?? context?.setLocale;
  const languages = locales && locale !== undefined && onLocaleChange ? { locales, locale, onLocaleChange } : null;

  const menuLabel = labels?.menu ?? 'Account';
  const appearanceLabel = labels?.appearance ?? 'Appearance';
  const languageLabel = labels?.language ?? 'Language';
  const backLabel = labels?.back ?? 'Back';
  const initial = initialOf(user.name || user.email);

  function show(next: View) {
    previous.current = view;
    setView(next);
  }

  /*
   * The clicked row unmounts with the view it belonged to, and focus would
   * fall to the body — out of the menu, and out of reach of the arrow keys.
   * So focus follows: into a sub-view onto its back row, and out of one onto
   * the row that opened it.
   *
   * Focus moved by script from the body counts as keyboard focus to the
   * browser, and would draw a ring after a mouse click too. So the ring
   * follows how the row was activated, which the popup records.
   */
  React.useEffect(() => {
    const target =
      view !== 'root'
        ? backRow.current
        : previous.current === 'appearance'
          ? appearanceRow.current
          : previous.current === 'language'
            ? languageRow.current
            : null;
    target?.focus({ focusVisible: viaKeyboard.current });
  }, [view]);

  function onOpenChange(open: boolean) {
    if (!open) {
      previous.current = 'root';
      setView('root');
    }
  }

  const currentLanguage = languages?.locales.find((entry) => entry.value === languages.locale);

  return (
    <FloatingBar size={size} aria-label={menuLabel} {...barProps}>
      {/* The avatar is who; the button beside it is the handle. A face that is
          also a button invites a click that opens nothing anyone expected. */}
      <Avatar variant="solid" color="primary" size="sm" src={user.avatarSrc}>
        {initial}
      </Avatar>
      <Dropdown onOpenChange={onOpenChange}>
        <FloatingBarMenuButton aria-label={menuLabel}>
          <MenuIcon className={ICON} />
        </FloatingBarMenuButton>
        <Menu
          className="w-72 min-w-0 max-w-[calc(100vw-2rem)] max-h-[80vh]"
          onKeyDown={() => (viaKeyboard.current = true)}
          onPointerDown={() => (viaKeyboard.current = false)}
        >
          {view === 'root' && (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar variant="solid" color="primary" size="lg" src={user.avatarSrc}>
                  {initial}
                </Avatar>
                <div className="min-w-0">
                  <Typography level="title-md" className="truncate">
                    {user.name || user.email}
                  </Typography>
                  {user.name && (
                    <Typography level="body-sm" className="truncate">
                      {user.email}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography level="body-sm" className="truncate">
                      {subtitle}
                    </Typography>
                  )}
                </div>
              </div>
              {(appearance || languages) && <ListDivider />}
              {appearance && (
                <AppearanceRow
                  ref={appearanceRow}
                  label={appearanceLabel}
                  labels={labels}
                  onOpen={() => show('appearance')}
                />
              )}
              {languages && (
                <ViewRow
                  ref={languageRow}
                  icon={<TranslateIcon className={ICON} />}
                  label={languageLabel}
                  value={currentLanguage ? currentLanguage.label : languages.locale}
                  onOpen={() => show('language')}
                />
              )}
              {items && (
                <>
                  <ListDivider />
                  {items}
                </>
              )}
              {onSignOut && (
                <>
                  <ListDivider />
                  <MenuItem disabled={signingOut} onClick={onSignOut}>
                    <LogoutIcon className={ICON} />
                    {labels?.signOut ?? 'Sign out'}
                  </MenuItem>
                </>
              )}
            </>
          )}
          {view !== 'root' && (
            <>
              <MenuItem ref={backRow} closeOnClick={false} aria-label={backLabel} onClick={() => show('root')}>
                <ArrowBackIcon className={ICON} />
                {view === 'appearance' ? appearanceLabel : languageLabel}
              </MenuItem>
              <ListDivider />
            </>
          )}
          {view === 'appearance' && (
            <ColorSchemeMenuItems
              labels={labels?.colorScheme}
              closeOnClick={false}
              onModeChange={() => show('root')}
            />
          )}
          {view === 'language' &&
            languages?.locales.map((entry) => (
              <MenuItem
                key={entry.value}
                selected={entry.value === languages.locale}
                closeOnClick={false}
                onClick={() => {
                  languages.onLocaleChange(entry.value);
                  show('root');
                }}
              >
                {flags && <LocaleFlag locale={entry} size="md" />}
                {entry.label}
              </MenuItem>
            ))}
        </Menu>
      </Dropdown>
    </FloatingBar>
  );
}
