import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  List as JoyList,
  ListItem as JoyListItem,
} from '@mui/joy';
import { List as HintoricList } from '../components/List';
import { ListItem as HintoricListItem } from '../components/ListItem';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Composed inside a real List rather than a hand-built wrapper: ListItem reads
// the list's CSS variables for its padding and min-height, so a hand-made
// parent would verify it against spacing the real List never provides. That is
// the structural finding of the 2026-09-06 coverage audit.
//
// ListItem has no variant/colour axis — it is the non-interactive row, and its
// contract is layout plus inherited text. `ListItemButton` is the interactive
// sibling and has its own file.
describe('ListItem visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`matches Joy UI's computed styles in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 320 }}>
            <JoyList>
              <JoyListItem data-testid="joy-item">Item</JoyListItem>
            </JoyList>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 320 }}>
            <HintoricList>
              <HintoricListItem data-testid="hintoric-item">Item</HintoricListItem>
            </HintoricList>
          </div>
        </ColorSchemeProvider>,
      );

      const joyLocator = page.getByTestId('joy-item');
      const hintoricLocator = page.getByTestId('hintoric-item');
      const joyEl = joyLocator.element();
      const hintoricEl = hintoricLocator.element();

      const joyStyle = getComputedStyle(joyEl);
      const hintoricStyle = getComputedStyle(hintoricEl);

      expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
      expect(hintoricStyle.color).toBe(joyStyle.color);
      expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
      // A row must span its list, not shrink to its text — P2 of the audit.
      expect(hintoricEl.getBoundingClientRect().width).toBeCloseTo(
        joyEl.getBoundingClientRect().width,
        1,
      );

      await expect(joyLocator).toMatchScreenshot(`listitem-joy-${scheme}`);
      await expect(hintoricLocator).toMatchScreenshot(`listitem-hintoric-${scheme}`);
    });

    /**
     * The row is not a button: if it ever became clickable-looking, a list of
     * static rows would invite clicks that do nothing.
     */
    it(`stays a non-interactive row in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricList>
            <HintoricListItem data-testid="static-item">Item</HintoricListItem>
          </HintoricList>
        </ColorSchemeProvider>,
      );

      const style = getComputedStyle(page.getByTestId('static-item').element());
      expect(style.cursor).not.toBe('pointer');
    });
  }
});
