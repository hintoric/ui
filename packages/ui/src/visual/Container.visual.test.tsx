import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Container as JoyContainer } from '@mui/joy';
import { Container as HintoricContainer } from '../components/Container';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

const MAX_WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

describe('Container visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const maxWidth of MAX_WIDTHS) {
      it(`maxWidth=${maxWidth} matches Joy UI's computed max-width in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyContainer data-testid={`joy-${maxWidth}`} maxWidth={maxWidth}>
              content
            </JoyContainer>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricContainer data-testid={`hintoric-${maxWidth}`} maxWidth={maxWidth}>
            content
          </HintoricContainer>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${maxWidth}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${maxWidth}`).element());

        expect(hintoricStyle.maxWidth).toBe(joyStyle.maxWidth);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
        expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
        expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);

        // This file had no screenshots at all until 2026-09-07, which is a
        // straight violation of rule 4 — Tooltip is the only component with a
        // documented exemption, and Container is not it. A max-width container
        // makes a dull picture, which is presumably why they were skipped, but
        // "dull" is not "exempt": the gutters and the centring show up here and
        // nowhere else.
        await expect(page.getByTestId(`joy-${maxWidth}`)).toMatchScreenshot(
          `container-${maxWidth}-joy-${scheme}`,
        );
        await expect(page.getByTestId(`hintoric-${maxWidth}`)).toMatchScreenshot(
          `container-${maxWidth}-hintoric-${scheme}`,
        );
      });
    }

    it(`disableGutters removes horizontal padding, matching Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyContainer data-testid="joy-nogutter" disableGutters>
            content
          </JoyContainer>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricContainer data-testid="hintoric-nogutter" disableGutters>
          content
        </HintoricContainer>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-nogutter').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-nogutter').element());

      expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
      expect(joyStyle.paddingLeft).toBe('0px');
    });
  }
});
