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

// Composed inside a real Tabs rather than a hand-built parent: TabPanel reads
// context from Tabs for its selected state, so a stand-in parent would verify
// it against state the real Tabs never provides. That is the structural
// finding of the 2026-09-06 coverage audit.
//
// TabPanel is the content surface below the strip. It only has a box to
// measure while its value is the selected one, hence `defaultValue={0}`
// matching the panel and tab values.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('TabPanel visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyTabs defaultValue={0}>
                <JoyTabList>
                  <JoyTab value={0}>One</JoyTab>
                </JoyTabList>
                <JoyTabPanel value={0} variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>Panel</JoyTabPanel>
              </JoyTabs>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricTabs defaultValue={0}>
                <HintoricTabList>
                  <HintoricTab value={0}>One</HintoricTab>
                </HintoricTabList>
                <HintoricTabPanel value={0} variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>Panel</HintoricTabPanel>
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
            `tabpanel-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `tabpanel-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }
  }
});
