import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { RelativeTime } from '../components/RelativeTime';

// RelativeTime is exempt from this suite's usual "compare against real
// @mui/joy" rule (see docs/superpowers/specs/2026-09-04-relative-time-design.md,
// Section 3): Joy UI has no equivalent component. These are self-baseline
// screenshots only -- toMatchScreenshot() against RelativeTime's own prior
// screenshots, for humans to review typographic regressions even though the
// component's value is primarily text, not a "look" to compare pixel-by-pixel.

// RelativeTime computes elapsed time against the real Date.now() at render
// time -- there is no fake-timers equivalent in this real-browser suite, so
// offsets below are computed from the actual current time (not a fixed
// historical literal) to keep the rendered text ("3 days ago" etc.)
// deterministic regardless of which real day this test happens to run on.
function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

describe('RelativeTime visual (self-baseline)', () => {
  it('relative past matches its own baseline screenshot', async () => {
    render(<RelativeTime date={daysFromNow(-3)} locale="en" data-testid="rt-past" />);
    await expect(page.getByTestId('rt-past')).toMatchScreenshot('relative-time-past');
  });

  it('relative future matches its own baseline screenshot', async () => {
    render(<RelativeTime date={minutesFromNow(5)} locale="en" data-testid="rt-future" />);
    await expect(page.getByTestId('rt-future')).toMatchScreenshot('relative-time-future');
  });

  it('format="datetime" matches its own baseline screenshot', async () => {
    // Unlike the relative-format cases above, 'datetime' mode's displayed
    // text is independent of "now" (it always formats the given date
    // absolutely) -- a fixed literal date keeps this screenshot stable
    // across real-world days, where a now-relative offset would not.
    render(
      <RelativeTime date="2026-07-06T12:00:00Z" format="datetime" locale="en" timeZone="UTC" data-testid="rt-datetime" />,
    );
    await expect(page.getByTestId('rt-datetime')).toMatchScreenshot('relative-time-datetime');
  });

  it('format="micro" matches its own baseline screenshot', async () => {
    render(<RelativeTime date={daysFromNow(-3)} format="micro" locale="en" data-testid="rt-micro" />);
    await expect(page.getByTestId('rt-micro')).toMatchScreenshot('relative-time-micro');
  });
});
