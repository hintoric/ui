import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListDivider as JoyListDivider } from '@mui/joy';
import { ListDivider as HintoricListDivider } from '../components/ListDivider';

describe('ListDivider visual parity with @mui/joy', () => {
  it("matches Joy UI's divider line", async () => {
    render(
      <JoyCssVarsProvider>
        <div style={{ width: 200 }}>
          <JoyListDivider data-testid="joy" />
        </div>
      </JoyCssVarsProvider>,
    );
    render(
      <div style={{ width: 200 }}>
        <HintoricListDivider data-testid="hintoric" />
      </div>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.height).toBe(joyStyle.height);

    await expect(page.getByTestId('joy')).toMatchScreenshot('listdivider-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('listdivider-hintoric');
  });
});
