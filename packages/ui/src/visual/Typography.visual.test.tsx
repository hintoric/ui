import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Typography as JoyTypography } from '@mui/joy';
import { Typography as HintoricTypography } from '../components/Typography';
import type { TypographyLevel } from '../components/Typography';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, expectSameLineHeight, setColorScheme } from './helpers';

// Typography's whole purpose is the type scale, so this is the one component
// where fontSize/fontWeight/lineHeight are not an extra check bolted onto a
// colour comparison — they are the entire contract. Joy resolves each level
// from `theme.typography[level]` (extendTheme.js), which sets fontFamily,
// fontSize, lineHeight, a colour, and for some levels a fontWeight.
const LEVELS: TypographyLevel[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'title-lg',
  'title-md',
  'title-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'body-xs',
];

describe('Typography visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const level of LEVELS) {
      it(`level=${level} matches Joy UI's computed styles in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyTypography data-testid={`joy-${level}`} level={level}>
              The quick brown fox
            </JoyTypography>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricTypography data-testid={`hintoric-${level}`} level={level}>
              The quick brown fox
            </HintoricTypography>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${level}`);
        const hintoricLocator = page.getByTestId(`hintoric-${level}`);

        const joyStyle = getComputedStyle(joyLocator.element());
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
        expectSameLineHeight(hintoricStyle.lineHeight, joyStyle.lineHeight);
        expect(hintoricStyle.color).toBe(joyStyle.color);

        await expect(joyLocator).toMatchScreenshot(`typography-${level}-joy-${scheme}`);
        await expect(hintoricLocator).toMatchScreenshot(`typography-${level}-hintoric-${scheme}`);
      });
    }

    /**
     * Each level has a default element, which is part of the API rather than
     * cosmetics: an `h1` level that renders a <p> gives screen readers a flat
     * document. Joy's own mapping is the reference.
     */
    it(`picks the same default element as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      for (const level of LEVELS) {
        const { unmount } = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyTypography data-testid={`joy-tag-${level}`} level={level}>
              x
            </JoyTypography>
          </JoyCssVarsProvider>,
        );
        const joyTag = page.getByTestId(`joy-tag-${level}`).element().tagName;
        unmount();

        const ours = render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricTypography data-testid={`hintoric-tag-${level}`} level={level}>
              x
            </HintoricTypography>
          </ColorSchemeProvider>,
        );
        const hintoricTag = page.getByTestId(`hintoric-tag-${level}`).element().tagName;
        ours.unmount();

        expect(hintoricTag, `level=${level}`).toBe(joyTag);
      }
    });
  }

  /**
   * The scheme axis exists for exactly this: Joy's typography levels carry a
   * `color` from the text palette, which is remapped per scheme. A level that
   * hardcoded a light ink would pass every light assertion above.
   */
  it('changes its text colour with the scheme', async () => {
    await setColorScheme('light');
    render(
      <ColorSchemeProvider defaultMode="light">
        <HintoricTypography data-testid="scheme-body" level="body-md">
          x
        </HintoricTypography>
      </ColorSchemeProvider>,
    );

    const el = page.getByTestId('scheme-body').element();
    const light = getComputedStyle(el).color;
    await setColorScheme('dark');

    expect(getComputedStyle(el).color).not.toBe(light);
  });
});
