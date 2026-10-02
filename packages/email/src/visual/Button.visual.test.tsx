import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Button } from '@hintoric/ui';
import * as Email from '../index';
import { EMAIL_COLORS, EMAIL_VARIANTS } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { COLOR_PROPS, FONT_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

// Not compared: `display` (inline-flex vs. inline-block — email has no
// flexbox) and the :hover / :active / :focus-visible states, which mail
// clients don't apply to links reliably, so the email Button has none.
const PROPS = [...COLOR_PROPS, ...FONT_PROPS, 'borderTopLeftRadius', 'paddingLeft', 'paddingRight', 'cursor'] as const;

describe('Email.Button parity with Button', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        it(`${variant} / ${color} matches in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { web, email } = renderPair(
            <Button variant={variant} color={color}>
              Aktivität prüfen
            </Button>,
            <Email.Button href="https://example.com" variant={variant} color={color}>
              Aktivität prüfen
            </Email.Button>,
          );
          expectSameStyles(web, email, [...PROPS]);
          expectSameBox(web, email);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size ${size} matches in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = renderPair(<Button size={size}>Label</Button>, <Email.Button href="https://example.com" size={size}>Label</Email.Button>);
        expectSameStyles(web, email, [...PROPS]);
        expectSameBox(web, email);
      });

      it(`outlined size ${size} matches in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = renderPair(
          <Button size={size} variant="outlined">
            Label
          </Button>,
          <Email.Button href="https://example.com" size={size} variant="outlined">
            Label
          </Email.Button>,
        );
        expectSameBox(web, email);
      });
    }

    it(`fullWidth matches a full-width Button in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { web, email } = renderPair(
        <Button style={{ width: '100%' }}>Label</Button>,
        <Email.Button href="https://example.com" fullWidth>
          Label
        </Email.Button>,
      );
      expectSameBox(web, email);
    });

    it(`grid matches its baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      renderPair(
        <div style={{ display: 'grid', gap: 8 }}>
          {EMAIL_VARIANTS.map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: 8 }}>
              {EMAIL_COLORS.map((color) => (
                <Button key={color} variant={variant} color={color} size="sm">
                  {color}
                </Button>
              ))}
            </div>
          ))}
        </div>,
        <div style={{ display: 'grid', gap: 8 }}>
          {EMAIL_VARIANTS.map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: 8 }}>
              {EMAIL_COLORS.map((color) => (
                <Email.Button key={color} href="https://example.com" variant={variant} color={color} size="sm">
                  {color}
                </Email.Button>
              ))}
            </div>
          ))}
        </div>,
        420,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-button-grid-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-button-grid-email-${scheme}`);
    });
  }
});
