import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Select as JoySelect, Option as JoyOption } from '@mui/joy';
import { Select as HintoricSelect } from '../components/Select';
import { Option as HintoricOption } from '../components/Option';
import { lastShadowLayers } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

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
            <JoySelect data-testid={`joy-${variant}-${color}`} variant={variant} color={color} value="a">
              <JoyOption value="a">Alpha</JoyOption>
            </JoySelect>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricSelect data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color} value="a">
            <HintoricOption value="a">Alpha</HintoricOption>
          </HintoricSelect>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(lastShadowLayers(hintoricStyle.boxShadow, 1)).toBe(lastShadowLayers(joyStyle.boxShadow, 1));

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`select-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`select-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed min-height and padding-inline`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoySelect data-testid={`joy-size-${size}`} size={size} value="a">
            <JoyOption value="a">Alpha</JoyOption>
          </JoySelect>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricSelect data-testid={`hintoric-size-${size}`} size={size} value="a">
          <HintoricOption value="a">Alpha</HintoricOption>
        </HintoricSelect>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

      expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
      expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
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
      <HintoricSelect data-testid="hintoric-plain-shadow" variant="plain" value="a">
        <HintoricOption value="a">Alpha</HintoricOption>
      </HintoricSelect>,
    );

    const joyStyle = getComputedStyle(page.getByTestId('joy-plain-shadow').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-plain-shadow').element());

    expect(hintoricStyle.boxShadow).toBe('none');
    expect(joyStyle.boxShadow).toBe('none');
  });
});
