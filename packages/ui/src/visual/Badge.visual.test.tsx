import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Badge as JoyBadge } from '@mui/joy';
import { Badge as HintoricBadge } from '../components/Badge';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Badge visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyBadge data-testid={`joy-${variant}-${color}`} variant={variant} color={color} badgeContent={3}>
              <span style={{ width: 32, height: 32, display: 'block', background: '#ccc' }} />
            </JoyBadge>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricBadge data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color} badgeContent={3}>
            <span style={{ width: 32, height: 32, display: 'block', background: '#ccc' }} />
          </HintoricBadge>,
        );

        const joyDot = page.getByTestId(`joy-${variant}-${color}`).element().querySelector('span[class*="MuiBadge-badge"]') as HTMLElement;
        const hintoricDot = page.getByTestId(`hintoric-${variant}-${color}`).element().lastElementChild as HTMLElement;

        const joyStyle = getComputedStyle(joyDot);
        const hintoricStyle = getComputedStyle(hintoricDot);

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`badge-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`badge-${variant}-${color}-hintoric`);
      });
    }
  }

  it('hides the badge via invisible, matching Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyBadge data-testid="joy-inv" badgeContent={3} invisible>
          <span style={{ width: 32, height: 32, display: 'block' }} />
        </JoyBadge>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricBadge data-testid="hintoric-inv" badgeContent={3} invisible>
        <span style={{ width: 32, height: 32, display: 'block' }} />
      </HintoricBadge>,
    );

    const joyDot = page.getByTestId('joy-inv').element().querySelector('span[class*="MuiBadge-badge"]') as HTMLElement;
    const hintoricDot = page.getByTestId('hintoric-inv').element().lastElementChild as HTMLElement;

    // Joy UI scales via the `transform` shorthand; Tailwind v4's scale-*
    // utility uses the separate modern `scale` CSS property instead — two
    // different APIs for the same visual effect, so compare the resulting
    // (collapsed-to-zero) rendered size rather than the raw transform string.
    expect(joyDot.getBoundingClientRect().width).toBeCloseTo(0, 0);
    expect(hintoricDot.getBoundingClientRect().width).toBeCloseTo(0, 0);
  });
});
