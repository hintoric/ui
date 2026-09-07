import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Stack as JoyStack } from '@mui/joy';
import { Stack as HintoricStack } from '../components/Stack';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Stack has no variant/color axis — its contract is direction and spacing.
//
// The two implementations reach that contract differently, and the computed
// `gap` is therefore NOT comparable: Joy applies `margin` to the children by
// default and only uses flexbox `gap` when asked (`useFlexGap`, Stack.js:62),
// while ours always uses `gap`. Comparing `gap` reports Joy as `normal`
// against our `16px` for the same visual result.
//
// So this measures the ACHIEVED spacing — the distance between two children's
// boxes — the same way Grid's test measures achieved column widths. That is
// also what a consumer actually sees.
const DIRECTIONS = ['row', 'column'] as const;
const SPACINGS = [0, 1, 2, 3, 4, 5, 6, 8] as const;

/** Distance between the two children's facing edges, along the stack's axis. */
function childGap(container: HTMLElement, direction: 'row' | 'column'): number {
  const [a, b] = Array.from(container.children) as HTMLElement[];
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  return direction === 'row' ? rb.left - ra.right : rb.top - ra.bottom;
}

describe('Stack visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const direction of DIRECTIONS) {
      it(`direction=${direction} matches Joy UI's achieved layout in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyStack data-testid={`joy-${direction}`} direction={direction} spacing={2}>
              <span>A</span>
              <span>B</span>
            </JoyStack>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricStack data-testid={`hintoric-${direction}`} direction={direction} spacing={2}>
              <span>A</span>
              <span>B</span>
            </HintoricStack>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${direction}`);
        const hintoricLocator = page.getByTestId(`hintoric-${direction}`);
        const joyEl = joyLocator.element() as HTMLElement;
        const hintoricEl = hintoricLocator.element() as HTMLElement;

        const joyStyle = getComputedStyle(joyEl);
        const hintoricStyle = getComputedStyle(hintoricEl);

        expect(hintoricStyle.display).toBe(joyStyle.display);
        expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
        expect(childGap(hintoricEl, direction)).toBeCloseTo(childGap(joyEl, direction), 1);

        await expect(joyLocator).toMatchScreenshot(`stack-${direction}-joy-${scheme}`);
        await expect(hintoricLocator).toMatchScreenshot(`stack-${direction}-hintoric-${scheme}`);
      });
    }

    /**
     * Every spacing key, not a sample: the mapping from key to spacing is a
     * lookup table, and a single wrong entry is invisible everywhere except at
     * that one key.
     */
    it(`maps every spacing key to Joy UI's achieved spacing in ${scheme}`, async () => {
      await setColorScheme(scheme);

      for (const spacing of SPACINGS) {
        const joy = render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyStack data-testid="joy-gap" direction="column" spacing={spacing}>
              <span>A</span>
              <span>B</span>
            </JoyStack>
          </JoyCssVarsProvider>,
        );
        const joyGap = childGap(screen.getByTestId('joy-gap'), 'column');
        joy.unmount();

        const ours = render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricStack data-testid="hintoric-gap" direction="column" spacing={spacing}>
              <span>A</span>
              <span>B</span>
            </HintoricStack>
          </ColorSchemeProvider>,
        );
        const hintoricGap = childGap(screen.getByTestId('hintoric-gap'), 'column');
        ours.unmount();

        expect(hintoricGap, `spacing=${spacing}`).toBeCloseTo(joyGap, 1);
      }
    });
  }

  /**
   * The layout-only exception in CLAUDE.md: Stack sets no `bg-*`/`text-*`/
   * `border-*` colour utility, so it paints nothing and "dark must differ from
   * light" is unsatisfiable. The meaningful assertion is the inverse — a
   * scheme flip must not move anything.
   */
  it('lays out identically in both colour schemes', async () => {
    await setColorScheme('light');
    render(
      <ColorSchemeProvider defaultMode="light">
        <HintoricStack data-testid="scheme-stack" direction="row" spacing={3}>
          <span>A</span>
          <span>B</span>
        </HintoricStack>
      </ColorSchemeProvider>,
    );

    const el = screen.getByTestId('scheme-stack');
    const read = () => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return [s.display, s.flexDirection, s.gap, r.width, r.height].join('|');
    };

    const light = read();
    await setColorScheme('dark');

    expect(read()).toBe(light);
  });
});
