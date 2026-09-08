import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Autocomplete as JoyAutocomplete, CssVarsProvider as JoyCssVarsProvider, FormControl as JoyFormControl } from '@mui/joy';
import { Autocomplete as HintoricAutocomplete } from '../components/Autocomplete';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { describeErrorParity } from './errorParity';
import { FormControl as HintoricFormControl } from '../components/FormControl';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const OPTIONS = ['Alpha', 'Beta', 'Gamma'];

describe('Autocomplete visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
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
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`autocomplete-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricRoot).toMatchScreenshot(`autocomplete-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed min-height in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
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

    it(`disabled input matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyAutocomplete options={OPTIONS} disabled data-testid="joy-disabled" />
        </JoyCssVarsProvider>,
      );
      render(<HintoricAutocomplete options={OPTIONS} disabled data-testid="hintoric-disabled" />);

      expect((page.getByTestId('hintoric-disabled').element() as HTMLInputElement).disabled).toBe(true);
      expect(page.getByTestId('joy-disabled').element().querySelector('input')).toBeDisabled();
    });
  }
});

describeErrorParity({
  slug: 'autocomplete',
  variants: VARIANTS,
  colors: COLORS,
  renderJoy: ({ variant, color }) => (
    <JoyFormControl error>
      <JoyAutocomplete variant={variant} color={color} options={OPTIONS} />
    </JoyFormControl>
  ),
  renderHintoric: ({ variant, color }) => (
    <HintoricFormControl error>
      <HintoricAutocomplete variant={variant} color={color} options={OPTIONS} />
    </HintoricFormControl>
  ),
  // As with Select, Joy's painted element is its root, not the input's
  // immediate parent.
  joyElement: (container) => container.querySelector('.MuiAutocomplete-root') as HTMLElement,
  element: (container) => container.querySelector('input')!.parentElement as HTMLElement,
});
