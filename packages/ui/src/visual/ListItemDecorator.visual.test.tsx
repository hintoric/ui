import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListItemDecorator as JoyListItemDecorator } from '@mui/joy';
import { ListItemDecorator as HintoricListItemDecorator } from '../components/ListItemDecorator';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('ListItemDecorator visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's inline-flex layout in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItemDecorator data-testid="joy">
            <svg width="16" height="16" />
          </JoyListItemDecorator>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricListItemDecorator data-testid="hintoric">
          <svg width="16" height="16" />
        </HintoricListItemDecorator>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexShrink).toBe(joyStyle.flexShrink);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`listitemdecorator-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`listitemdecorator-hintoric-${scheme}`);
    });
  }
});
