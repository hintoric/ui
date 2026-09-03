import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, CardContent as JoyCardContent } from '@mui/joy';
import { CardContent as HintoricCardContent } from '../components/CardContent';

describe('CardContent visual parity with @mui/joy', () => {
  it("matches Joy UI's flex column layout", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyCardContent data-testid="joy">
          <p>Body</p>
        </JoyCardContent>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricCardContent data-testid="hintoric">
        <p>Body</p>
      </HintoricCardContent>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.display).toBe(joyStyle.display);
    expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);

    await expect(page.getByTestId('joy')).toMatchScreenshot('cardcontent-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('cardcontent-hintoric');
  });
});
