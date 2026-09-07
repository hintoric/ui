import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Select as JoySelect, Option as JoyOption } from '@mui/joy';
import { Select as HintoricSelect } from '../components/Select';
import { Option as HintoricOption } from '../components/Option';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { lastShadowLayer, lastShadowLayers, settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// A fixed-width parent for every case: Joy's SelectRoot is a block-level flex
// container that fills its parent's inline size, so `width` is only a
// meaningful comparison inside a container that actually constrains it. This
// is what caught the original divergence — our root was `inline-flex` and
// shrank to its content while Joy's filled the box.
const BOX: React.CSSProperties = { width: 400 };

// Joy UI's Select is a two-layer structure: an outer <div> (SelectRoot) that
// carries all the visual styling, wrapping an inner <button> (SelectButton)
// that's just a native-style reset with no visuals of its own. Our
// implementation has no such wrapper — Base UI's Select.Trigger (a real
// <button>) IS the styled root. So Joy's assertions target its outer
// data-testid div, ours target the trigger button directly — both are each
// component's own actual visual root.
describe('Select visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <div style={BOX}>
              <JoySelect data-testid={`joy-${variant}-${color}`} variant={variant} color={color} value="a">
                <JoyOption value="a">Alpha</JoyOption>
              </JoySelect>
            </div>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <div style={BOX}>
              <HintoricSelect data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color} value="a">
                <HintoricOption value="a">Alpha</HintoricOption>
              </HintoricSelect>
            </div>
          </ColorSchemeProvider>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        // Box model. `display` and `width` are the pair that matter most:
        // together they decide whether the control reads as a form field or
        // as a button, and nothing else in this file constrains them.
        expect(hintoricStyle.display).toBe(joyStyle.display);
        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(hintoricStyle.boxSizing).toBe(joyStyle.boxSizing);
        expect(hintoricStyle.position).toBe(joyStyle.position);
        expect(hintoricStyle.alignItems).toBe(joyStyle.alignItems);

        // Joy spaces the slots with per-slot margins, so the root's own gap
        // must stay `normal` — a flex gap here would double the spacing.
        expect(hintoricStyle.gap).toBe(joyStyle.gap);

        expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
        expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
        expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);

        // Border: only `outlined` draws one, but every variant must agree on
        // width and style so the box model lines up.
        expect(hintoricStyle.borderTopWidth).toBe(joyStyle.borderTopWidth);
        expect(hintoricStyle.borderTopStyle).toBe(joyStyle.borderTopStyle);
        expect(hintoricStyle.borderTopColor).toBe(joyStyle.borderTopColor);

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
        expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
        expect(lastShadowLayers(hintoricStyle.boxShadow, 1)).toBe(lastShadowLayers(joyStyle.boxShadow, 1));

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`select-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`select-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed metrics`, async () => {
      render(
        <JoyCssVarsProvider>
          <div style={BOX}>
            <JoySelect data-testid={`joy-size-${size}`} size={size} value="a">
              <JoyOption value="a">Alpha</JoyOption>
            </JoySelect>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <div style={BOX}>
            <HintoricSelect data-testid={`hintoric-size-${size}`} size={size} value="a">
              <HintoricOption value="a">Alpha</HintoricOption>
            </HintoricSelect>
          </div>
        </ColorSchemeProvider>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

      expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
      expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
      expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
      expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
      expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);

      await expect(page.getByTestId(`joy-size-${size}`)).toMatchScreenshot(`select-size-${size}-joy`);
      await expect(page.getByTestId(`hintoric-size-${size}`)).toMatchScreenshot(`select-size-${size}-hintoric`);
    });
  }

  it('plain variant has no box-shadow (unlike every other variant)', async () => {
    render(
      <JoyCssVarsProvider>
        <JoySelect data-testid="joy-plain-shadow" variant="plain" value="a">
          <JoyOption value="a">Alpha</JoyOption>
        </JoySelect>
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider>
        <HintoricSelect data-testid="hintoric-plain-shadow" variant="plain" value="a">
          <HintoricOption value="a">Alpha</HintoricOption>
        </HintoricSelect>
      </ColorSchemeProvider>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-plain-shadow').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-plain-shadow').element());

    expect(hintoricStyle.boxShadow).toBe('none');
    expect(joyStyle.boxShadow).toBe('none');
  });

  // Joy UI's focus ring maps color="neutral" to primary-500 and every other
  // color to its own -500, the same mapping Input's ring uses. Select had no
  // focus coverage at all before, which is exactly the hole CLAUDE.md's rule
  // about interactive states exists to close.
  for (const color of COLORS) {
    it(`focus ring for color=${color} matches Joy UI's ring`, async () => {
      const { container: joyContainer } = render(
        <JoyCssVarsProvider>
          <JoySelect data-testid={`joy-focus-${color}`} color={color} value="a">
            <JoyOption value="a">Alpha</JoyOption>
          </JoySelect>
        </JoyCssVarsProvider>,
      );
      const { container: hintoricContainer } = render(
        <ColorSchemeProvider>
          <HintoricSelect data-testid={`hintoric-focus-${color}`} color={color} value="a">
            <HintoricOption value="a">Alpha</HintoricOption>
          </HintoricSelect>
        </ColorSchemeProvider>,
      );

      // Joy focuses its inner <button>; the ring is drawn on the outer root's
      // ::before overlay. Ours focuses the trigger, which IS the root.
      const joyButton = joyContainer.querySelector('button') as HTMLButtonElement;
      const hintoricButton = hintoricContainer.querySelector('button') as HTMLButtonElement;

      joyButton.focus();
      await settleTransitions();
      const joyRing = getComputedStyle(page.getByTestId(`joy-focus-${color}`).element(), '::before').boxShadow;
      joyButton.blur();

      hintoricButton.focus();
      await settleTransitions();
      const hintoricRing = getComputedStyle(page.getByTestId(`hintoric-focus-${color}`).element()).boxShadow;

      await expect(page.getByTestId(`hintoric-focus-${color}`)).toMatchScreenshot(`select-focus-${color}-hintoric`);
      hintoricButton.blur();

      expect(lastShadowLayer(hintoricRing)).toBe(lastShadowLayer(joyRing));
    });
  }

  for (const variant of VARIANTS) {
    it(`disabled ${variant} matches Joy UI's computed styles`, async () => {
      render(
        <JoyCssVarsProvider>
          <div style={BOX}>
            <JoySelect data-testid={`joy-disabled-${variant}`} variant={variant} value="a" disabled>
              <JoyOption value="a">Alpha</JoyOption>
            </JoySelect>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <div style={BOX}>
            <HintoricSelect data-testid={`hintoric-disabled-${variant}`} variant={variant} value="a" disabled>
              <HintoricOption value="a">Alpha</HintoricOption>
            </HintoricSelect>
          </div>
        </ColorSchemeProvider>,
      );

      await settleTransitions();
      const joyStyle = getComputedStyle(page.getByTestId(`joy-disabled-${variant}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-disabled-${variant}`).element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.borderTopColor).toBe(joyStyle.borderTopColor);
      expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

      await expect(page.getByTestId(`joy-disabled-${variant}`)).toMatchScreenshot(`select-disabled-${variant}-joy`);
      await expect(page.getByTestId(`hintoric-disabled-${variant}`)).toMatchScreenshot(`select-disabled-${variant}-hintoric`);
    });
  }

  for (const variant of VARIANTS) {
    it(`hover ${variant} matches Joy UI's computed background`, async () => {
      render(
        <JoyCssVarsProvider>
          <div style={BOX}>
            <JoySelect data-testid={`joy-hover-${variant}`} variant={variant} value="a">
              <JoyOption value="a">Alpha</JoyOption>
            </JoySelect>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <div style={BOX}>
            <HintoricSelect data-testid={`hintoric-hover-${variant}`} variant={variant} value="a">
              <HintoricOption value="a">Alpha</HintoricOption>
            </HintoricSelect>
          </div>
        </ColorSchemeProvider>,
      );

      // Unlike a listbox item's highlight (which needs real pointer-move
      // deltas — see Option.visual.test.tsx), the trigger's hover is a plain
      // CSS :hover on the element, so the harness's own mouse move drives it.
      await page.getByTestId(`joy-hover-${variant}`).hover();
      await settleTransitions();
      const joyHover = getComputedStyle(page.getByTestId(`joy-hover-${variant}`).element()).backgroundColor;

      await page.getByTestId(`hintoric-hover-${variant}`).hover();
      await settleTransitions();
      const hintoricHover = getComputedStyle(page.getByTestId(`hintoric-hover-${variant}`).element()).backgroundColor;

      expect(hintoricHover).toBe(joyHover);
    });
  }

  // The open listbox was entirely uncovered: every assertion above reads the
  // closed trigger, so the popup surface and its rows could drift freely.
  it('open listbox surface matches Joy UI\'s computed styles', async () => {
    render(
      <JoyCssVarsProvider>
        <JoySelect value="a" defaultListboxOpen slotProps={{ listbox: { 'data-testid': 'joy-listbox' } }}>
          <JoyOption value="a">Alpha</JoyOption>
          <JoyOption value="b">Beta</JoyOption>
        </JoySelect>
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider>
        <HintoricSelect value="a" defaultListboxOpen>
          <HintoricOption value="a">Alpha</HintoricOption>
          <HintoricOption value="b">Beta</HintoricOption>
        </HintoricSelect>
      </ColorSchemeProvider>,
    );

    await settleTransitions();

    const joyListbox = document.querySelector('[data-testid="joy-listbox"]') as HTMLElement;

    // Ours has no listbox testid hook, and the two elements are not the same
    // shape: Base UI splits the popup (the styled surface, role="presentation")
    // from the list inside it (role="listbox"), while Joy styles the listbox
    // element itself. Reach ours through the trigger's `aria-controls` — the
    // stable semantic link — then step up to the surface that carries the
    // background and shadow.
    // Joy renders first and its inner button is a combobox too, so take the
    // last one — ours.
    const triggers = [...document.querySelectorAll('[role="combobox"]')] as HTMLElement[];
    const trigger = triggers[triggers.length - 1];
    const listId = trigger.getAttribute('aria-controls') as string;
    const hintoricPopup = document.getElementById(listId)?.parentElement as HTMLElement;

    expect(joyListbox).toBeTruthy();
    expect(hintoricPopup).toBeTruthy();

    const joyStyle = getComputedStyle(joyListbox);
    const hintoricStyle = getComputedStyle(hintoricPopup);

    expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(hintoricStyle.color).toBe(joyStyle.color);
    expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
    expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
    expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);
    expect(lastShadowLayers(hintoricStyle.boxShadow, 2)).toBe(lastShadowLayers(joyStyle.boxShadow, 2));
  });
});
