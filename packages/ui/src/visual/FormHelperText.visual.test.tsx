import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  FormControl as JoyFormControl,
  FormHelperText as JoyFormHelperText,
} from '@mui/joy';
import { FormHelperText as HintoricFormHelperText } from '../components/FormHelperText';
import { FormControl as HintoricFormControl } from '../components/FormControl';
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

    // Joy drives the helper colour from its FormControl. `error` turns it
    // danger[500]; `disabled` overrides even that with plainDisabled's colour,
    // because the two rules have equal specificity and disabled is emitted last.
    const STATES = [
      { key: 'error', error: true, disabled: false },
      { key: 'disabled', error: false, disabled: true },
      { key: 'error-and-disabled', error: true, disabled: true },
    ] as const;

    for (const state of STATES) {
      it(`${state.key} matches Joy UI's helper colour in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyFormControl error={state.error} disabled={state.disabled}>
              <JoyFormHelperText data-testid={`joy-${state.key}`}>Helper text</JoyFormHelperText>
            </JoyFormControl>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricFormControl error={state.error} disabled={state.disabled}>
            <HintoricFormHelperText data-testid={`hintoric-${state.key}`}>
              Helper text
            </HintoricFormHelperText>
          </HintoricFormControl>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${state.key}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${state.key}`).element());

        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);

        await expect(page.getByTestId(`joy-${state.key}`)).toMatchScreenshot(`formhelpertext-${state.key}-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-${state.key}`)).toMatchScreenshot(`formhelpertext-${state.key}-hintoric-${scheme}`);
      });
    }
  }
});
