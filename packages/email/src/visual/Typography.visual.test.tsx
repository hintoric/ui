import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Typography } from '@hintoric/ui';
import type { TypographyLevel } from '@hintoric/ui';
import * as Email from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { FONT_PROPS, expectSameBox, expectSameStyles, renderPair } from './parity';

const LEVELS: TypographyLevel[] = ['h1', 'h2', 'h3', 'h4', 'title-lg', 'title-md', 'title-sm', 'body-lg', 'body-md', 'body-sm', 'body-xs'];
const PROPS = [...FONT_PROPS, 'color', 'display', 'marginTop', 'marginBottom'] as const;

describe('Email.Typography parity with Typography', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const level of LEVELS) {
      it(`${level} matches in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = renderPair(
          <Typography level={level}>Bankverbindung geändert</Typography>,
          <Email.Typography level={level}>Bankverbindung geändert</Email.Typography>,
        );
        expect(email.tagName).toBe(web.tagName);
        expectSameStyles(web, email, [...PROPS]);
        expectSameBox(web, email);
      });
    }

    // The web Typography has no textColor prop; its ink tokens are what the
    // email one has to land on, so the oracle is the token itself.
    for (const textColor of ['primary', 'secondary', 'tertiary', 'icon'] as const) {
      it(`textColor ${textColor} is --color-ink-${textColor} in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { web, email } = renderPair(
          <Typography level="body-xs" style={{ color: `var(--color-ink-${textColor})` }}>
            Fine print
          </Typography>,
          <Email.Typography level="body-xs" textColor={textColor}>
            Fine print
          </Email.Typography>,
        );
        expectSameStyles(web, email, ['color']);
      });
    }

    it(`levels match their baselines in ${scheme}`, async () => {
      await setColorScheme(scheme);
      renderPair(
        <div>
          {LEVELS.map((level) => (
            <Typography key={level} level={level} component="div">
              {level}
            </Typography>
          ))}
        </div>,
        <div>
          {LEVELS.map((level) => (
            <Email.Typography key={level} level={level} component="div">
              {level}
            </Email.Typography>
          ))}
        </div>,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-typography-levels-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-typography-levels-email-${scheme}`);
    });
  }
});
