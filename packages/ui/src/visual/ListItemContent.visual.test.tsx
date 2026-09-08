import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListItemContent as JoyListItemContent } from '@mui/joy';
import { ListItemContent as HintoricListItemContent } from '../components/ListItemContent';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('ListItemContent visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's flex layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItemContent data-testid="joy">Label</JoyListItemContent>
        </JoyCssVarsProvider>,
      );
      render(<HintoricListItemContent data-testid="hintoric">Label</HintoricListItemContent>);

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.flexGrow).toBe(joyStyle.flexGrow);
      expect(hintoricStyle.minWidth).toBe(joyStyle.minWidth);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`listitemcontent-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`listitemcontent-hintoric-${scheme}`);
    });
  }
});
