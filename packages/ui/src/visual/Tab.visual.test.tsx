import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Tabs as JoyTabs,
  TabList as JoyTabList,
  Tab as JoyTab,
  TabPanel as JoyTabPanel,
} from '@mui/joy';
import { Tabs as HintoricTabs } from '../components/Tabs';
import { TabList as HintoricTabList } from '../components/TabList';
import { Tab as HintoricTab } from '../components/Tab';
import { TabPanel as HintoricTabPanel } from '../components/TabPanel';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Composed inside a real Tabs rather than a hand-built parent: Tab reads
// context from Tabs for its selected state, so a stand-in parent would verify
// it against state the real Tabs never provides. That is the structural
// finding of the 2026-09-06 coverage audit.
//
// Tab is the interactive trigger. Its variant/colour are its own props, and
// the raster is read off a RESTING (unselected) tab — `defaultValue={1}`
// selects the sibling — because the selected state is a separate question
// with its own assertion at the bottom of this file.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Tab visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyTabs defaultValue={1}>
                <JoyTabList>
                  <JoyTab value={0} variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>One</JoyTab>
                  <JoyTab value={1}>Two</JoyTab>
                </JoyTabList>
                <JoyTabPanel value={1}>Panel</JoyTabPanel>
              </JoyTabs>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricTabs defaultValue={1}>
                <HintoricTabList>
                  <HintoricTab value={0} variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>One</HintoricTab>
                  <HintoricTab value={1}>Two</HintoricTab>
                </HintoricTabList>
                <HintoricTabPanel value={1}>Panel</HintoricTabPanel>
              </HintoricTabs>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

          await expect(joyLocator).toMatchScreenshot(
            `tab-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `tab-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }
  }

  /**
   * Whether a selected Tab carries a background of its own is the one thing
   * about this component that is easy to get wrong in either direction, and
   * Tab.tsx currently documents Joy as giving it none — "only the indicator
   * underline marks the active tab". This asserts that claim against the real
   * package rather than trusting the comment: Joy's Tab is built on
   * StyledListItemButton, which does react to `aria-selected`.
   */
  for (const scheme of COLOR_SCHEMES) {
    it(`treats the selected tab's background the same way Joy UI does in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyTabs defaultValue={0}>
            <JoyTabList>
              <JoyTab value={0} data-testid="joy-selected">One</JoyTab>
              <JoyTab value={1} data-testid="joy-resting">Two</JoyTab>
            </JoyTabList>
            <JoyTabPanel value={0}>Panel</JoyTabPanel>
          </JoyTabs>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricTabs defaultValue={0}>
            <HintoricTabList>
              <HintoricTab value={0} data-testid="hintoric-selected">One</HintoricTab>
              <HintoricTab value={1} data-testid="hintoric-resting">Two</HintoricTab>
            </HintoricTabList>
            <HintoricTabPanel value={0}>Panel</HintoricTabPanel>
          </HintoricTabs>
        </ColorSchemeProvider>,
      );

      const joySelected = getComputedStyle(page.getByTestId('joy-selected').element());
      const joyResting = getComputedStyle(page.getByTestId('joy-resting').element());
      const ourSelected = getComputedStyle(page.getByTestId('hintoric-selected').element());
      const ourResting = getComputedStyle(page.getByTestId('hintoric-resting').element());

      // Does Joy shift the background on selection? Mirror whatever it does.
      const joyShifts = joySelected.backgroundColor !== joyResting.backgroundColor;
      const weShift = ourSelected.backgroundColor !== ourResting.backgroundColor;

      expect(weShift, `Joy shifts: ${joyShifts}`).toBe(joyShifts);
      expect(ourSelected.backgroundColor).toBe(joySelected.backgroundColor);
    });
  }

});
