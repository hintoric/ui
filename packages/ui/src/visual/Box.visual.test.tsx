import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Box as JoyBox } from '@mui/joy';
import { Box as HintoricBox } from '../components/Box';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Box is the thinnest component in the library: a <div> that forwards
// everything and adds nothing. It has no variant, colour or size axis, so
// there is no raster to cross with the schemes — what can break is the
// forwarding, and that it stays a plain unstyled box.
//
// Joy's Box carries the `sx` system, which this project deliberately does not
// reproduce (consumers write Tailwind classes instead). So the comparison is
// limited to what both agree on: an unstyled block-level div.
describe('Box visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`renders an unstyled block like Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 200 }}>
            <JoyBox data-testid="joy-box">content</JoyBox>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 200 }}>
            <HintoricBox data-testid="hintoric-box">content</HintoricBox>
          </div>
        </ColorSchemeProvider>,
      );

      const joyLocator = page.getByTestId('joy-box');
      const hintoricLocator = page.getByTestId('hintoric-box');
      const joyEl = joyLocator.element();
      const hintoricEl = hintoricLocator.element();

      const joyStyle = getComputedStyle(joyEl);
      const hintoricStyle = getComputedStyle(hintoricEl);

      expect(hintoricEl.tagName).toBe(joyEl.tagName);
      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.padding).toBe(joyStyle.padding);
      expect(hintoricStyle.margin).toBe(joyStyle.margin);
      expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
      // Fills its parent, as a block-level div must — the sizing assertion
      // P2 of the 2026-09-06 coverage audit asks for.
      expect(hintoricEl.getBoundingClientRect().width).toBeCloseTo(
        joyEl.getBoundingClientRect().width,
        1,
      );

      await expect(joyLocator).toMatchScreenshot(`box-joy-${scheme}`);
      await expect(hintoricLocator).toMatchScreenshot(`box-hintoric-${scheme}`);
    });

    /**
     * `component` is the whole of Box's own API. If it were swallowed, every
     * consumer using Box for semantic markup would silently get a <div>.
     */
    it(`renders as the requested element in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricBox component="section" data-testid="as-section">
            content
          </HintoricBox>
        </ColorSchemeProvider>,
      );

      expect(screen.getByTestId('as-section').tagName).toBe('SECTION');
    });
  }

  /**
   * The layout-only exception in CLAUDE.md: Box sets no colour utility at all,
   * so "dark must differ from light" is unsatisfiable. The inverse is the
   * meaningful assertion — and for Box specifically, staying transparent is
   * the contract: a Box that painted a background would break every layout
   * built on it.
   */
  it('paints nothing in either colour scheme', async () => {
    await setColorScheme('light');
    render(
      <ColorSchemeProvider defaultMode="light">
        <HintoricBox data-testid="scheme-box">content</HintoricBox>
      </ColorSchemeProvider>,
    );

    const el = screen.getByTestId('scheme-box');
    const read = () => {
      const s = getComputedStyle(el);
      return [s.backgroundColor, s.borderTopWidth, s.padding];
    };

    const light = read();
    await setColorScheme('dark');

    expect(read()).toEqual(light);
    expect(read()[0]).toBe('rgba(0, 0, 0, 0)');
  });
});
