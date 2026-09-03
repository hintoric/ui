import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, RadioGroup as JoyRadioGroup, Radio as JoyRadio } from '@mui/joy';
import { RadioGroup as HintoricRadioGroup } from '../components/RadioGroup';
import { Radio as HintoricRadio } from '../components/Radio';

// No color/variant axis of its own — tests its actual supported states
// (orientation), per CLAUDE.md's allowance for components without that axis.
describe('RadioGroup visual parity with @mui/joy', () => {
  it("matches Joy UI's vertical flex layout", async () => {
    render(
      <JoyCssVarsProvider>
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

    await expect(page.getByTestId('joy')).toMatchScreenshot('radiogroup-vertical-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('radiogroup-vertical-hintoric');
  });

  it("matches Joy UI's horizontal flex layout", async () => {
    render(
      <JoyCssVarsProvider>
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
});
