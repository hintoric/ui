import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Link } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { expectSameStyles, renderPair } from './parity';

// Not compared: `display` (the web Link is inline-flex for its decorators) and
// the hover underline, which has no email equivalent.
const PROPS = ['color', 'fontFamily', 'textDecorationLine', 'cursor'] as const;

describe('Email.Link parity with Link', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const color of EMAIL_COLORS) {
      for (const underline of ['none', 'always'] as const) {
        it(`${color} / underline ${underline} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = renderPair(
            <Link href="https://example.com" color={color} underline={underline}>
              Aktivitätsprotokoll
            </Link>,
            <Email.Link href="https://example.com" color={color} underline={underline}>
              Aktivitätsprotokoll
            </Email.Link>,
          );
          expectSameStyles(web, email, [...PROPS]);
        });
      }
    }

    it(`colours match their baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      renderPair(
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
