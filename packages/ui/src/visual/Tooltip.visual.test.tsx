import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Tooltip as JoyTooltip } from '@mui/joy';
import { Tooltip as HintoricTooltip } from '../components/Tooltip';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Forcing the popup open (rather than simulating hover) keeps this
// deterministic across jsdom vs a real browser's pointer/hover timing —
// hover behavior itself is covered by Tooltip.test.tsx's interaction test.
//
// No toMatchScreenshot() here: Base UI's floating-ui positioning keeps the
// popup subtly repositioning every frame while two forced-open popups sit on
// screen at once, so the harness's screenshot-stability check never settles
// within its timeout (each attempt costs ~100s). Screenshots are for human
// review only per CLAUDE.md — the computed-style assertions below are the
// actual pass/fail signal, so they stay.
describe('Tooltip visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyTooltip title={color} variant={variant} color={color} open>
              <button>trigger</button>
            </JoyTooltip>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricTooltip title={color} variant={variant} color={color} defaultOpen>
            <button>trigger</button>
          </HintoricTooltip>,
        );

        const joyPopupLocator = page.getByText(color).nth(0);
        const hintoricPopupLocator = page.getByText(color).nth(1);

        const joyStyle = getComputedStyle(joyPopupLocator.element().closest('[role="tooltip"]') ?? joyPopupLocator.element());
        const hintoricStyle = getComputedStyle(
          hintoricPopupLocator.element().closest('[role="tooltip"]') ?? hintoricPopupLocator.element(),
        );

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
      });
    }
  }
});
