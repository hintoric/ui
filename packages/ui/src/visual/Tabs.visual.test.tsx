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
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

// This file used to compare only background, colour and the type scale on the
// root, and so missed that Joy's TabsRoot has no border-radius at all — ours
// was `rounded-md`, visible in the committed baselines as square Joy corners
// next to rounded Hintoric ones. It also never set `size` on the root test,
// and Joy's root takes `body-${size}` typography, which ours ignored — and
// whose 1.5 line-height Tab and TabPanel inherit at sm/lg, where Tailwind's
// `text-sm`/`text-lg` had put 20px/28px instead of Joy's 21px/27px.
//
// The root itself has no interactive state (no hover, focus or disabled
// styling in Joy's TabsRoot); those belong to Tab and are covered in
// Tab.visual.test.tsx and TabList.visual.test.tsx.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const ORIENTATIONS = ['horizontal', 'vertical'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

type Variant = (typeof VARIANTS)[number];
type Color = (typeof COLORS)[number];
type Orientation = (typeof ORIENTATIONS)[number];
type Size = (typeof SIZES)[number];

// See CLAUDE.md for why the list is the test. `fontFamily` is deliberately
// absent: Joy's stack leads with Inter, `--font-body` in theme.css does not —
// a project-wide difference no visual test compares, not a Tabs gap.
const ROOT_PROPERTIES = [
  'backgroundColor',
  'color',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'borderRadius',
  'boxShadow',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'display',
  'flexDirection',
  'position',
  'width',
  'height',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const;

function pick(element: Element, properties: readonly string[]) {
  const style = getComputedStyle(element) as unknown as Record<string, string>;
  return Object.fromEntries(properties.map((property) => [property, style[property]]));
}

type RootProps = { variant?: Variant; color?: Color; size?: Size; orientation: Orientation };

/** Both Tabs, each in its own 480px parent so `width` means something. */
function renderPair(scheme: 'light' | 'dark', props: RootProps) {
  render(
    <JoyCssVarsProvider defaultMode={scheme}>
      <div style={{ width: 480 }}>
        <JoyTabs defaultValue={0} data-testid="joy-root" {...props}>
          <JoyTabList>
            <JoyTab value={0}>One</JoyTab>
          </JoyTabList>
          <JoyTabPanel value={0}>Panel</JoyTabPanel>
        </JoyTabs>
      </div>
    </JoyCssVarsProvider>,
  );
  render(
    <ColorSchemeProvider defaultMode={scheme}>
      <div style={{ width: 480 }}>
        <HintoricTabs defaultValue={0} data-testid="hintoric-root" {...props}>
          <HintoricTabList>
            <HintoricTab value={0}>One</HintoricTab>
          </HintoricTabList>
          <HintoricTabPanel value={0}>Panel</HintoricTabPanel>
        </HintoricTabs>
      </div>
    </ColorSchemeProvider>,
  );
}

function expectRootsMatch() {
  expect(pick(page.getByTestId('hintoric-root').element(), ROOT_PROPERTIES)).toEqual(
    pick(page.getByTestId('joy-root').element(), ROOT_PROPERTIES),
  );
}

describe('Tabs visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const orientation of ORIENTATIONS) {
      for (const variant of VARIANTS) {
        for (const color of COLORS) {
          it(`a ${orientation} ${variant}/${color} Tabs root matches Joy UI in ${scheme}`, async () => {
            await setColorScheme(scheme);
            renderPair(scheme, { orientation, variant, color });
            // The selected Tab animates into its active background via
            // `transition-colors`, so a screenshot taken straight after mount
            // races the transition and lands on an intermediate colour — 1073
            // pixels of drift between runs, measured 2026-09-07. Settle first.
            await settleTransitions();

            expectRootsMatch();

            await expect(page.getByTestId('joy-root')).toMatchScreenshot(
              `tabs-${orientation}-${variant}-${color}-joy-${scheme}`,
            );
            await expect(page.getByTestId('hintoric-root')).toMatchScreenshot(
              `tabs-${orientation}-${variant}-${color}-hintoric-${scheme}`,
            );
          });
        }
      }

      for (const size of SIZES) {
        it(`a ${orientation} size=${size} Tabs root, its Tab and its TabPanel match Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          renderPair(scheme, { orientation, size });
          await settleTransitions();

          expectRootsMatch();

          const joyRoot = page.getByTestId('joy-root').element();
          const hintoricRoot = page.getByTestId('hintoric-root').element();
          const joyTabStyle = getComputedStyle(joyRoot.querySelector('[role="tab"]')!);
          const hintoricTabStyle = getComputedStyle(hintoricRoot.querySelector('[role="tab"]')!);
          expect(hintoricTabStyle.minHeight).toBe(joyTabStyle.minHeight);
          expect(hintoricTabStyle.fontSize).toBe(joyTabStyle.fontSize);
          expect(hintoricTabStyle.lineHeight).toBe(joyTabStyle.lineHeight);

          const joyPanelStyle = getComputedStyle(joyRoot.querySelector('[role="tabpanel"]')!);
          const hintoricPanelStyle = getComputedStyle(hintoricRoot.querySelector('[role="tabpanel"]')!);
          expect(hintoricPanelStyle.padding).toBe(joyPanelStyle.padding);
          expect(hintoricPanelStyle.fontSize).toBe(joyPanelStyle.fontSize);
          expect(hintoricPanelStyle.lineHeight).toBe(joyPanelStyle.lineHeight);

          await expect(page.getByTestId('joy-root')).toMatchScreenshot(`tabs-${orientation}-size-${size}-joy-${scheme}`);
          await expect(page.getByTestId('hintoric-root')).toMatchScreenshot(
            `tabs-${orientation}-size-${size}-hintoric-${scheme}`,
          );
        });
      }
    }

    it(`switching tabs updates aria-selected and the visible panel, matching Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      const joyUser = userEvent.setup();
      render(
        <JoyCssVarsProvider defaultMode={scheme}>
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
  }
});
