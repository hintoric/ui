import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, FormHelperText as JoyFormHelperText } from '@mui/joy';
import { FormHelperText as HintoricFormHelperText } from '../components/FormHelperText';
import { COLOR_SCHEMES, expectSameLineHeight, setColorScheme } from './helpers';

describe('FormHelperText visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyFormHelperText data-testid="joy">Helper text</JoyFormHelperText>
        </JoyCssVarsProvider>,
      );
      render(<HintoricFormHelperText data-testid="hintoric">Helper text</HintoricFormHelperText>);

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expectSameLineHeight(hintoricStyle.lineHeight, joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`formhelpertext-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`formhelpertext-hintoric-${scheme}`);
    });
  }
});
