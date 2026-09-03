import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Container as JoyContainer } from '@mui/joy';
import { Container as HintoricContainer } from '../components/Container';

const MAX_WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

describe('Container visual parity with @mui/joy', () => {
  for (const maxWidth of MAX_WIDTHS) {
    it(`maxWidth=${maxWidth} matches Joy UI's computed max-width`, async () => {
      render(
        <JoyCssVarsProvider>
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
    });
  }

  it('disableGutters removes horizontal padding, matching Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
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
});
