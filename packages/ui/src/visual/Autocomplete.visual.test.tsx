import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Autocomplete as JoyAutocomplete,
  CssVarsProvider as JoyCssVarsProvider,
  FormControl as JoyFormControl,
  ListItem as JoyListItem,
} from '@mui/joy';
import { Autocomplete as HintoricAutocomplete } from '../components/Autocomplete';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
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
            <div style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyAutocomplete
                  options={OPTIONS}
                  variant={variant}
                  color={color}
                  data-testid={`joy-${variant}-${color}`}
                />
              </JoyCssVarsProvider>
            </div>,
          );
          render(
            <div style={{ width: 400 }}>
              <HintoricAutocomplete
                options={OPTIONS}
                variant={variant}
                color={color}
                data-testid={`hintoric-${variant}-${color}`}
              />
            </div>,
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
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          // Inside the 400px parent: Joy's root is `display: flex` and fills
          // it (P1 of the 2026-09-06 audit — ours used to shrink to 229px).
          expect(hintoricStyle.display).toBe(joyStyle.display);
          expect(hintoricStyle.width).toBe(joyStyle.width);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`autocomplete-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricRoot).toMatchScreenshot(`autocomplete-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed metrics in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <div data-testid={`joy-size-box-${size}`} style={{ width: 400 }}>
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyAutocomplete options={OPTIONS} size={size} data-testid={`joy-size-${size}`} />
            </JoyCssVarsProvider>
          </div>,
        );
        render(
          <div data-testid={`hintoric-size-box-${size}`} style={{ width: 400 }}>
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricAutocomplete options={OPTIONS} size={size} data-testid={`hintoric-size-${size}`} />
            </ColorSchemeProvider>
          </div>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
        const hintoricInput = page.getByTestId(`hintoric-size-${size}`).element();
        const hintoricStyle = getComputedStyle(hintoricInput.closest('div') as HTMLElement);

        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(hintoricStyle.height).toBe(joyStyle.height);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
        expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
        // Joy's body-sm/-lg use line-height 1.5 (21px/27px); Tailwind's
        // text-sm/-lg carry 20px/28px, invisible behind min-height until now.
        expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
        expect(hintoricStyle.display).toBe(joyStyle.display);
        expect(hintoricStyle.width).toBe(joyStyle.width);

        await expect(page.getByTestId(`joy-size-box-${size}`)).toMatchScreenshot(`autocomplete-size-${size}-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-size-box-${size}`)).toMatchScreenshot(
          `autocomplete-size-${size}-hintoric-${scheme}`,
        );
      });
    }

    // The root is a <div> in both libraries, so `:disabled` can't style it —
    // this matrix is what proves the data-disabled classes reach the pill.
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} disabled matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <div style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyAutocomplete
                  options={OPTIONS}
                  disabled
                  variant={variant}
                  color={color}
                  data-testid={`joy-dis-${variant}-${color}`}
                />
              </JoyCssVarsProvider>
            </div>,
          );
          render(
            <div style={{ width: 400 }}>
              <HintoricAutocomplete
                options={OPTIONS}
                disabled
                variant={variant}
                color={color}
                data-testid={`hintoric-dis-${variant}-${color}`}
              />
            </div>,
          );

          const joyRoot = page.getByTestId(`joy-dis-${variant}-${color}`).element();
          const hintoricInput = page.getByTestId(`hintoric-dis-${variant}-${color}`).element() as HTMLInputElement;
          const hintoricRoot = hintoricInput.closest('div') as HTMLElement;
          expect(hintoricInput.disabled).toBe(true);
          expect(joyRoot.querySelector('input')).toBeDisabled();

          const joyStyle = getComputedStyle(joyRoot);
          const hintoricStyle = getComputedStyle(hintoricRoot);
          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
          expect(hintoricStyle.display).toBe(joyStyle.display);
          expect(hintoricStyle.width).toBe(joyStyle.width);

          await expect(page.getByTestId(`joy-dis-${variant}-${color}`)).toMatchScreenshot(`autocomplete-disabled-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricRoot).toMatchScreenshot(`autocomplete-disabled-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    // Forcing Joy's real Autocomplete popup open from the outside turned out to
    // be unreliable in this test harness (its `open` state is internal to
    // useAutocomplete, with no public controlled prop, and simulated
    // mousedown/click/ArrowDown events didn't consistently mount its Popper
    // portal here even though the popup-indicator's own state visibly flipped).
    // Joy's `AutocompleteNoOptions`/`AutocompleteLoading` are just
    // `styled(ListItem)` with one added rule — `color: theme.palette.text.secondary`
    // (confirmed in `@mui/joy`'s `Autocomplete.js`) — so comparing against a
    // bare `<ListItem sx={{ color: 'text.secondary' }}>` is the same comparison
    // without depending on that interaction succeeding, and matches this file's
    // existing pattern of comparing against a plain rendered Joy primitive.
    it(`loadingText's color matches Joy's text.secondary token in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItem sx={{ color: 'text.secondary' }} data-testid="joy-secondary-text">
            reference
          </JoyListItem>
        </JoyCssVarsProvider>,
      );
      render(<HintoricAutocomplete options={[]} loading loadingText="Searching…" data-testid="hintoric-loading" />);

      await userEvent.click(page.getByTestId('hintoric-loading').element());
      const hintoricLoading = await screen.findByText('Searching…');

      expect(getComputedStyle(hintoricLoading).color).toBe(
        getComputedStyle(page.getByTestId('joy-secondary-text').element()).color,
      );

      await expect(page.getByTestId('hintoric-loading')).toMatchScreenshot(`autocomplete-loading-hintoric-${scheme}`);
    });

    it(`noOptionsText's color matches Joy's text.secondary token in ${scheme}, and defaults to 'No options'`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItem sx={{ color: 'text.secondary' }} data-testid="joy-secondary-text-2">
            reference
          </JoyListItem>
        </JoyCssVarsProvider>,
      );
      render(<HintoricAutocomplete options={[]} noOptionsText="Nothing found" data-testid="hintoric-empty" />);

      await userEvent.click(page.getByTestId('hintoric-empty').element());
      const hintoricEmpty = await screen.findByText('Nothing found');

      expect(getComputedStyle(hintoricEmpty).color).toBe(
        getComputedStyle(page.getByTestId('joy-secondary-text-2').element()).color,
      );

      await expect(page.getByTestId('hintoric-empty')).toMatchScreenshot(`autocomplete-empty-hintoric-${scheme}`);
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
