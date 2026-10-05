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
import { COLOR_SCHEMES, lastShadowLayer, setColorScheme, settleTransitions } from './helpers';

// Composed inside a real Tabs rather than a hand-built parent: TabList reads
// context from Tabs for its selected state, so a stand-in parent would verify
// it against state the real Tabs never provides. That is the structural
// finding of the 2026-09-06 coverage audit.
//
// This file used to compare only background, colour and the type scale, and
// three differences from Joy went unnoticed through all of it: the missing
// default underline (`pb-px` + an inset divider), a `gap-1` where Joy's
// `--List-gap` is 0, and an indicator coloured by the strip where Joy's
// `::after` takes the selected tab's `currentColor` — drawn on the left of a
// vertical list where Joy draws it on the right.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

type Variant = (typeof VARIANTS)[number];
type Color = (typeof COLORS)[number];
type Orientation = (typeof ORIENTATIONS)[number];

// See CLAUDE.md for why the list is the test.
const STRIP_PROPERTIES = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderRadius',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'display',
  'flexDirection',
  'width',
  'height',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'columnGap',
  'rowGap',
  'position',
  'zIndex',
] as const;

const TAB_PROPERTIES = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderRadius',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'minHeight',
  'height',
  'width',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'display',
  'justifyContent',
  'cursor',
  'columnGap',
] as const;

function pick(element: Element, properties: readonly string[]) {
  const style = getComputedStyle(element) as unknown as Record<string, string>;
  return Object.fromEntries(properties.map((property) => [property, style[property]]));
}

type Look = { variant?: Variant; color?: Color };

/**
 * Both Tabs, each in its own 480px parent (the fixed-width parent CLAUDE.md
 * asks for, so `width` means something), with tab "b" selected and "a" not.
 */
function renderPair(scheme: 'light' | 'dark', orientation: Orientation, strip: Look, tab: Look) {
  render(
    <JoyCssVarsProvider defaultMode={scheme}>
      <div style={{ width: 480 }}>
        <JoyTabs defaultValue="b" orientation={orientation}>
          <JoyTabList data-testid="joy-strip" variant={strip.variant} color={strip.color}>
            <JoyTab value="a" data-testid="joy-a" variant={tab.variant} color={tab.color}>
              One
            </JoyTab>
            <JoyTab value="b" data-testid="joy-b" variant={tab.variant} color={tab.color}>
              Two
            </JoyTab>
          </JoyTabList>
          <JoyTabPanel value="a">Panel one</JoyTabPanel>
          <JoyTabPanel value="b">Panel two</JoyTabPanel>
        </JoyTabs>
      </div>
    </JoyCssVarsProvider>,
  );
  render(
    <ColorSchemeProvider defaultMode={scheme}>
      <div style={{ width: 480 }}>
        <HintoricTabs defaultValue="b" orientation={orientation}>
          <HintoricTabList data-testid="hintoric-strip" variant={strip.variant} color={strip.color}>
            <HintoricTab value="a" data-testid="hintoric-a" variant={tab.variant} color={tab.color}>
              One
            </HintoricTab>
            <HintoricTab value="b" data-testid="hintoric-b" variant={tab.variant} color={tab.color}>
              Two
            </HintoricTab>
          </HintoricTabList>
          <HintoricTabPanel value="a">Panel one</HintoricTabPanel>
          <HintoricTabPanel value="b">Panel two</HintoricTabPanel>
        </HintoricTabs>
      </div>
    </ColorSchemeProvider>,
  );
}

/**
 * Joy draws its indicator as the selected tab's `::after`; ours is one Base UI
 * Tabs.Indicator under the strip that slides. Different mechanisms, so what
 * is compared is the drawn result: colour, radius, and its four edges relative
 * to the selected tab's border box.
 *
 * Joy's `::after` is positioned against the tab's padding box, and for an
 * absolutely positioned box getComputedStyle resolves all four offsets to
 * pixels — so its edges are those offsets plus the tab's border widths.
 *
 * Edges are rounded to 1/100px: getComputedStyle serialises a length to four
 * decimals (a vertical `::after`'s `left` reads 63.8906 where the rect says
 * 63.890625), so an exact comparison fails on the serialisation alone.
 */
const px = (value: number) => Math.round(value * 100) / 100;

function indicators() {
  const joyTab = page.getByTestId('joy-b').element();
  const joyStyle = getComputedStyle(joyTab);
  const after = getComputedStyle(joyTab, '::after');
  const joyBox = joyTab.getBoundingClientRect();

  const ourTab = page.getByTestId('hintoric-b').element();
  const ourBox = ourTab.getBoundingClientRect();
  const indicator = page.getByTestId('hintoric-strip').element().lastElementChild!;
  const ourStyle = getComputedStyle(indicator);
  const indicatorBox = indicator.getBoundingClientRect();

  return {
    joy: {
      backgroundColor: after.backgroundColor,
      borderRadius: after.borderRadius,
      left: px(parseFloat(joyStyle.borderLeftWidth) + parseFloat(after.left)),
      right: px(joyBox.width - parseFloat(joyStyle.borderRightWidth) - parseFloat(after.right)),
      top: px(parseFloat(joyStyle.borderTopWidth) + parseFloat(after.top)),
      bottom: px(joyBox.height - parseFloat(joyStyle.borderBottomWidth) - parseFloat(after.bottom)),
    },
    ours: {
      backgroundColor: ourStyle.backgroundColor,
      borderRadius: ourStyle.borderRadius,
      left: px(indicatorBox.left - ourBox.left),
      right: px(indicatorBox.right - ourBox.left),
      top: px(indicatorBox.top - ourBox.top),
      bottom: px(indicatorBox.bottom - ourBox.top),
    },
  };
}

function expectStripAndTabsMatch() {
  const joyStrip = page.getByTestId('joy-strip').element();
  const ourStrip = page.getByTestId('hintoric-strip').element();
  expect(pick(ourStrip, STRIP_PROPERTIES)).toEqual(pick(joyStrip, STRIP_PROPERTIES));
  // Joy TabList's default underline is an inset box-shadow on the
  // underline side.
  expect(lastShadowLayer(getComputedStyle(ourStrip).boxShadow)).toBe(
    lastShadowLayer(getComputedStyle(joyStrip).boxShadow),
  );
  for (const tab of ['a', 'b']) {
    expect(pick(page.getByTestId(`hintoric-${tab}`).element(), TAB_PROPERTIES)).toEqual(
      pick(page.getByTestId(`joy-${tab}`).element(), TAB_PROPERTIES),
    );
  }
  const { joy, ours } = indicators();
  expect(ours).toEqual(joy);
}

describe('TabList visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const orientation of ORIENTATIONS) {
      for (const variant of VARIANTS) {
        for (const color of COLORS) {
          // The indicator stays the plain/neutral tab's colour here, whatever
          // the strip's — Joy's `::after` is the tab's `currentColor`.
          it(`a ${orientation} ${variant}/${color} strip matches Joy UI in ${scheme}`, async () => {
            await setColorScheme(scheme);
            renderPair(scheme, orientation, { variant, color }, {});
            await settleTransitions();

            expectStripAndTabsMatch();

            await expect(page.getByTestId('joy-strip')).toMatchScreenshot(
              `tablist-${orientation}-strip-${variant}-${color}-joy-${scheme}`,
            );
            await expect(page.getByTestId('hintoric-strip')).toMatchScreenshot(
              `tablist-${orientation}-strip-${variant}-${color}-hintoric-${scheme}`,
            );
          });

          it(`the indicator of a selected ${orientation} ${variant}/${color} tab matches Joy UI in ${scheme}`, async () => {
            await setColorScheme(scheme);
            renderPair(scheme, orientation, {}, { variant, color });
            await settleTransitions();

            expectStripAndTabsMatch();

            await expect(page.getByTestId('joy-strip')).toMatchScreenshot(
              `tablist-${orientation}-tab-${variant}-${color}-joy-${scheme}`,
            );
            await expect(page.getByTestId('hintoric-strip')).toMatchScreenshot(
              `tablist-${orientation}-tab-${variant}-${color}-hintoric-${scheme}`,
            );
          });
        }
      }
    }
  }
});
