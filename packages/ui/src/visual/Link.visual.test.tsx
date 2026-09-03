import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Link as JoyLink } from '@mui/joy';
import { Link as HintoricLink } from '../components/Link';

const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;

describe('Link visual parity with @mui/joy', () => {
  for (const color of COLORS) {
    it(`plain (no variant) color=${color} matches Joy UI's computed styles`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyLink data-testid={`joy-${color}`} color={color}>
            {color}
          </JoyLink>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricLink data-testid={`hintoric-${color}`} color={color}>
          {color}
        </HintoricLink>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-${color}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${color}`).element());

      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

      await expect(page.getByTestId(`joy-${color}`)).toMatchScreenshot(`link-plain-${color}-joy`);
      await expect(page.getByTestId(`hintoric-${color}`)).toMatchScreenshot(`link-plain-${color}-hintoric`);
    });
  }

  for (const variant of VARIANTS) {
    it(`variant=${variant} matches Joy UI's computed styles`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyLink data-testid={`joy-v-${variant}`} variant={variant} color="primary">
            link
          </JoyLink>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricLink data-testid={`hintoric-v-${variant}`} variant={variant} color="primary">
          link
        </HintoricLink>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-v-${variant}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-v-${variant}`).element());

      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    });
  }

  it('underline="always" applies text-decoration:underline, matching Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyLink data-testid="joy-u" underline="always">
          link
        </JoyLink>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricLink data-testid="hintoric-u" underline="always">
        link
      </HintoricLink>,
    );

    expect(getComputedStyle(page.getByTestId('hintoric-u').element()).textDecorationLine).toBe(
      getComputedStyle(page.getByTestId('joy-u').element()).textDecorationLine,
    );
  });
});
