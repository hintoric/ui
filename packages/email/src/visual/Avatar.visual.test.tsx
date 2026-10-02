import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Avatar } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS, EMAIL_VARIANTS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { COLOR_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

// Not compared: `display` (inline-flex vs. inline-table — a table cell is
// what centres the initials in email).
const PROPS = [...COLOR_PROPS, 'borderTopLeftRadius', 'fontFamily', 'fontSize', 'fontWeight'] as const;

describe('Email.Avatar parity with Avatar', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        it(`${variant} / ${color} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = await renderPair(
            <Avatar variant={variant} color={color}>
              MG
            </Avatar>,
            <Email.Avatar variant={variant} color={color}>
              MG
            </Email.Avatar>,
          );
          expectSameStyles(web, email, [...PROPS]);
          expectSameBox(web, email);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size ${size} matches in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = await renderPair(<Avatar size={size}>MG</Avatar>, <Email.Avatar size={size}>MG</Email.Avatar>);
        expectSameStyles(web, email, [...PROPS]);
        expectSameBox(web, email);
      });
    }

    // Every variant × colour, one row per variant.
    it(`grid matches its baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const row = { display: 'flex', gap: 8, marginBottom: 8 } as const;
      await renderPair(
        <div>
          {EMAIL_VARIANTS.map((variant) => (
            <div key={variant} style={row}>
              {EMAIL_COLORS.map((color) => (
                <Avatar key={color} variant={variant} color={color} size="sm">
                  MG
                </Avatar>
              ))}
            </div>
          ))}
        </div>,
        <div>
          {EMAIL_VARIANTS.map((variant) => (
            <div key={variant} style={row}>
              {EMAIL_COLORS.map((color) => (
                <Email.Avatar key={color} variant={variant} color={color} size="sm">
                  MG
                </Email.Avatar>
              ))}
            </div>
          ))}
        </div>,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-avatar-grid-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-avatar-grid-email-${scheme}`);
    });
  }
});
