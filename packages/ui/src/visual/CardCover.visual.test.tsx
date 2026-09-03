import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, CardCover as JoyCardCover } from '@mui/joy';
import { CardCover as HintoricCardCover } from '../components/CardCover';

describe('CardCover visual parity with @mui/joy', () => {
  it("matches Joy UI's absolute-fill positioning", async () => {
    render(
      <JoyCssVarsProvider>
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <JoyCardCover data-testid="joy">
            <img src="/a.jpg" alt="a" />
          </JoyCardCover>
        </div>
      </JoyCssVarsProvider>,
    );
    render(
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <HintoricCardCover data-testid="hintoric">
          <img src="/a.jpg" alt="a" />
        </HintoricCardCover>
      </div>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.position).toBe(joyStyle.position);
    expect(hintoricStyle.top).toBe(joyStyle.top);
    expect(hintoricStyle.left).toBe(joyStyle.left);

    await expect(page.getByTestId('joy')).toMatchScreenshot('cardcover-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('cardcover-hintoric');
  });
});
