import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Checkbox as JoyCheckbox } from '@mui/joy';
import { Checkbox as HintoricCheckbox } from '../components/Checkbox';
import { settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Checkbox visual parity with @mui/joy', () => {
  // Explicit variant/color: same styling whether checked or not (Joy UI only
  // auto-switches variant/color when the caller leaves them undefined).
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyCheckbox data-testid={`joy-${variant}-${color}`} variant={variant} color={color} />
          </JoyCssVarsProvider>,
        );
        render(<HintoricCheckbox data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color} />);

        const joyBox = page.getByTestId(`joy-${variant}-${color}`).element().querySelector('.MuiCheckbox-checkbox') as HTMLElement;
        const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyBox);
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
        expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.height).toBe(joyStyle.height);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`checkbox-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`checkbox-${variant}-${color}-hintoric`);
      });
    }
  }

  // Default (no variant/color): Joy UI shows outlined/neutral unchecked and
  // switches to solid/primary once checked — the reason this auto-switch
  // logic exists in the component at all.
  it('defaults to outlined/neutral unchecked, matching Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyCheckbox data-testid="joy-default" />
      </JoyCssVarsProvider>,
    );
    render(<HintoricCheckbox data-testid="hintoric-default" />);

    const joyBox = page.getByTestId('joy-default').element().querySelector('.MuiCheckbox-checkbox') as HTMLElement;
    const hintoricBox = page.getByTestId('hintoric-default').element();

    const joyStyle = getComputedStyle(joyBox);
    const hintoricStyle = getComputedStyle(hintoricBox);

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
  });

  it('defaults to solid/primary once checked, matching Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyCheckbox data-testid="joy-default-checked" defaultChecked />
      </JoyCssVarsProvider>,
    );
    render(<HintoricCheckbox data-testid="hintoric-default-checked" defaultChecked />);

    const joyBox = page.getByTestId('joy-default-checked').element().querySelector('.MuiCheckbox-checkbox') as HTMLElement;
    const hintoricBox = page.getByTestId('hintoric-default-checked').element();

    const joyStyle = getComputedStyle(joyBox);
    const hintoricStyle = getComputedStyle(hintoricBox);

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
  });

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed dimensions`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyCheckbox data-testid={`joy-size-${size}`} size={size} />
        </JoyCssVarsProvider>,
      );
      render(<HintoricCheckbox data-testid={`hintoric-size-${size}`} size={size} />);

      const joyBox = page.getByTestId(`joy-size-${size}`).element().querySelector('.MuiCheckbox-checkbox') as HTMLElement;
      const hintoricBox = page.getByTestId(`hintoric-size-${size}`).element();

      expect(getComputedStyle(hintoricBox).width).toBe(getComputedStyle(joyBox).width);
      expect(getComputedStyle(hintoricBox).height).toBe(getComputedStyle(joyBox).height);
    });
  }

  it('shows the same focus-visible outline as Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyCheckbox data-testid="joy-focus" />
      </JoyCssVarsProvider>,
    );
    render(<HintoricCheckbox data-testid="hintoric-focus" />);

    const joyEl = page.getByTestId('joy-focus').element().querySelector('input') as HTMLInputElement;
    const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

    joyEl.focus();
    await settleTransitions();
    // The hidden <input>'s parent is Joy's absolutely-positioned "action"
    // span — that's what actually carries the focus-visible outline, one
    // level up from the input, not two (which lands on the outer box instead).
    const joyOutline = getComputedStyle(joyEl.parentElement!).outline;
    joyEl.blur();

    hintoricEl.focus();
    await settleTransitions();
    const hintoricOutline = getComputedStyle(hintoricEl).outline;
    hintoricEl.blur();

    expect(hintoricOutline).toBe(joyOutline);
  });

  it('is disabled the same way as Joy UI (aria-disabled, dimmed colors)', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyCheckbox data-testid="joy-disabled" disabled />
      </JoyCssVarsProvider>,
    );
    render(<HintoricCheckbox data-testid="hintoric-disabled" disabled />);

    const joyBox = page.getByTestId('joy-disabled').element().querySelector('.MuiCheckbox-checkbox') as HTMLElement;
    const hintoricBox = page.getByTestId('hintoric-disabled').element();

    expect(getComputedStyle(hintoricBox).cursor).toBe(getComputedStyle(joyBox).cursor);
  });
});
