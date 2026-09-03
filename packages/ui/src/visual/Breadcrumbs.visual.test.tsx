import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Breadcrumbs as JoyBreadcrumbs, Link as JoyLink } from '@mui/joy';
import { Breadcrumbs as HintoricBreadcrumbs } from '../components/Breadcrumbs';

const SIZES = ['sm', 'md', 'lg'] as const;

// No color/variant axis of its own — tests its actual supported states
// (sizes), per CLAUDE.md's allowance for components without that axis.
describe('Breadcrumbs visual parity with @mui/joy', () => {
  for (const size of SIZES) {
    it(`size=${size} matches Joy UI's computed styles`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyBreadcrumbs data-testid={`joy-${size}`} size={size}>
            <JoyLink href="/">Home</JoyLink>
            <span>Button</span>
          </JoyBreadcrumbs>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricBreadcrumbs data-testid={`hintoric-${size}`} size={size}>
          <a href="/">Home</a>
          <span>Button</span>
        </HintoricBreadcrumbs>,
      );

      const joyStyle = getComputedStyle(page.getByTestId(`joy-${size}`).element());
      const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${size}`).element());

      expect(hintoricStyle.padding).toBe(joyStyle.padding);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);

      await expect(page.getByTestId(`joy-${size}`)).toMatchScreenshot(`breadcrumbs-${size}-joy`);
      await expect(page.getByTestId(`hintoric-${size}`)).toMatchScreenshot(`breadcrumbs-${size}-hintoric`);
    });
  }
});
