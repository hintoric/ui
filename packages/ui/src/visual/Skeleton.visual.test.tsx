import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Skeleton as JoySkeleton } from '@mui/joy';
import { Skeleton as HintoricSkeleton } from '../components/Skeleton';
import { setColorScheme } from './helpers';

const VARIANTS = ['text', 'circular', 'rectangular'] as const;

// No color/variant (in the Joy-color sense) axis — tests its actual
// supported states (shape variants), per CLAUDE.md's allowance.
describe('Skeleton visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    it(`variant=${variant} matches Joy UI's computed shape`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoySkeleton data-testid={`joy-${variant}`} variant={variant} width={80} height={40} />
        </JoyCssVarsProvider>,
      );
      render(<HintoricSkeleton data-testid={`hintoric-${variant}`} variant={variant} width={80} height={40} />);

      const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}`).element());

      expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);

      await expect(page.getByTestId(`joy-${variant}`)).toMatchScreenshot(`skeleton-${variant}-joy`);
      await expect(page.getByTestId(`hintoric-${variant}`)).toMatchScreenshot(`skeleton-${variant}-hintoric`);
    });
  }

  // Regression test: Skeleton used to hardcode `bg-neutral-200`, a raw
  // palette step with no dark-mode value, instead of a scheme-aware surface
  // token — it stayed light-colored in dark mode. Asserting backgroundColor
  // equality against real Joy in both schemes is the signal that would have
  // caught it (and confirms the fix targets the right shade, not just any
  // scheme-aware one: Joy's Skeleton paints `background.level3`, which is
  // `--color-surface-3`/neutral-600 in this palette, not `surface-2`).
  //
  // animation={false} on both sides: with the default `pulse` animation Joy
  // paints the background on its `::before` pseudo-element instead of the
  // root (so the pulse can fade against a solid backdrop), while ours always
  // paints the root directly — animation-free is the one configuration where
  // both put the background on the same (root) element, making
  // `backgroundColor` a fair, direct comparison of the underlying token.
  for (const scheme of ['light', 'dark'] as const) {
    it(`matches Joy UI's computed background color in ${scheme} mode`, async () => {
      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoySkeleton data-testid={`joy-${scheme}`} variant="rectangular" width={80} height={40} animation={false} />
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricSkeleton
          data-testid={`hintoric-${scheme}`}
          variant="rectangular"
          width={80}
          height={40}
          animation={false}
        />,
      );
      await setColorScheme(scheme);

      const joyStyle = getComputedStyle(page.getByTestId(`joy-${scheme}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${scheme}`).element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);

      await expect(page.getByTestId(`joy-${scheme}`)).toMatchScreenshot(`skeleton-${scheme}-joy`);
      await expect(page.getByTestId(`hintoric-${scheme}`)).toMatchScreenshot(`skeleton-${scheme}-hintoric`);
    });
  }
});
