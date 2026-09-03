import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListSubheader as JoyListSubheader } from '@mui/joy';
import { ListSubheader as HintoricListSubheader } from '../components/ListSubheader';

describe('ListSubheader visual parity with @mui/joy', () => {
  it("matches Joy UI's computed styles", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyListSubheader data-testid="joy">Recent</JoyListSubheader>
      </JoyCssVarsProvider>,
    );
    render(<HintoricListSubheader data-testid="hintoric">Recent</HintoricListSubheader>);

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    expect(hintoricStyle.color).toBe(joyStyle.color);

    await expect(page.getByTestId('joy')).toMatchScreenshot('listsubheader-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('listsubheader-hintoric');
  });
});
