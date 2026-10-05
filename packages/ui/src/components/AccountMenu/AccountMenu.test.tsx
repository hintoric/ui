import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountMenu } from './AccountMenu';
import { MenuItem } from '../MenuItem';
import { ColorSchemeProvider } from '../../theme/ColorSchemeProvider';
import { LocaleProvider } from '../../theme/LocaleProvider';

const locales = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en-US', label: 'English' },
];

function setup(ui: React.ReactElement) {
  const user = userEvent.setup();
  render(<ColorSchemeProvider defaultMode="system">{ui}</ColorSchemeProvider>);
  return user;
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Account' }));
  return screen.findByRole('menu');
}

describe('AccountMenu', () => {
  it('shows the letter of the address in the pill, skipping non-letters', () => {
    setup(<AccountMenu user={{ email: '_max@example.com' }} />);
    expect(screen.getByRole('toolbar', { name: 'Account' })).toHaveTextContent('M');
  });

  it('prefers the name for the letter and the card heading', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com', name: 'Erika Muster' }} subtitle="Acme" />);
    await open(user);
    expect(screen.getByText('Erika Muster')).toBeInTheDocument();
    expect(screen.getByText('max@example.com')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('drills into appearance and back without closing', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} />);
    await open(user);

    await user.click(screen.getByRole('menuitem', { name: /Appearance/ }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Back' })).toHaveFocus();

    await user.click(screen.getByRole('menuitem', { name: 'Back' }));
    expect(screen.getByRole('menuitem', { name: /Appearance/ })).toHaveFocus();
  });

  it('sets the scheme, returns to the top and shows the new value there', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} />);
    await open(user);

    await user.click(screen.getByRole('menuitem', { name: /Appearance/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Dark' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Appearance/ })).toHaveTextContent('Dark');
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
  });

  it('offers a language view only when languages are known', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} />);
    await open(user);
    expect(screen.queryByRole('menuitem', { name: /Language/ })).not.toBeInTheDocument();
  });

  it('changes the language from props', async () => {
    const onLocaleChange = vi.fn();
    const user = setup(
      <AccountMenu user={{ email: 'max@example.com' }} locales={locales} locale="de-DE" onLocaleChange={onLocaleChange} />,
    );
    await open(user);

    const row = screen.getByRole('menuitem', { name: /Language/ });
    expect(row).toHaveTextContent('Deutsch');
    await user.click(row);
    await user.click(screen.getByRole('menuitem', { name: 'English' }));

    expect(onLocaleChange).toHaveBeenCalledWith('en-US');
    expect(screen.getByRole('menuitem', { name: /Language/ })).toHaveFocus();
  });

  it('falls back to a LocaleProvider', async () => {
    const onLocaleChange = vi.fn();
    const user = setup(
      <LocaleProvider locale="en-US" locales={locales} onLocaleChange={onLocaleChange}>
        <AccountMenu user={{ email: 'max@example.com' }} />
      </LocaleProvider>,
    );
    await open(user);
    expect(screen.getByRole('menuitem', { name: /Language/ })).toHaveTextContent('English');
  });

  it('takes its labels from props', async () => {
    const user = userEvent.setup();
    render(
      <ColorSchemeProvider defaultMode="light">
        <AccountMenu
          user={{ email: 'max@example.com' }}
          onSignOut={() => {}}
          labels={{
            menu: 'Konto',
            appearance: 'Darstellung',
            back: 'zurück',
            signOut: 'Abmelden',
            colorScheme: { light: 'Hell' },
          }}
        />
      </ColorSchemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Konto' }));
    expect(await screen.findByRole('menuitem', { name: 'Abmelden' })).toBeInTheDocument();
    const row = screen.getByRole('menuitem', { name: /Darstellung/ });
    expect(row).toHaveTextContent('Hell');
    await user.click(row);
    expect(screen.getByRole('menuitem', { name: 'zurück' })).toBeInTheDocument();
  });

  it('signs out, and closes like an ordinary item', async () => {
    const onSignOut = vi.fn();
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} onSignOut={onSignOut} />);
    await open(user);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('has no sign-out row without onSignOut', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} />);
    await open(user);
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('disables sign-out while signingOut', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} onSignOut={() => {}} signingOut />);
    await open(user);
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveAttribute('aria-disabled', 'true');
  });

  it("renders the caller's items, which close the menu", async () => {
    const onClick = vi.fn();
    const user = setup(
      <AccountMenu user={{ email: 'max@example.com' }} items={<MenuItem onClick={onClick}>Layouts</MenuItem>} />,
    );
    await open(user);
    await user.click(screen.getByRole('menuitem', { name: 'Layouts' }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('starts at the top again on the next opening', async () => {
    const user = setup(<AccountMenu user={{ email: 'max@example.com' }} />);
    await open(user);
    await user.click(screen.getByRole('menuitem', { name: /Appearance/ }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await open(user);
    expect(screen.getByRole('menuitem', { name: /Appearance/ })).toBeInTheDocument();
  });

  it('works without a ColorSchemeProvider when appearance is off', async () => {
    const user = userEvent.setup();
    render(<AccountMenu user={{ email: 'max@example.com' }} appearance={false} />);
    await open(user);
    expect(screen.queryByRole('menuitem', { name: /Appearance/ })).not.toBeInTheDocument();
  });
});
