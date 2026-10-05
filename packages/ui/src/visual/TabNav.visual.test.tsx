import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  Tabs as JoyTabs,
  TabList as JoyTabList,
  Tab as JoyTab,
} from '@mui/joy';
import { TabNav as HintoricTabNav } from '../components/TabNav';
import { Tab as HintoricTab } from '../components/Tab';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, lastShadowLayer, setColorScheme, settleTransitions } from './helpers';

// TabNav has no Joy component of its own, but Joy's answer to the same need —
// `<Tab component="a" href>` inside `Tabs`/`TabList` — is the oracle for its
// look. TabNav deliberately differs from it in ARIA only (a `nav` of links
// with `aria-current`, not a tablist of links; see TabNav.tsx), and ARIA
// paints nothing, so every computed style must still match.
//
// Joy's side therefore renders links too: an `<a>` and a `<button>` differ in
// UA defaults (text-decoration, cursor), and comparing our link against Joy's
// button would hide exactly the link-only properties.
const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// The properties that make up a tab's look, including the type scale and the
// box — see CLAUDE.md for why the list is the test.
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
  'cursor',
  'textDecorationLine',
  'columnGap',
] as const;

const STRIP_PROPERTIES = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderRadius',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'display',
  'width',
  'height',
  'paddingBottom',
  'columnGap',
] as const;

function pick(element: Element, properties: readonly string[], pseudo?: string) {
  const style = getComputedStyle(element, pseudo) as unknown as Record<string, string>;
  return Object.fromEntries(properties.map((property) => [property, style[property]]));
}

type Strip = { variant?: (typeof VARIANTS)[number]; color?: (typeof COLORS)[number] };
type TabLook = Strip & { disabled?: boolean };

/**
 * Both navs, each in its own 480px parent (the fixed-width parent CLAUDE.md
 * asks for, so `width` means something), with "/b" current and "/a" not.
 */
function renderPair(scheme: 'light' | 'dark', strip: Strip, tab: TabLook) {
  render(
    <JoyCssVarsProvider defaultMode={scheme}>
      <div style={{ width: 480 }}>
        <JoyTabs value="/b">
          <JoyTabList data-testid="joy-strip" variant={strip.variant} color={strip.color}>
            <JoyTab
              component="a"
              href="#a"
              value="/a"
              data-testid="joy-a"
              variant={tab.variant}
              color={tab.color}
              disabled={tab.disabled}
            >
              One
            </JoyTab>
            <JoyTab component="a" href="#b" value="/b" data-testid="joy-b" variant={tab.variant} color={tab.color}>
              Two
            </JoyTab>
          </JoyTabList>
        </JoyTabs>
      </div>
    </JoyCssVarsProvider>,
  );
  render(
    <ColorSchemeProvider defaultMode={scheme}>
      <div style={{ width: 480 }}>
        <HintoricTabNav data-testid="hintoric-strip" value="/b" variant={strip.variant} color={strip.color}>
          <HintoricTab
            href="#a"
            value="/a"
            data-testid="hintoric-a"
            variant={tab.variant}
            color={tab.color}
            disabled={tab.disabled}
          >
            One
          </HintoricTab>
          <HintoricTab href="#b" value="/b" data-testid="hintoric-b" variant={tab.variant} color={tab.color}>
            Two
          </HintoricTab>
        </HintoricTabNav>
      </div>
    </ColorSchemeProvider>,
  );
}

describe('TabNav visual parity with @mui/joy Tabs-as-links', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`a ${variant}/${color} tab matches Joy UI resting and current in ${scheme}`, async () => {
          await setColorScheme(scheme);
          renderPair(scheme, {}, { variant, color });

          const joyResting = page.getByTestId('joy-a');
          const ourResting = page.getByTestId('hintoric-a');
          expect(pick(ourResting.element(), TAB_PROPERTIES)).toEqual(pick(joyResting.element(), TAB_PROPERTIES));
          expect(pick(page.getByTestId('hintoric-b').element(), TAB_PROPERTIES)).toEqual(
            pick(page.getByTestId('joy-b').element(), TAB_PROPERTIES),
          );

          await expect(page.getByTestId('joy-strip')).toMatchScreenshot(`tabnav-tab-${variant}-${color}-joy-${scheme}`);
          await expect(page.getByTestId('hintoric-strip')).toMatchScreenshot(
            `tabnav-tab-${variant}-${color}-hintoric-${scheme}`,
          );
        });

        it(`a ${variant}/${color} strip matches Joy UI's TabList in ${scheme}`, async () => {
          await setColorScheme(scheme);
          renderPair(scheme, { variant, color }, {});

          const joyStrip = page.getByTestId('joy-strip').element();
          const ourStrip = page.getByTestId('hintoric-strip').element();
          expect(pick(ourStrip, STRIP_PROPERTIES)).toEqual(pick(joyStrip, STRIP_PROPERTIES));
          // Joy TabList's default underline is an inset box-shadow.
          expect(lastShadowLayer(getComputedStyle(ourStrip).boxShadow)).toBe(
            lastShadowLayer(getComputedStyle(joyStrip).boxShadow),
          );
          // The indicator takes the current tab's colour, not the strip's —
          // Joy's `::after` is `currentColor` of the tab.
          const indicator = ourStrip.querySelector('[data-tab-nav-indicator]')!;
          expect(getComputedStyle(indicator).backgroundColor).toBe(
            getComputedStyle(page.getByTestId('joy-b').element(), '::after').backgroundColor,
          );

          await expect(page.getByTestId('joy-strip')).toMatchScreenshot(
            `tabnav-strip-${variant}-${color}-joy-${scheme}`,
          );
          await expect(page.getByTestId('hintoric-strip')).toMatchScreenshot(
            `tabnav-strip-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }

    /**
     * Joy draws its indicator as the current tab's `::after`; ours is one
     * element under the nav that slides. Different mechanisms, so what is
     * compared is the drawn result: thickness, colour, and that it spans the
     * current tab's box and sits on its bottom edge.
     */
    it(`draws the indicator where and how Joy UI does in ${scheme}`, async () => {
      await setColorScheme(scheme);
      renderPair(scheme, {}, {});
      await settleTransitions();

      const joyTab = page.getByTestId('joy-b').element();
      const after = getComputedStyle(joyTab, '::after');
      const joyBox = joyTab.getBoundingClientRect();
      const ourTab = page.getByTestId('hintoric-b').element();
      const ourBox = ourTab.getBoundingClientRect();
      const indicator = page.getByTestId('hintoric-strip').element().querySelector('[data-tab-nav-indicator]')!;
      const ourIndicator = getComputedStyle(indicator);
      const indicatorBox = indicator.getBoundingClientRect();

      expect(ourIndicator.height).toBe(after.height);
      expect(ourIndicator.backgroundColor).toBe(after.backgroundColor);
      expect(ourIndicator.borderRadius).toBe(after.borderRadius);
      // Joy's ::after is positioned against the tab's padding box (left/right
      // `--unstable_offset`, bottom `-1px - underline`), so its drawn edges are
      // derived from the computed offsets plus the tab's border widths.
      const joyStyle = getComputedStyle(joyTab);
      const joyEdges = {
        left: parseFloat(joyStyle.borderLeftWidth) + parseFloat(after.left),
        right: joyBox.width - parseFloat(joyStyle.borderRightWidth) - parseFloat(after.right),
        bottom: joyBox.height - parseFloat(joyStyle.borderBottomWidth) - parseFloat(after.bottom),
      };
      const ourEdges = {
        left: indicatorBox.left - ourBox.left,
        right: indicatorBox.right - ourBox.left,
        bottom: indicatorBox.bottom - ourBox.top,
      };
      expect(ourEdges).toEqual(joyEdges);

      await expect(page.getByTestId('joy-b')).toMatchScreenshot(`tabnav-indicator-joy-${scheme}`);
      await expect(page.getByTestId('hintoric-b')).toMatchScreenshot(`tabnav-indicator-hintoric-${scheme}`);
    });

    for (const variant of VARIANTS) {
      it(`a hovered ${variant} tab, resting and current, matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        renderPair(scheme, {}, { variant });

        await userEvent.hover(page.getByTestId('joy-a'));
        await settleTransitions();
        const joyStyle = pick(page.getByTestId('joy-a').element(), TAB_PROPERTIES);
        await userEvent.hover(page.getByTestId('hintoric-a'));
        await settleTransitions();
        const ourStyle = pick(page.getByTestId('hintoric-a').element(), TAB_PROPERTIES);

        expect(ourStyle).toEqual(joyStyle);

        // Joy suppresses the hover styles on the selected tab.
        await userEvent.hover(page.getByTestId('joy-b'));
        await settleTransitions();
        const joyCurrent = pick(page.getByTestId('joy-b').element(), TAB_PROPERTIES);
        await userEvent.hover(page.getByTestId('hintoric-b'));
        await settleTransitions();
        expect(pick(page.getByTestId('hintoric-b').element(), TAB_PROPERTIES)).toEqual(joyCurrent);
        await userEvent.unhover(page.getByTestId('hintoric-b'));
      });

      it(`a disabled ${variant} tab matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        renderPair(scheme, {}, { variant, disabled: true });

        const properties = [...TAB_PROPERTIES, 'opacity', 'pointerEvents'];
        expect(pick(page.getByTestId('hintoric-a').element(), properties)).toEqual(
          pick(page.getByTestId('joy-a').element(), properties),
        );
        await expect(page.getByTestId('joy-a')).toMatchScreenshot(`tabnav-disabled-${variant}-joy-${scheme}`);
        await expect(page.getByTestId('hintoric-a')).toMatchScreenshot(`tabnav-disabled-${variant}-hintoric-${scheme}`);
      });
    }

    it(`shows the same focus-visible outline as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);
      renderPair(scheme, {}, {});
      const properties = ['outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset'];

      const joyEl = page.getByTestId('joy-a').element() as HTMLElement;
      const ourEl = page.getByTestId('hintoric-a').element() as HTMLElement;

      joyEl.focus();
      await settleTransitions();
      const joyOutline = pick(joyEl, properties);
      joyEl.blur();

      ourEl.focus();
      await settleTransitions();
      const ourOutline = pick(ourEl, properties);
      ourEl.blur();

      expect(ourOutline).toEqual(joyOutline);
    });
  }
});
