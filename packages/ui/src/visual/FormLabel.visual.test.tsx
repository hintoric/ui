import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, FormLabel as JoyFormLabel } from '@mui/joy';
import { FormLabel as HintoricFormLabel } from '../components/FormLabel';

// No color/variant axis — tests its actual supported state (required
// asterisk), per CLAUDE.md's allowance for components without that axis.
describe('FormLabel visual parity with @mui/joy', () => {
  it('matches Joy UI\'s computed styles', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyFormLabel data-testid="joy">Email</JoyFormLabel>
      </JoyCssVarsProvider>,
    );
    render(<HintoricFormLabel data-testid="hintoric">Email</HintoricFormLabel>);

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
    expect(hintoricStyle.color).toBe(joyStyle.color);

    await expect(page.getByTestId('joy')).toMatchScreenshot('formlabel-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('formlabel-hintoric');
  });
});
