import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Textarea as JoyTextarea } from '@mui/joy';
import { Textarea as HintoricTextarea } from '../components/Textarea';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { lastShadowLayer } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Joy UI's Textarea has a root-wrapper + native-<textarea> split (like
// Input); ours is a single native <textarea> with no wrapper. Each side's
// "visible box" is therefore a different element: Joy's wrapper vs our bare
// textarea — that's the correct, fair comparison target for each.
describe('Textarea visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        const { container: joyContainer } = render(
          <div data-testid={`joy-${variant}-${color}`}>
            <JoyCssVarsProvider>
              <JoyTextarea variant={variant} color={color} placeholder={color} />
            </JoyCssVarsProvider>
          </div>,
        );
        const { container: hintoricContainer } = render(
          <div data-testid={`hintoric-${variant}-${color}`}>
            <ColorSchemeProvider>
              <HintoricTextarea
                variant={variant}
                color={color}
                placeholder={color}
                aria-label={`${variant}-${color}`}
              />
            </ColorSchemeProvider>
          </div>,
        );

        const joyWrapper = joyContainer.querySelector('textarea')!.parentElement as HTMLElement;
        const hintoricTextarea = hintoricContainer.querySelector('textarea') as HTMLElement;

        const joyStyle = getComputedStyle(joyWrapper);
        const hintoricStyle = getComputedStyle(hintoricTextarea);

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
        expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));
        expect(hintoricStyle.resize).toBe(joyStyle.resize);
        expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(
          `textarea-${variant}-${color}-joy`,
        );
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(
          `textarea-${variant}-${color}-hintoric`,
        );
      });
    }
  }
});
