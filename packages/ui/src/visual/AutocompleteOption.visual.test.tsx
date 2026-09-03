import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Combobox } from '@base-ui/react/combobox';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Autocomplete as JoyAutocomplete,
  AutocompleteOption as JoyAutocompleteOption,
} from '@mui/joy';
import { AutocompleteOption as HintoricAutocompleteOption } from '../components/AutocompleteOption';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Options only exist inside an open listbox. Joy's real Autocomplete
// auto-highlights the first matching item, so (mirroring Option's own visual
// test) a genuine "resting" comparison looks at the SECOND option instead.
describe('AutocompleteOption visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} resting state matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyAutocomplete
              open
              options={['Alpha', 'Beta']}
              renderOption={(props, option) => (
                <JoyAutocompleteOption
                  {...props}
                  key={option}
                  variant={variant}
                  color={color}
                  data-testid={option === 'Beta' ? `joy-${variant}-${color}` : undefined}
                >
                  {option}
                </JoyAutocompleteOption>
              )}
            />
          </JoyCssVarsProvider>,
        );
        render(
          <Combobox.Root items={['Alpha', 'Beta']} open>
            <Combobox.Input />
            <Combobox.Portal>
              <Combobox.Positioner>
                <Combobox.Popup className="min-w-[200px]">
                  <Combobox.List>
                    {(item: string) => (
                      <HintoricAutocompleteOption
                        key={item}
                        value={item}
                        variant={variant}
                        color={color}
                        data-testid={item === 'Beta' ? `hintoric-${variant}-${color}` : undefined}
                      >
                        {item}
                      </HintoricAutocompleteOption>
                    )}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>,
        );

        const joyOption = page.getByTestId(`joy-${variant}-${color}`);
        const hintoricOption = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyOption.element());
        const hintoricStyle = getComputedStyle(hintoricOption.element());

        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);

        await expect(joyOption).toMatchScreenshot(`autocomplete-option-${variant}-${color}-joy`);
        await expect(hintoricOption).toMatchScreenshot(`autocomplete-option-${variant}-${color}-hintoric`);
      });
    }
  }

  it('selected option gets the variant Active background + medium font-weight', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyAutocomplete
          open
          value="Alpha"
          options={['Alpha']}
          renderOption={(props, option) => (
            <JoyAutocompleteOption {...props} key={option} data-testid="joy-selected">
              {option}
            </JoyAutocompleteOption>
          )}
        />
      </JoyCssVarsProvider>,
    );
    render(
      <Combobox.Root items={['Alpha']} value="Alpha" open>
        <Combobox.Input />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Popup className="min-w-[200px]">
              <Combobox.List>
                {(item: string) => (
                  <HintoricAutocompleteOption key={item} value={item} data-testid="hintoric-selected">
                    {item}
                  </HintoricAutocompleteOption>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-selected').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-selected').element());

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
  });
});
