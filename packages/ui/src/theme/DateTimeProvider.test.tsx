import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateTimeProvider, useDateTimeDefaults } from './DateTimeProvider';
import { LocaleProvider } from './LocaleProvider';

function Consumer() {
  const defaults = useDateTimeDefaults();
  return <span data-testid="defaults">{JSON.stringify(defaults)}</span>;
}

describe('DateTimeProvider', () => {
  it('useDateTimeDefaults returns {} when no provider is mounted', () => {
    render(<Consumer />);
    expect(screen.getByTestId('defaults')).toHaveTextContent('{}');
  });

  it('provides the given locale/timeZone/hourCycle to descendants', () => {
    render(
      <DateTimeProvider locale="de-DE" timeZone="Europe/Berlin" hourCycle="h23">
        <Consumer />
      </DateTimeProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults).toEqual({ locale: 'de-DE', timeZone: 'Europe/Berlin', hourCycle: 'h23' });
  });

  it('supports partial values', () => {
    render(
      <DateTimeProvider timeZone="UTC">
        <Consumer />
      </DateTimeProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults.timeZone).toBe('UTC');
    expect(defaults.locale).toBeUndefined();
  });

  it('falls back to the LocaleProvider for the locale', () => {
    render(
      <LocaleProvider locale="de-DE">
        <Consumer />
      </LocaleProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults.locale).toBe('de-DE');
  });

  it('takes only the locale from the LocaleProvider, never timeZone or hourCycle', () => {
    render(
      <LocaleProvider locale="de-DE">
        <Consumer />
      </LocaleProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults).toEqual({ locale: 'de-DE' });
  });

  it("its own locale wins over the LocaleProvider's", () => {
    render(
      <LocaleProvider locale="en">
        <DateTimeProvider locale="de-DE" timeZone="Asia/Tokyo">
          <Consumer />
        </DateTimeProvider>
      </LocaleProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults).toEqual({ locale: 'de-DE', timeZone: 'Asia/Tokyo' });
  });
});
