import { DateTimeProvider, RelativeTime, Typography } from '@hintoric/ui';
import type { RelativeTimeFormatMode, RelativeTimeFormatStyle } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const MODES: RelativeTimeFormatMode[] = ['auto', 'relative', 'datetime', 'duration', 'micro'];
const STYLES: RelativeTimeFormatStyle[] = ['long', 'short', 'narrow'];

const MINUTES_AGO = new Date(Date.now() - 8 * 60 * 1000);
const HOURS_AGO = new Date(Date.now() - 5 * 60 * 60 * 1000);
const DAYS_AGO = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const LAST_YEAR = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
const SOON = new Date(Date.now() + 45 * 60 * 1000);

export function RelativeTimePage() {
  return (
    <>
      <h1>RelativeTime</h1>
      <p className="docs-lede">
        Renders a timestamp as human-readable text — &ldquo;8 minutes ago&rdquo; — inside a{' '}
        <code>&lt;time&gt;</code> element, and keeps it current as the clock moves. It is not a Joy
        UI component; the design follows GitHub&apos;s <code>relative-time-element</code>, built on{' '}
        <code>Intl.RelativeTimeFormat</code>.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography level="body-md">
            Edited <RelativeTime date={MINUTES_AGO} />
          </Typography>
          <Typography level="body-md">
            Deployed <RelativeTime date={HOURS_AGO} />
          </Typography>
          <Typography level="body-md">
            Created <RelativeTime date={DAYS_AGO} />
          </Typography>
          <Typography level="body-md">
            Renews <RelativeTime date={SOON} />
          </Typography>
        </div>
      </Demo>
      <Code>{`<RelativeTime date={post.createdAt} />
<RelativeTime date="2026-09-02T10:00:00Z" />`}</Code>

      <h2>Format modes</h2>
      <p>
        <code>auto</code> is relative text until the date is older than <code>threshold</code>,
        after which it falls back to an absolute date. <code>relative</code> stays relative
        regardless, <code>datetime</code> is always absolute, <code>duration</code> renders an
        elapsed span, and <code>micro</code> is the shortest possible form.
      </p>
      <Demo>
        <table className="docs-props-table">
          <thead>
            <tr>
              <th>format</th>
              <th>3 days ago</th>
              <th>400 days ago</th>
            </tr>
          </thead>
          <tbody>
            {MODES.map((mode) => (
              <tr key={mode}>
                <td>
                  <code>{mode}</code>
                </td>
                <td>
                  <RelativeTime date={DAYS_AGO} format={mode} />
                </td>
                <td>
                  <RelativeTime date={LAST_YEAR} format={mode} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Demo>
      <Code>{`<RelativeTime date={date} format="micro" />`}</Code>

      <h2>Format style</h2>
      <Demo>
        <table className="docs-props-table">
          <thead>
            <tr>
              <th>formatStyle</th>
              <th>8 minutes ago</th>
              <th>3 days ago</th>
            </tr>
          </thead>
          <tbody>
            {STYLES.map((style) => (
              <tr key={style}>
                <td>
                  <code>{style}</code>
                </td>
                <td>
                  <RelativeTime date={MINUTES_AGO} formatStyle={style} />
                </td>
                <td>
                  <RelativeTime date={DAYS_AGO} formatStyle={style} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Demo>
      <Code>{`<RelativeTime date={date} formatStyle="short" />`}</Code>

      <h2>Threshold</h2>
      <p>
        <code>threshold</code> is an ISO-8601 duration. Past it, <code>auto</code> switches to an
        absolute date. The default is <code>P30D</code> — thirty days.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography level="body-md">
            Default (P30D): <RelativeTime date={DAYS_AGO} />
          </Typography>
          <Typography level="body-md">
            P1D: <RelativeTime date={DAYS_AGO} threshold="P1D" />
          </Typography>
          <Typography level="body-md">
            P1Y: <RelativeTime date={LAST_YEAR} threshold="P1Y" />
          </Typography>
        </div>
      </Demo>
      <Code>{`<RelativeTime date={date} threshold="P1D" />`}</Code>

      <h2>Precision</h2>
      <p>
        <code>precision</code> is the smallest unit the output uses. Set it to <code>day</code> and
        an eight-minute-old timestamp reads as today rather than counting minutes.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography level="body-md">
            second: <RelativeTime date={MINUTES_AGO} precision="second" />
          </Typography>
          <Typography level="body-md">
            hour: <RelativeTime date={MINUTES_AGO} precision="hour" />
          </Typography>
          <Typography level="body-md">
            day: <RelativeTime date={MINUTES_AGO} precision="day" />
          </Typography>
        </div>
      </Demo>

      <h2>Locale and time zone</h2>
      <p>
        Values come from <code>DateTimeProvider</code>. The language falls back one step further,
        to a <a href="/locale-provider">LocaleProvider</a> and then to the runtime default. Props on
        the component override all of them — useful for a single date that must be shown in a fixed
        zone.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography level="body-md">
            Runtime default: <RelativeTime date={DAYS_AGO} />
          </Typography>
          <Typography level="body-md">
            <code>locale=&quot;de-DE&quot;</code>: <RelativeTime date={DAYS_AGO} locale="de-DE" />
          </Typography>
          <Typography level="body-md">
            <code>locale=&quot;fr-FR&quot;</code>: <RelativeTime date={DAYS_AGO} locale="fr-FR" />
          </Typography>
          <DateTimeProvider locale="ja-JP" timeZone="Asia/Tokyo">
            <Typography level="body-md">
              Inside a provider: <RelativeTime date={DAYS_AGO} />
            </Typography>
          </DateTimeProvider>
        </div>
      </Demo>
      <Code>{`<DateTimeProvider locale="de-DE" timeZone="Europe/Berlin">
  <RelativeTime date={order.placedAt} />
</DateTimeProvider>`}</Code>

      <h2>Tense</h2>
      <p>
        By default the tense follows whether the date is in the past or the future. Forcing it is
        useful for countdowns that should keep reading as future even as they cross zero.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography level="body-md">
            auto: <RelativeTime date={SOON} />
          </Typography>
          <Typography level="body-md">
            past: <RelativeTime date={SOON} tense="past" />
          </Typography>
          <Typography level="body-md">
            future: <RelativeTime date={SOON} tense="future" />
          </Typography>
        </div>
      </Demo>

      <h2>The title tooltip</h2>
      <p>
        The rendered <code>&lt;time&gt;</code> carries a native <code>title</code> with the absolute
        timestamp, so hovering reveals the exact moment. <code>noTitle</code> removes it.
      </p>
      <Code>{`<RelativeTime date={date} noTitle />`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'date', type: 'Date | string', description: 'The timestamp. Strings go through new Date(...). Required.' },
          { name: 'format', type: "'auto' | 'relative' | 'datetime' | 'duration' | 'micro'", default: "'auto'", description: 'How the timestamp is phrased.' },
          { name: 'formatStyle', type: "'long' | 'short' | 'narrow'", description: 'Verbosity of the unit names.' },
          { name: 'tense', type: "'auto' | 'past' | 'future'", default: "'auto'", description: 'Forces past or future phrasing.' },
          { name: 'threshold', type: 'string', default: "'P30D'", description: 'ISO-8601 duration after which auto/relative fall back to an absolute date.' },
          { name: 'precision', type: "'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'", default: "'second'", description: 'Smallest unit the output uses.' },
          { name: 'locale', type: 'string', default: 'DateTimeProvider, then the runtime default', description: 'BCP 47 locale tag.' },
          { name: 'timeZone', type: 'string', default: 'DateTimeProvider, then the runtime default', description: 'IANA time zone name.' },
          { name: 'hourCycle', type: "'h11' | 'h12' | 'h23' | 'h24'", default: 'DateTimeProvider, then the runtime default', description: 'Clock convention for absolute output.' },
          { name: 'noTitle', type: 'boolean', default: 'false', description: 'Removes the native title tooltip with the absolute time.' },
        ]}
      />
    </>
  );
}
