import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import { RelativeTime } from './RelativeTime';
import { DateTimeProvider } from '../../theme/DateTimeProvider';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-04T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RelativeTime', () => {
  it('renders a <time> element with dateTime and a relative text', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" />);
    const time = screen.getByText('3 days ago');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-09-01T12:00:00.000Z');
  });

  it('sets the absolute time as the title attribute', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" timeZone="UTC" />);
    const time = screen.getByText('3 days ago');
    expect(time).toHaveAttribute('title', expect.stringContaining('2026'));
  });

  it('noTitle omits the title attribute', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" noTitle />);
    const time = screen.getByText('3 days ago');
    expect(time).not.toHaveAttribute('title');
  });

  it('accepts a Date object directly', () => {
    render(<RelativeTime date={new Date('2026-09-01T12:00:00Z')} locale="en" />);
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('updates its text as time passes, without a manual re-render', async () => {
    render(<RelativeTime date="2026-09-04T11:59:30Z" locale="en" />);
    expect(screen.getByText('30 seconds ago')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
  });

  it('a format="datetime" instance never registers with the shared scheduler', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" format="datetime" locale="en" timeZone="UTC" />);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a relative-format instance registers with the shared scheduler and unregisters on unmount', () => {
    const { unmount } = render(<RelativeTime date="2026-09-04T11:59:30Z" locale="en" />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('multiple mounted instances share exactly one timer', () => {
    const { unmount } = render(
      <>
        <RelativeTime date="2026-09-04T11:59:30Z" locale="en" />
        <RelativeTime date="2026-09-04T11:00:00Z" locale="en" />
        <RelativeTime date="2026-09-01T12:00:00Z" locale="en" />
      </>,
    );
    expect(vi.getTimerCount()).toBe(1);
    unmount();
  });

  it('reads locale/timeZone/hourCycle from DateTimeProvider when no prop is given', () => {
    render(
      <DateTimeProvider locale="de-DE">
        <RelativeTime date="2026-09-01T12:00:00Z" />
      </DateTimeProvider>,
    );
    expect(screen.getByText('vor 3 Tagen')).toBeInTheDocument();
  });

  it('an explicit prop overrides the DateTimeProvider value', () => {
    render(
      <DateTimeProvider locale="de-DE">
        <RelativeTime date="2026-09-01T12:00:00Z" locale="en" />
      </DateTimeProvider>,
    );
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('an invalid date renders an empty <time> without throwing', () => {
    render(<RelativeTime date="not-a-date" />);
    const time = document.querySelector('time');
    expect(time).not.toBeNull();
    expect(time!.textContent).toBe('');
  });

  it('forwards className', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" className="custom" />);
    expect(screen.getByText('3 days ago')).toHaveClass('custom');
  });

  it('forwards data-testid', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" data-testid="my-time" />);
    expect(screen.getByTestId('my-time')).toHaveTextContent('3 days ago');
  });
});
