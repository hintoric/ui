import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, FormControl as JoyFormControl, FormLabel as JoyFormLabel, Input as JoyInput } from '@mui/joy';
import { FormControl as HintoricFormControl } from '../components/FormControl';
import { FormLabel as HintoricFormLabel } from '../components/FormLabel';
import { Input as HintoricInput } from '../components/Input';

describe('FormControl visual parity with @mui/joy', () => {
  it("matches Joy UI's flex layout", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyFormControl data-testid="joy">
          <JoyFormLabel>Email</JoyFormLabel>
          <JoyInput placeholder="you@example.com" />
        </JoyFormControl>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricFormControl data-testid="hintoric">
        <HintoricFormLabel>Email</HintoricFormLabel>
        <HintoricInput placeholder="you@example.com" />
      </HintoricFormControl>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.display).toBe(joyStyle.display);
    expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);

    await expect(page.getByTestId('joy')).toMatchScreenshot('formcontrol-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('formcontrol-hintoric');
  });
});
