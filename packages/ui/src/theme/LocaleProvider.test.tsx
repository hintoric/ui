import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale } from './LocaleProvider';

const locales = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

function Consumer() {
  const { locale, setLocale, locales: offered } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="has-setter">{String(Boolean(setLocale))}</span>
      <span data-testid="locales">
        {offered ? offered.map((option) => option.value).join(',') : 'undefined'}
      </span>
      <button onClick={() => setLocale?.('en')}>switch</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  it('provides locale, setLocale and locales to descendants', () => {
    render(
      <LocaleProvider locale="de" onLocaleChange={vi.fn()} locales={locales}>
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('de');
    expect(screen.getByTestId('has-setter')).toHaveTextContent('true');
    expect(screen.getByTestId('locales')).toHaveTextContent('de,en');
  });

  it('hands the chosen value to onLocaleChange', async () => {
    const user = userEvent.setup();
    const onLocaleChange = vi.fn();
    render(
      <LocaleProvider locale="de" onLocaleChange={onLocaleChange} locales={locales}>
        <Consumer />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'switch' }));

    expect(onLocaleChange).toHaveBeenCalledWith('en');
  });

  it('leaves setLocale undefined when no onLocaleChange is given', () => {
    render(
      <LocaleProvider locale="de">
        <Consumer />
      </LocaleProvider>,
    );

    // A read-only source is a real case: an app that wants RelativeTime in
    // German without offering a switcher should not have to invent a no-op.
    expect(screen.getByTestId('has-setter')).toHaveTextContent('false');
  });

  it('leaves locales undefined when none are given', () => {
    render(
      <LocaleProvider locale="de">
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('locales')).toHaveTextContent('undefined');
  });

  it('throws a clear error when useLocale is used outside the provider', () => {
    function Bad() {
      useLocale();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useLocale must be used within a LocaleProvider');
  });
});
