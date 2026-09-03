import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Select as JoySelect, Option as JoyOption } from '@mui/joy';
import { Select as HintoricSelect } from '../components/Select';
import { Option as HintoricOption } from '../components/Option';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Options only exist inside an open listbox, so every case here renders the
// Select with its listbox forced open and reads the option element from
// inside its popup — resting, selected, and highlighted (keyboard-navigated)
// states, per CLAUDE.md's interactive-state coverage requirement.
//
// Both real Joy UI and this implementation auto-highlight the FIRST item in
// an open listbox with no selection — so a genuine "resting" (non-highlighted)
// comparison has to look at the SECOND option instead of the first.
describe('Option visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} resting state matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoySelect listboxOpen value={null}>
              <JoyOption value="a">Alpha</JoyOption>
              <JoyOption data-testid={`joy-${variant}-${color}`} variant={variant} color={color} value="b">
                Beta
              </JoyOption>
            </JoySelect>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricSelect defaultListboxOpen>
            <HintoricOption value="a">Alpha</HintoricOption>
            <HintoricOption data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color} value="b">
              Beta
            </HintoricOption>
          </HintoricSelect>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricEl = page.getByTestId(`hintoric-${variant}-${color}`).element();
        const hintoricStyle = getComputedStyle(hintoricEl);

        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`option-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`option-${variant}-${color}-hintoric`);
      });
    }
  }

  // Note: unlike ListItemButton (which bumps to fontWeight.md when selected
  // via its OWN separate styled wrapper), Option's styled wrapper adds no
  // such rule on top of the StyledListItemButton base it shares — so a
  // selected Option's font-weight does NOT change. Confirmed against
  // @mui/joy's Option.js source (`OptionRoot` only overrides `.highlighted`).
  it('selected option gets the variant Active background (no font-weight change)', async () => {
    render(
      <JoyCssVarsProvider>
        <JoySelect listboxOpen value="a">
          <JoyOption data-testid="joy-selected" value="a">
            Alpha
          </JoyOption>
        </JoySelect>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricSelect defaultListboxOpen value="a">
        <HintoricOption data-testid="hintoric-selected" value="a">
          Alpha
        </HintoricOption>
      </HintoricSelect>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-selected').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-selected').element());

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
  });

  // Real hover-driven highlighting (Base UI's `highlightItemOnHover`, Joy's
  // pointer-move listener on its Popper listbox) both key off genuine
  // `pointermove` deltas to avoid highlighting whatever's already under the
  // cursor at the moment the listbox opens — a real mouse physically moves
  // through intermediate points, but neither `userEvent.hover()` nor a
  // synthetic single-point `pointermove`/`mouseover` dispatch reproduces that
  // for either library in this harness (confirmed: both @mui/joy's own
  // Option AND ours stay unhighlighted under every synthetic-hover variant
  // tried here, not just ours). Keyboard-driven highlighting is covered by
  // Option.test.tsx's real click-then-arrow-key jsdom interaction test
  // instead, which routes through the same `state.highlighted` mechanism and
  // reliably observes the resulting `data-highlighted` attribute move
  // between options.
});
