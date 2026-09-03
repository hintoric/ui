import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Tabs visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`Tabs root ${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyTabs variant={variant} color={color} defaultValue={0} data-testid={`joy-${variant}-${color}`}>
              <JoyTabList>
                <JoyTab value={0}>One</JoyTab>
              </JoyTabList>
              <JoyTabPanel value={0}>Panel</JoyTabPanel>
            </JoyTabs>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricTabs variant={variant} color={color} defaultValue={0} data-testid={`hintoric-${variant}-${color}`}>
            <HintoricTabList>
              <HintoricTab value={0}>One</HintoricTab>
            </HintoricTabList>
            <HintoricTabPanel value={0}>Panel</HintoricTabPanel>
          </HintoricTabs>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`tabs-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`tabs-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed Tab height and TabPanel padding`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyTabs size={size} defaultValue={0}>
            <JoyTabList>
              <JoyTab value={0} data-testid={`joy-tab-${size}`}>
                One
              </JoyTab>
            </JoyTabList>
            <JoyTabPanel value={0} data-testid={`joy-panel-${size}`}>
              Panel
            </JoyTabPanel>
          </JoyTabs>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricTabs size={size} defaultValue={0}>
          <HintoricTabList>
            <HintoricTab value={0} data-testid={`hintoric-tab-${size}`}>
              One
            </HintoricTab>
          </HintoricTabList>
          <HintoricTabPanel value={0} data-testid={`hintoric-panel-${size}`}>
            Panel
          </HintoricTabPanel>
        </HintoricTabs>,
      );

      const joyTabStyle = getComputedStyle(page.getByTestId(`joy-tab-${size}`).element());
      const hintoricTabStyle = getComputedStyle(page.getByTestId(`hintoric-tab-${size}`).element());
      expect(hintoricTabStyle.minHeight).toBe(joyTabStyle.minHeight);
      expect(hintoricTabStyle.fontSize).toBe(joyTabStyle.fontSize);

      const joyPanelStyle = getComputedStyle(page.getByTestId(`joy-panel-${size}`).element());
      const hintoricPanelStyle = getComputedStyle(page.getByTestId(`hintoric-panel-${size}`).element());
      expect(hintoricPanelStyle.padding).toBe(joyPanelStyle.padding);
      expect(hintoricPanelStyle.fontSize).toBe(joyPanelStyle.fontSize);
    });
  }

  it('switching tabs updates aria-selected and the visible panel, matching Joy UI', async () => {
    const joyUser = userEvent.setup();
    render(
      <JoyCssVarsProvider>
        <JoyTabs defaultValue={0}>
          <JoyTabList>
            <JoyTab value={0}>One</JoyTab>
            <JoyTab value={1}>Two</JoyTab>
          </JoyTabList>
          <JoyTabPanel value={0}>Panel one</JoyTabPanel>
          <JoyTabPanel value={1}>Panel two</JoyTabPanel>
        </JoyTabs>
      </JoyCssVarsProvider>,
    );
    const joyTabTwo = page.getByRole('tab', { name: 'Two' }).nth(0);
    await joyUser.click(joyTabTwo.element());

    const hintoricUser = userEvent.setup();
    render(
      <HintoricTabs defaultValue={0}>
        <HintoricTabList>
          <HintoricTab value={0}>One</HintoricTab>
          <HintoricTab value={1}>Two</HintoricTab>
        </HintoricTabList>
        <HintoricTabPanel value={0}>Panel one</HintoricTabPanel>
        <HintoricTabPanel value={1}>Panel two</HintoricTabPanel>
      </HintoricTabs>,
    );
    const hintoricTabTwo = page.getByRole('tab', { name: 'Two' }).nth(1);
    await hintoricUser.click(hintoricTabTwo.element());

    expect(joyTabTwo.element().getAttribute('aria-selected')).toBe('true');
    expect(hintoricTabTwo.element().getAttribute('aria-selected')).toBe('true');

    expect(page.getByText('Panel two').nth(0).element()).toBeTruthy();
    expect(page.getByText('Panel two').nth(1).element()).toBeTruthy();
  });
});
