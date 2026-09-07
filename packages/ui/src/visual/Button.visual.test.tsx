import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Button as JoyButton } from '@mui/joy';
import { Button as HintoricButton } from '../components/Button';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Button visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyButton data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </JoyButton>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider>
            <HintoricButton data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
              {color}
            </HintoricButton>
          </ColorSchemeProvider>,
        );

        const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
        const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

        const joyStyle = getComputedStyle(joyLocator.element());
        const hintoricStyle = getComputedStyle(hintoricLocator.element());

        // The actual pass/fail: exact computed CSS values must match. Two
        // different styling engines (Emotion vs Tailwind utilities) can and
        // do produce byte-identical computed styles when they encode the
        // same underlying values — that's the whole point of this check.
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
        expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
        expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
        expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

        // Real, committed screenshots via Vitest's own visual regression
        // feature — for humans to review, not the pass/fail signal above.
        await expect(joyLocator).toMatchScreenshot(`button-${variant}-${color}-joy`);
        await expect(hintoricLocator).toMatchScreenshot(`button-${variant}-${color}-hintoric`);
      });
    }
  }

  // The coverage hole that let the loading label show through: Button had a
  // `loading` prop, a jsdom test that it disables clicks, and no visual test at
  // all. Joy hides the label by putting `color: transparent` AFTER its variant
  // styles ("this has to come after the variant styles to take effect", its own
  // Button.js comment) — a Tailwind `text-transparent` cannot win that on order
  // alone, because `disabled:text-*` outranks it on specificity and Button
  // always disables itself while loading.
  for (const color of COLORS) {
    it(`loading/solid/${color} hides its label the way Joy UI does`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyButton data-testid={`joy-loading-${color}`} variant="solid" color={color} loading>
            {color}
          </JoyButton>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider>
          <HintoricButton data-testid={`hintoric-loading-${color}`} variant="solid" color={color} loading>
            {color}
          </HintoricButton>
        </ColorSchemeProvider>,
      );
      await settleTransitions();

      const joyStyle = getComputedStyle(page.getByTestId(`joy-loading-${color}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-loading-${color}`).element());

      expect(joyStyle.color).toBe('rgba(0, 0, 0, 0)');
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);

      // Making the root transparent is only half of it: Joy re-colours its
      // indicator explicitly (`theme.variants[variant+'Disabled'][color].color`,
      // since a loading button is always disabled), because an indicator drawn
      // in `currentColor` would otherwise inherit the transparency and vanish.
      const joyIndicator = page
        .getByTestId(`joy-loading-${color}`)
        .element()
        .querySelector('.MuiButton-loadingIndicatorCenter') as HTMLElement;
      const hintoricIndicator = page
        .getByTestId(`hintoric-loading-${color}`)
        .element()
        .querySelector('span[aria-hidden="true"]') as HTMLElement;
      expect(joyIndicator).toBeTruthy();
      expect(hintoricIndicator).toBeTruthy();
      expect(getComputedStyle(joyIndicator).color).not.toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(hintoricIndicator).color).toBe(getComputedStyle(joyIndicator).color);

      // The indicator shapes still differ by construction — Joy renders a
      // CircularProgress, ours is a CSS border spinner — so the screenshots are
      // for a human to compare, not a pass/fail signal.
      await expect(page.getByTestId(`joy-loading-${color}`)).toMatchScreenshot(`button-loading-solid-${color}-joy`);
      await expect(page.getByTestId(`hintoric-loading-${color}`)).toMatchScreenshot(
        `button-loading-solid-${color}-hintoric`,
      );
    });
  }

  it('shows the same focus-visible outline as Joy UI (generic theme.focus.default, not Input\'s inset ring)', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyButton data-testid="joy-focus">focus me</JoyButton>
      </JoyCssVarsProvider>,
    );
    render(
      <ColorSchemeProvider>
        <HintoricButton data-testid="hintoric-focus">focus me</HintoricButton>
      </ColorSchemeProvider>,
    );

    const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
    const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

    joyEl.focus();
    await settleTransitions();
    const joyOutline = getComputedStyle(joyEl).outline;
    const joyOutlineOffset = getComputedStyle(joyEl).outlineOffset;
    joyEl.blur();

    hintoricEl.focus();
    await settleTransitions();
    const hintoricOutline = getComputedStyle(hintoricEl).outline;
    const hintoricOutlineOffset = getComputedStyle(hintoricEl).outlineOffset;
    hintoricEl.blur();

    expect(hintoricOutline).toBe(joyOutline);
    expect(hintoricOutlineOffset).toBe(joyOutlineOffset);
  });
});
