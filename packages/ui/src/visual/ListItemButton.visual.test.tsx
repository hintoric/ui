import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListItemButton as JoyListItemButton } from '@mui/joy';
import { ListItemButton as HintoricListItemButton } from '../components/ListItemButton';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

describe('ListItemButton visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`defaults to plain/neutral when unselected in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItemButton data-testid="joy">Item</JoyListItemButton>
        </JoyCssVarsProvider>,
      );
      render(<HintoricListItemButton data-testid="hintoric">Item</HintoricListItemButton>);

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`listitembutton-plain-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`listitembutton-plain-hintoric-${scheme}`);
    });

    it(`keeps plain/neutral when selected, applying the persistent active background in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItemButton data-testid="joy-sel" selected>
            Item
          </JoyListItemButton>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricListItemButton data-testid="hintoric-sel" selected>
          Item
        </HintoricListItemButton>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy-sel').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-sel').element());

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.color).toBe(joyStyle.color);

      await expect(page.getByTestId('joy-sel')).toMatchScreenshot(`listitembutton-selected-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-sel')).toMatchScreenshot(`listitembutton-selected-hintoric-${scheme}`);
    });

    it(`shows the same focus-visible outline as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyListItemButton data-testid="joy-focus">Item</JoyListItemButton>
        </JoyCssVarsProvider>,
      );
      render(<HintoricListItemButton data-testid="hintoric-focus">Item</HintoricListItemButton>);

      const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
      const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

      joyEl.focus();
      await settleTransitions();
      const joyOutline = getComputedStyle(joyEl).outline;
      joyEl.blur();

      hintoricEl.focus();
      await settleTransitions();
      const hintoricOutline = getComputedStyle(hintoricEl).outline;
      hintoricEl.blur();

      expect(hintoricOutline).toBe(joyOutline);
    });
  }
});
