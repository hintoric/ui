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

// Composed inside a real Tabs rather than a hand-built parent: TabList reads
// context from Tabs for its selected state, so a stand-in parent would verify
// it against state the real Tabs never provides. That is the structural
// finding of the 2026-09-06 coverage audit.
//
// TabList is the strip that holds the tabs — a surface, so its background
// is the property that matters most.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('TabList visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyTabs defaultValue={0}>
                <JoyTabList variant={variant} color={color} data-testid={`joy-${variant}-${color}`}>
                  <JoyTab value={0}>One</JoyTab>
                </JoyTabList>
                <JoyTabPanel value={0}>Panel</JoyTabPanel>
              </JoyTabs>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricTabs defaultValue={0}>
                <HintoricTabList variant={variant} color={color} data-testid={`hintoric-${variant}-${color}`}>
                  <HintoricTab value={0}>One</HintoricTab>
                </HintoricTabList>
                <HintoricTabPanel value={0}>Panel</HintoricTabPanel>
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
            `tablist-${variant}-${color}-joy-${scheme}`,
          );
          await expect(hintoricLocator).toMatchScreenshot(
            `tablist-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }
  }
});
