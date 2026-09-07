import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, FormLabel as JoyFormLabel } from '@mui/joy';
import { FormLabel as HintoricFormLabel } from '../components/FormLabel';
import { COLOR_SCHEMES, expectSameLineHeight, setColorScheme } from './helpers';

// No color/variant axis — tests its actual supported state (required
// asterisk), per CLAUDE.md's allowance for components without that axis.
describe('FormLabel visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyFormLabel data-testid="joy">Email</JoyFormLabel>
        </JoyCssVarsProvider>,
      );
      render(<HintoricFormLabel data-testid="hintoric">Email</HintoricFormLabel>);

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expectSameLineHeight(hintoricStyle.lineHeight, joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`formlabel-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`formlabel-hintoric-${scheme}`);
    });
  }
});
