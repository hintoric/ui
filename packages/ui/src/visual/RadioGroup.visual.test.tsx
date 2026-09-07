import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, RadioGroup as JoyRadioGroup, Radio as JoyRadio } from '@mui/joy';
import { RadioGroup as HintoricRadioGroup } from '../components/RadioGroup';
import { Radio as HintoricRadio } from '../components/Radio';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// No color/variant axis of its own — tests its actual supported states
// (orientation), per CLAUDE.md's allowance for components without that axis.
describe('RadioGroup visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's vertical flex layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyRadioGroup data-testid="joy" defaultValue="a">
            <JoyRadio value="a" label="A" />
            <JoyRadio value="b" label="B" />
          </JoyRadioGroup>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricRadioGroup data-testid="hintoric" defaultValue="a">
          <HintoricRadio value="a" label="A" />
          <HintoricRadio value="b" label="B" />
        </HintoricRadioGroup>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`radiogroup-vertical-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`radiogroup-vertical-hintoric-${scheme}`);
    });

    it(`matches Joy UI's horizontal flex layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyRadioGroup data-testid="joy-h" orientation="horizontal" defaultValue="a">
            <JoyRadio value="a" label="A" />
          </JoyRadioGroup>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricRadioGroup data-testid="hintoric-h" orientation="horizontal" defaultValue="a">
          <HintoricRadio value="a" label="A" />
        </HintoricRadioGroup>,
      );

      expect(getComputedStyle(page.getByTestId('hintoric-h').element()).flexDirection).toBe(
        getComputedStyle(page.getByTestId('joy-h').element()).flexDirection,
      );
    });
  }
});
