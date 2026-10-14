import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Alert, AlertTitle } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS, EMAIL_VARIANTS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { COLOR_PROPS, FONT_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

// The email Alert is a table like Card: colours, border and radius on the
// root, the padding on its one cell. Not compared: `display` (flex row vs.
// table) and `gap`, which email lacks — the decorator test below measures
// where the content actually lands instead.
const ROOT_PROPS = [...COLOR_PROPS, ...FONT_PROPS, 'borderTopLeftRadius'] as const;
const PADDING = ['paddingTop', 'paddingLeft', 'paddingBottom', 'paddingRight'] as const;

const TEXT = 'Für diese Adresse gibt es kein Konto.';

describe('Email.Alert parity with Alert', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        it(`${variant} / ${color} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = await renderPair(
            <Alert variant={variant} color={color}>
              {TEXT}
            </Alert>,
            <Email.Alert variant={variant} color={color}>
              {TEXT}
            </Email.Alert>,
          );
          expectSameStyles(web, email, [...ROOT_PROPS]);
          expectSameStyles(web, email.querySelector('td')!, [...PADDING]);
          expectSameBox(web, email);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      for (const variant of ['soft', 'outlined'] as const) {
        it(`${variant} size ${size} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = await renderPair(
            <Alert size={size} variant={variant}>
              {TEXT}
            </Alert>,
            <Email.Alert size={size} variant={variant}>
              {TEXT}
            </Email.Alert>,
          );
          expectSameStyles(web, email, [...ROOT_PROPS]);
          expectSameStyles(web, email.querySelector('td')!, [...PADDING, ...FONT_PROPS]);
          expectSameBox(web, email);
        });

        it(`${variant} size ${size} keeps its box and type without a doctype (quirks) in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email, emailDocument } = await renderPair(
            <Alert size={size} variant={variant}>
              {TEXT}
            </Alert>,
            <Email.Alert size={size} variant={variant}>
              {TEXT}
            </Email.Alert>,
            320,
            { quirks: true },
          );
          expect(emailDocument.compatMode).toBe('BackCompat');
          // Quirks-mode tables don't inherit font-size: the cell must carry its own.
          expectSameStyles(web, email.querySelector('td')!, [...FONT_PROPS]);
          expectSameBox(web, email);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size ${size} puts the content where the web Alert does, past a start and before an end decorator, in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const icon = <span style={{ display: 'inline-block', width: 16, height: 16, background: 'currentColor' }} />;
        const { web, email } = await renderPair(
          <Alert size={size} startDecorator={icon} endDecorator={icon}>
            Zwei Zeilen Text, damit der Inhalt umbricht und die Decorators oben bleiben.
          </Alert>,
          <Email.Alert size={size} startDecorator={icon} endDecorator={icon}>
            Zwei Zeilen Text, damit der Inhalt umbricht und die Decorators oben bleiben.
          </Email.Alert>,
        );
        const offset = (root: Element, el: Element) => {
          const r = root.getBoundingClientRect();
          const b = el.getBoundingClientRect();
          return { left: b.left - r.left, right: r.right - b.right, top: b.top - r.top };
        };
        // The web Alert's three children: decorator, content, decorator.
        const [webStart, webContent, webEnd] = [...web.children];
        const emailContent = email.querySelector('[data-alert-content]')!;
        const [emailStart, emailEnd] = [...email.querySelectorAll('[data-alert-decorator]')].map((d) => d.firstElementChild!);
        const near = (a: number, b: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(0.5);
        near(offset(email, emailContent).left, offset(web, webContent!).left);
        near(offset(email, emailContent).right, offset(web, webContent!).right);
        // Decorators sit on the first line, not in the middle of the block.
        near(offset(email, emailStart!).top, offset(web, webStart!.firstElementChild!).top);
        near(offset(email, emailEnd!).top, offset(web, webEnd!.firstElementChild!).top);
        expectSameBox(web, email);
      });
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size ${size} puts the default icon where the web Alert's is, at its size, in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = await renderPair(
          <Alert size={size} color="warning">
            {TEXT}
          </Alert>,
          <Email.Alert size={size} color="warning">
            {TEXT}
          </Email.Alert>,
        );
        const box = (root: Element, el: Element) => {
          const r = root.getBoundingClientRect();
          const b = el.getBoundingClientRect();
          return { width: b.width, height: b.height, left: b.left - r.left, top: b.top - r.top };
        };
        // The light image is the visible one until the dark rules apply.
        const visible = [...email.querySelectorAll('img')].find((img) => img.ownerDocument.defaultView!.getComputedStyle(img).display !== 'none')!;
        expect(box(email, visible)).toEqual(box(web, web.querySelector('svg[data-alert-icon]')!));
        expectSameBox(web, email);
      });
    }

    for (const variant of EMAIL_VARIANTS) {
      it(`${variant} with a title over regular body text matches in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = await renderPair(
          <Alert variant={variant} color="warning">
            <AlertTitle>Kein Konto gefunden</AlertTitle>
            <span style={{ fontWeight: 400 }}>{TEXT}</span>
          </Alert>,
          <Email.Alert variant={variant} color="warning">
            <Email.AlertTitle>Kein Konto gefunden</Email.AlertTitle>
            <span style={{ fontWeight: 400 }}>{TEXT}</span>
          </Email.Alert>,
        );
        const webTitle = web.querySelector('.min-w-0 > div')!;
        const emailTitle = email.querySelector('td > div')!;
        expectSameStyles(webTitle, emailTitle, ['color', ...FONT_PROPS]);
        expectSameBox(webTitle, emailTitle);
        expectSameBox(web, email);
      });
    }

    // Every variant × colour, one row per variant — the baseline a human
    // reviews, next to the computed-style assertions above.
    it(`grid matches its baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const grid = { display: 'grid', gap: 6 } as const;
      await renderPair(
        <div style={grid}>
          {EMAIL_VARIANTS.flatMap((variant) =>
            EMAIL_COLORS.map((color) => (
              <Alert key={`${variant}-${color}`} variant={variant} color={color} size="sm">
                {variant} / {color}
              </Alert>
            )),
          )}
        </div>,
        <div style={grid}>
          {EMAIL_VARIANTS.flatMap((variant) =>
            EMAIL_COLORS.map((color) => (
              <Email.Alert key={`${variant}-${color}`} variant={variant} color={color} size="sm">
                {variant} / {color}
              </Email.Alert>
            )),
          )}
        </div>,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-alert-grid-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-alert-grid-email-${scheme}`);
    });
  }
});
