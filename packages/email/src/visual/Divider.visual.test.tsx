import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Divider } from '@hintoric/ui';
import * as Email from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { expectSameBox, expectSameStyles, renderPair } from './parity';

// Divider has no variant/colour axis; its look is the divider token, its
// 1px thickness and full width.
const PROPS = ['backgroundColor', 'marginTop', 'marginBottom', 'borderTopWidth'] as const;

describe('Email.Divider parity with Divider', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { web, email } = await renderPair(<Divider />, <Email.Divider />);
      expectSameStyles(web, email, [...PROPS]);
      expectSameBox(web, email);
    });

    it(`matches its baseline in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderPair(
        <div style={{ padding: 12 }}>
          <Divider />
        </div>,
        <div style={{ padding: 12 }}>
          <Email.Divider />
        </div>,
      );
      await expect(page.getByTestId('web')).toMatchScreenshot(`email-divider-web-${scheme}`);
      await expect(page.getByTestId('email')).toMatchScreenshot(`email-divider-email-${scheme}`);
    });
  }
});
