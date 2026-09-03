import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Avatar as JoyAvatar } from '@mui/joy';
import { Avatar as HintoricAvatar } from '../components/Avatar';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Avatar is non-interactive — no focus state to cover, just the variant x
// color x size matrix, plus the image-fallback path.
describe('Avatar visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyAvatar data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              JW
            </JoyAvatar>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricAvatar data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              JW
            </HintoricAvatar>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
        const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyLocator.element());
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
        expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.height).toBe(joyStyle.height);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);

        await expect(joyLocator).toMatchScreenshot(`avatar-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`avatar-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed dimensions`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyAvatar data-testid={`joy-size-${size}`} size={size}>
            JW
          </JoyAvatar>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <HintoricAvatar data-testid={`hintoric-size-${size}`} size={size}>
            JW
          </HintoricAvatar>
        </ColorSchemeProvider>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

      expect(hintoricStyle.width).toBe(joyStyle.width);
      expect(hintoricStyle.height).toBe(joyStyle.height);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
    });
  }

  it('renders an image that fills the circle, matching Joy UI', async () => {
    const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7';
    render(
      <JoyCssVarsProvider>
        <JoyAvatar data-testid="joy-img" src={src} alt="avatar" />
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider>
        <HintoricAvatar data-testid="hintoric-img" src={src} alt="avatar" />
      </ColorSchemeProvider>,
    );

    const joyImg = page.getByTestId('joy-img').element().querySelector('img') as HTMLImageElement;
    const hintoricImg = page.getByTestId('hintoric-img').element().querySelector('img') as HTMLImageElement;

    const joyStyle = getComputedStyle(joyImg);
    const hintoricStyle = getComputedStyle(hintoricImg);

    expect(hintoricStyle.width).toBe(joyStyle.width);
    expect(hintoricStyle.height).toBe(joyStyle.height);
    expect(hintoricStyle.objectFit).toBe(joyStyle.objectFit);
  });
});
