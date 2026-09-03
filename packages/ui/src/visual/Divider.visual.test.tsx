import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Divider as JoyDivider } from '@mui/joy';
import { Divider as HintoricDivider } from '../components/Divider';

describe('Divider visual parity with @mui/joy', () => {
  it('bare horizontal divider matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <div style={{ width: 200 }}>
          <JoyDivider data-testid="joy-h" />
        </div>
      </JoyCssVarsProvider>,
    );
    render(
      <div style={{ width: 200 }}>
        <HintoricDivider data-testid="hintoric-h" />
      </div>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-h').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-h').element());

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.height).toBe(joyStyle.height);
    expect(hintoricStyle.border).toBe(joyStyle.border);

    await expect(page.getByTestId('joy-h')).toMatchScreenshot('divider-horizontal-joy');
    await expect(page.getByTestId('hintoric-h')).toMatchScreenshot('divider-horizontal-hintoric');
  });

  it('bare vertical divider matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <div style={{ height: 100, display: 'flex' }}>
          <JoyDivider data-testid="joy-v" orientation="vertical" />
        </div>
      </JoyCssVarsProvider>,
    );
    render(
      <div style={{ height: 100, display: 'flex' }}>
        <HintoricDivider data-testid="hintoric-v" orientation="vertical" />
      </div>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-v').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-v').element());

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.width).toBe(joyStyle.width);

    await expect(page.getByTestId('joy-v')).toMatchScreenshot('divider-vertical-joy');
    await expect(page.getByTestId('hintoric-v')).toMatchScreenshot('divider-vertical-hintoric');
  });

  it('divider with children matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <div style={{ width: 200 }}>
          <JoyDivider data-testid="joy-c">OR</JoyDivider>
        </div>
      </JoyCssVarsProvider>,
    );
    render(
      <div style={{ width: 200 }}>
        <HintoricDivider data-testid="hintoric-c">OR</HintoricDivider>
      </div>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-c').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-c').element());

    expect(hintoricStyle.display).toBe(joyStyle.display);
    expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);

    await expect(page.getByTestId('joy-c')).toMatchScreenshot('divider-children-joy');
    await expect(page.getByTestId('hintoric-c')).toMatchScreenshot('divider-children-hintoric');
  });
});
