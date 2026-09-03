import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, FormHelperText as JoyFormHelperText } from '@mui/joy';
import { FormHelperText as HintoricFormHelperText } from '../components/FormHelperText';

describe('FormHelperText visual parity with @mui/joy', () => {
  it("matches Joy UI's computed styles", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyFormHelperText data-testid="joy">Helper text</JoyFormHelperText>
      </JoyCssVarsProvider>,
    );
    render(<HintoricFormHelperText data-testid="hintoric">Helper text</HintoricFormHelperText>);

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    expect(hintoricStyle.color).toBe(joyStyle.color);

    await expect(page.getByTestId('joy')).toMatchScreenshot('formhelpertext-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('formhelpertext-hintoric');
  });
});
