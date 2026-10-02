import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Link, Typography } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { FONT_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

// Not compared: `display` and height (the web Link is inline-flex for its
// decorators, the email one a plain inline link) and the hover underline,
// which has no email equivalent. Width is: same text, same font, same box.
const PROPS = [...FONT_PROPS, 'color', 'textDecorationLine', 'cursor'] as const;

describe('Email.Link parity with Link', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const color of EMAIL_COLORS) {
      for (const underline of ['none', 'always'] as const) {
        it(`${color} / underline ${underline} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          // Inside a paragraph, as a link is used: Link sets no size or
          // line-height of its own and inherits them, so a bare one would
          // compare the two test pages' defaults instead of the components.
          const pair = await renderPair(
            <Typography level="body-sm">
              <Link href="https://example.com" color={color} underline={underline}>
                Aktivitätsprotokoll
              </Link>
            </Typography>,
            <Email.Typography level="body-sm">
              <Email.Link href="https://example.com" color={color} underline={underline}>
                Aktivitätsprotokoll
              </Email.Link>
            </Email.Typography>,
          );
          const web = pair.web.querySelector('a')!;
          const email = pair.email.querySelector('a')!;
          expectSameStyles(web, email, [...PROPS]);
          expectSameBox(web, email, { height: false });
        });
      }
    }

    it(`colours match their baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderPair(
        <div style={{ display: 'grid', gap: 4 }}>
          {EMAIL_COLORS.map((color) => (
            <Link key={color} href="https://example.com" color={color} underline="always">
              {color}
            </Link>
          ))}
        </div>,
        <div style={{ display: 'grid', gap: 4 }}>
          {EMAIL_COLORS.map((color) => (
            <Email.Link key={color} href="https://example.com" color={color}>
              {color}
            </Email.Link>
          ))}
        </div>,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-link-colors-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-link-colors-email-${scheme}`);
    });
  }
});
