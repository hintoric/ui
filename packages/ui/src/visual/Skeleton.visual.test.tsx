import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Skeleton as JoySkeleton } from '@mui/joy';
import { Skeleton as HintoricSkeleton } from '../components/Skeleton';

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
});
