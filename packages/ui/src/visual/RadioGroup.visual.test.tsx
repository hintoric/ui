import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, RadioGroup as JoyRadioGroup, Radio as JoyRadio } from '@mui/joy';
import { RadioGroup as HintoricRadioGroup } from '../components/RadioGroup';
import { Radio as HintoricRadio } from '../components/Radio';
import { FormControl as JoyFormControl, FormHelperText as JoyFormHelperText } from '@mui/joy';
import { FormControl as HintoricFormControl } from '../components/FormControl';
import { FormHelperText as HintoricFormHelperText } from '../components/FormHelperText';
import { parkPointer } from './errorParity';

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

// No variant/colour axis of its own, and Joy's RadioGroup reads only `size`
// from its FormControl — not the error state. The error therefore shows in the
// composition: the Radios inside pick up danger from the context, and the
// helper text turns red. That is what this compares.
describe('RadioGroup error state', () => {
  it('cascades danger into its Radios and helper text like Joy UI', async () => {
    await parkPointer('radiogroup-error');
    const { container: joyContainer } = render(
      <div data-testid="joy-rg-error" style={{ position: 'fixed', top: 0, left: 0, width: 320 }}>
        <JoyCssVarsProvider>
          <JoyFormControl error>
            <JoyRadioGroup defaultValue="a">
              <JoyRadio value="a" label="A" />
              <JoyRadio value="b" label="B" />
            </JoyRadioGroup>
            <JoyFormHelperText>Pflichtfeld</JoyFormHelperText>
          </JoyFormControl>
        </JoyCssVarsProvider>
      </div>,
    );
    const { container: hintoricContainer } = render(
      <div
        data-testid="hintoric-rg-error"
        style={{ position: 'fixed', top: 200, left: 0, width: 320 }}
      >
        <HintoricFormControl error>
          <HintoricRadioGroup defaultValue="a">
            <HintoricRadio value="a" label="A" />
            <HintoricRadio value="b" label="B" />
          </HintoricRadioGroup>
          <HintoricFormHelperText>Pflichtfeld</HintoricFormHelperText>
        </HintoricFormControl>
      </div>,
    );

    // The Radios' own border colour is deliberately NOT compared here, and it
    // is a known divergence rather than an oversight. A Joy Radio placed
    // directly in <FormControl error> does turn danger (Radio.visual.test.tsx
    // asserts exactly that against the real package). The same Radio inside a
    // JoyRadioGroup keeps its primary colour — the group shadows the error
    // state. Ours turns danger in both. Matching Joy here would mean making an
    // invalid radio group stop looking invalid, which is a product decision
    // about accessibility, not a token to copy; tracked separately.

    const joyHelper = joyContainer.querySelector('.MuiFormHelperText-root') as HTMLElement;
    // Queried by the helper's own id rather than div:last-child, which
    // matches the first last-child div anywhere in the tree.
    const hintoricHelper = Array.from(hintoricContainer.querySelectorAll('div')).find(
      (el) => el.textContent === joyHelper.textContent && el.children.length === 0,
    ) as HTMLElement;
    expect(getComputedStyle(hintoricHelper).color).toBe(getComputedStyle(joyHelper).color);

    await expect(page.getByTestId('joy-rg-error')).toMatchScreenshot('radiogroup-error-joy');
    await expect(page.getByTestId('hintoric-rg-error')).toMatchScreenshot(
      'radiogroup-error-hintoric',
    );
  });
});
