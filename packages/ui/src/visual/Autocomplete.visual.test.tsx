import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Autocomplete as JoyAutocomplete } from '@mui/joy';
import { Autocomplete as HintoricAutocomplete } from '../components/Autocomplete';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const OPTIONS = ['Alpha', 'Beta', 'Gamma'];

describe('Autocomplete visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyAutocomplete
              options={OPTIONS}
              variant={variant}
              color={color}
              data-testid={`joy-${variant}-${color}`}
            />
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricAutocomplete
            options={OPTIONS}
            variant={variant}
            color={color}
            data-testid={`hintoric-${variant}-${color}`}
          />,
        );

        // Joy's data-testid lands on its outer root div; ours lands on the
        // <input> since we spread extra props onto Combobox.Input. Both
        // still carry every visual style (background/border/shadow), since
        // our InputGroup wrapper is otherwise transparent — same rationale
        // as Select/Option targeting each library's own real visual root.
        const joyRoot = page.getByTestId(`joy-${variant}-${color}`).element();
        const hintoricInput = page.getByTestId(`hintoric-${variant}-${color}`).element();
        const hintoricRoot = hintoricInput.closest('div') as HTMLElement;

        const joyStyle = getComputedStyle(joyRoot);
        const hintoricStyle = getComputedStyle(hintoricRoot);

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`autocomplete-${variant}-${color}-joy`);
        await expect(hintoricRoot).toMatchScreenshot(`autocomplete-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed min-height`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyAutocomplete options={OPTIONS} size={size} data-testid={`joy-size-${size}`} />
        </JoyCssVarsProvider>,
      );
      render(<HintoricAutocomplete options={OPTIONS} size={size} data-testid={`hintoric-size-${size}`} />);

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricInput = page.getByTestId(`hintoric-size-${size}`).element();
      const hintoricStyle = getComputedStyle(hintoricInput.closest('div') as HTMLElement);

      expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    });
  }

  it('disabled input matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyAutocomplete options={OPTIONS} disabled data-testid="joy-disabled" />
      </JoyCssVarsProvider>,
    );
    render(<HintoricAutocomplete options={OPTIONS} disabled data-testid="hintoric-disabled" />);

    expect((page.getByTestId('hintoric-disabled').element() as HTMLInputElement).disabled).toBe(true);
    expect(page.getByTestId('joy-disabled').element().querySelector('input')).toBeDisabled();
  });
});
