import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Chip } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS, EMAIL_VARIANTS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { COLOR_PROPS, FONT_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

// Not compared: `display` (inline-flex vs. inline-block).
const PROPS = [...COLOR_PROPS, ...FONT_PROPS, 'borderTopLeftRadius', 'paddingLeft', 'paddingRight'] as const;

describe('Email.Chip parity with Chip', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        it(`${variant} / ${color} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = await renderPair(
            <Chip variant={variant} color={color}>
              Sicherheitswarnung
            </Chip>,
            <Email.Chip variant={variant} color={color}>
              Sicherheitswarnung
            </Email.Chip>,
          );
          expectSameStyles(web, email, [...PROPS]);
          expectSameBox(web, email);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      for (const variant of ['soft', 'outlined'] as const) {
        it(`${variant} size ${size} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = await renderPair(
            <Chip size={size} variant={variant}>
              Label
            </Chip>,
            <Email.Chip size={size} variant={variant}>
              Label
            </Email.Chip>,
          );
          expectSameStyles(web, email, [...PROPS]);
          expectSameBox(web, email);
        });

        it(`${variant} size ${size} keeps its box without a doctype (quirks) in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email, emailDocument } = await renderPair(
            <Chip size={size} variant={variant}>
              Label
            </Chip>,
            <Email.Chip size={size} variant={variant}>
              Label
            </Email.Chip>,
            320,
            { quirks: true },
          );
          expect(emailDocument.compatMode).toBe('BackCompat');
          expectSameBox(web, email);
        });
      }
    }

    it(`grid matches its baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderPair(
        <div style={{ display: 'grid', gap: 8 }}>
          {EMAIL_VARIANTS.map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: 6 }}>
              {EMAIL_COLORS.map((color) => (
                <Chip key={color} variant={variant} color={color} size="sm">
                  {color}
                </Chip>
              ))}
            </div>
          ))}
        </div>,
        <div style={{ display: 'grid', gap: 8 }}>
          {EMAIL_VARIANTS.map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: 6 }}>
              {EMAIL_COLORS.map((color) => (
                <Email.Chip key={color} variant={variant} color={color} size="sm">
                  {color}
                </Email.Chip>
              ))}
            </div>
          ))}
        </div>,
        360,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-chip-grid-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-chip-grid-email-${scheme}`);
    });
  }
});
