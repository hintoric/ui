import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Card } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS, EMAIL_VARIANTS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { COLOR_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

// The email Card is a one-cell table, so its padding sits on the cell rather
// than on the root; that cell is compared against the web Card's root.
// Not compared: `display` (flex column vs. table) and `gap`, which email lacks;
// and `fontFamily` — the web Card sets none and inherits the page's, while the
// email Card has to set one or mail clients fall back to Times. The text
// components inside carry the font comparison.
const ROOT_PROPS = [...COLOR_PROPS, 'borderTopLeftRadius'] as const;
const PADDING = ['paddingTop', 'paddingLeft', 'paddingBottom', 'paddingRight'] as const;

const content = <div style={{ height: 40 }}>Inhalt</div>;

describe('Email.Card parity with Card', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        it(`${variant} / ${color} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = await renderPair(
            <Card variant={variant} color={color}>
              {content}
            </Card>,
            <Email.Card variant={variant} color={color}>
              {content}
            </Email.Card>,
          );
          expectSameStyles(web, email, [...ROOT_PROPS]);
          expectSameStyles(web, email.querySelector('td')!, [...PADDING]);
          expectSameBox(web, email);
        });
      }
    }

    // Every variant × colour, one row per variant — the baseline a human
    // reviews, next to the computed-style assertions above.
    it(`grid matches its baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const grid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 } as const;
      await renderPair(
        <div style={grid}>
          {EMAIL_VARIANTS.flatMap((variant) =>
            EMAIL_COLORS.map((color) => (
              <Card key={`${variant}-${color}`} variant={variant} color={color}>
                {color[0]!.toUpperCase()}
              </Card>
            )),
          )}
        </div>,
        <div style={grid}>
          {EMAIL_VARIANTS.flatMap((variant) =>
            EMAIL_COLORS.map((color) => (
              <Email.Card key={`${variant}-${color}`} variant={variant} color={color}>
                {color[0]!.toUpperCase()}
              </Email.Card>
            )),
          )}
        </div>,
        340,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-card-grid-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-card-grid-email-${scheme}`);
    });
  }
});
