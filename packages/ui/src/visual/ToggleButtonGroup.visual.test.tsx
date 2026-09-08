import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  ToggleButtonGroup as JoyToggleButtonGroup,
  Button as JoyButton,
} from '@mui/joy';
import { ToggleButtonGroup as HintoricToggleButtonGroup } from '../components/ToggleButtonGroup';
import { Button as HintoricButton } from '../components/Button';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Scope note (see ToggleButtonGroup.tsx): this v1 only implements Joy UI's
// multi-value array mode, so Joy's own multi-select `value` array is used
// here for a fair comparison, rather than its single-value "exclusive" mode.
describe('ToggleButtonGroup visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`layout matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyToggleButtonGroup data-testid="joy" value={['a']}>
            <JoyButton value="a">A</JoyButton>
            <JoyButton value="b">B</JoyButton>
          </JoyToggleButtonGroup>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricToggleButtonGroup data-testid="hintoric" value={['a']}>
          <HintoricButton value="a">A</HintoricButton>
          <HintoricButton value="b">B</HintoricButton>
        </HintoricToggleButtonGroup>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`togglebuttongroup-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`togglebuttongroup-hintoric-${scheme}`);
    });

    it(`selected button gets a persistent background, matching the pressed color in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyToggleButtonGroup value={['a']}>
            <JoyButton data-testid="joy-a" value="a">
              A
            </JoyButton>
          </JoyToggleButtonGroup>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricToggleButtonGroup value={['a']} variant="outlined" color="neutral">
          <HintoricButton data-testid="hintoric-a" value="a" variant="outlined" color="neutral">
            A
          </HintoricButton>
        </HintoricToggleButtonGroup>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-a').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-a').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    });
  }
});
