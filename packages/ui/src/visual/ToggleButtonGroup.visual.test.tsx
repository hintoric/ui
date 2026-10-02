import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  ToggleButtonGroup as JoyToggleButtonGroup,
  Button as JoyButton,
  IconButton as JoyIconButton,
} from '@mui/joy';
import { ToggleButtonGroup as HintoricToggleButtonGroup } from '../components/ToggleButtonGroup';
import { Button as HintoricButton } from '../components/Button';
import { IconButton as HintoricIconButton } from '../components/IconButton';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';
import { parkPointer } from './errorParity';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const;
const CORNERS = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const;

// What defines a grouped button's look. The first version of this file only
// compared the group root's display/flex/font, so it stayed green while every
// child rendered solid/primary instead of inheriting Joy's outlined/neutral
// from the group — the child is where a ToggleButtonGroup's look lives: the
// per-side separator borders, the per-corner radii that make the group read as
// one control, the -1px overlap margin and the selected (`aria-pressed`) fill.
const BUTTON_PROPS = [
  'backgroundColor',
  'color',
  ...SIDES.flatMap((s) => [`border${s}Width`, `border${s}Style`, `border${s}Color`]),
  ...CORNERS.map((c) => `border${c}Radius`),
  'marginTop',
  'marginLeft',
  'zIndex',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'minHeight',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'cursor',
] as const;

const GROUP_PROPS = ['display', 'flexDirection', 'rowGap', 'columnGap', ...CORNERS.map((c) => `border${c}Radius`)] as const;

function pick(el: Element, props: readonly string[]) {
  const style = getComputedStyle(el) as unknown as Record<string, string>;
  const rect = el.getBoundingClientRect();
  const values: Record<string, string> = Object.fromEntries(props.map((p) => [p, style[p]]));
  // A 0px border's style is invisible: Joy's Button says `border: none`,
  // Tailwind's preflight `border: 0 solid`. Only compare it where it paints.
  for (const s of SIDES) {
    if (values[`border${s}Width`] === '0px') delete values[`border${s}Style`];
  }
  return {
    ...values,
    // Rounded: a sub-pixel difference in text shaping is not a styling bug.
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

/** Compares the group root and every child, by position, between the two trees. */
function expectSameGroup(joyRoot: Element, hintoricRoot: Element) {
  expect(pick(hintoricRoot, GROUP_PROPS)).toEqual(pick(joyRoot, GROUP_PROPS));
  expect(hintoricRoot.children.length).toBe(joyRoot.children.length);
  Array.from(joyRoot.children).forEach((joyChild, i) => {
    const hintoricChild = hintoricRoot.children[i]!;
    expect({ child: i, ...pick(hintoricChild, BUTTON_PROPS) }).toEqual({ child: i, ...pick(joyChild, BUTTON_PROPS) });
    expect(hintoricChild.getAttribute('aria-pressed')).toBe(joyChild.getAttribute('aria-pressed'));
  });
}

type GroupProps = {
  variant?: (typeof VARIANTS)[number];
  color?: (typeof COLORS)[number];
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  spacing?: number;
  disabled?: boolean;
};

/**
 * Three buttons, the first one selected: first, middle and last child each get
 * their own radius/separator rule in Joy, so all three positions are covered.
 * No variant/color on the buttons themselves — they must come from the group.
 */
function renderBoth(scheme: (typeof COLOR_SCHEMES)[number], props: GroupProps, icons = false) {
  const labels = ['a', 'b', 'c'];
  render(
    <JoyCssVarsProvider defaultMode={scheme}>
      <JoyToggleButtonGroup data-testid="joy" value={['a']} {...props}>
        {labels.map((l) =>
          icons ? (
            <JoyIconButton key={l} value={l} data-testid={`joy-${l}`}>
              {l.toUpperCase()}
            </JoyIconButton>
          ) : (
            <JoyButton key={l} value={l} data-testid={`joy-${l}`}>
              {l.toUpperCase()}
            </JoyButton>
          ),
        )}
      </JoyToggleButtonGroup>
    </JoyCssVarsProvider>,
  );
  render(
    <ColorSchemeProvider defaultMode={scheme}>
      <HintoricToggleButtonGroup data-testid="hintoric" value={['a']} {...props}>
        {labels.map((l) =>
          icons ? (
            <HintoricIconButton key={l} value={l} data-testid={`hintoric-${l}`}>
              {l.toUpperCase()}
            </HintoricIconButton>
          ) : (
            <HintoricButton key={l} value={l} data-testid={`hintoric-${l}`}>
              {l.toUpperCase()}
            </HintoricButton>
          ),
        )}
      </HintoricToggleButtonGroup>
    </ColorSchemeProvider>,
  );
  return {
    joy: page.getByTestId('joy'),
    hintoric: page.getByTestId('hintoric'),
  };
}

describe('ToggleButtonGroup visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`defaults to Joy's outlined/neutral, connected, in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { joy, hintoric } = renderBoth(scheme, {});
      await settleTransitions();

      expectSameGroup(joy.element(), hintoric.element());

      await expect(joy).toMatchScreenshot(`togglebuttongroup-joy-${scheme}`);
      await expect(hintoric).toMatchScreenshot(`togglebuttongroup-hintoric-${scheme}`);
    });

    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's group and per-button styles in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { joy, hintoric } = renderBoth(scheme, { variant, color });
          await settleTransitions();

          expectSameGroup(joy.element(), hintoric.element());

          await expect(joy).toMatchScreenshot(`togglebuttongroup-${variant}-${color}-joy-${scheme}`);
          await expect(hintoric).toMatchScreenshot(`togglebuttongroup-${variant}-${color}-hintoric-${scheme}`);
        });

        // Hovering both the unselected middle button and the selected first
        // one: Joy's `[aria-pressed="true"]` rule comes after `:hover`, so a
        // selected button keeps its pressed fill under the pointer.
        it(`${variant}/${color} hover matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          renderBoth(scheme, { variant, color });

          for (const l of ['b', 'a']) {
            await userEvent.hover(page.getByTestId(`joy-${l}`));
            await settleTransitions();
            const joyStyle = pick(page.getByTestId(`joy-${l}`).element(), BUTTON_PROPS);
            await userEvent.hover(page.getByTestId(`hintoric-${l}`));
            await settleTransitions();
            const hintoricStyle = pick(page.getByTestId(`hintoric-${l}`).element(), BUTTON_PROPS);
            expect({ hovered: l, ...hintoricStyle }).toEqual({ hovered: l, ...joyStyle });
          }
          await parkPointer('togglebuttongroup');
        });

        it(`${variant}/${color} disabled group matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { joy, hintoric } = renderBoth(scheme, { variant, color, disabled: true });
          await settleTransitions();

          expectSameGroup(joy.element(), hintoric.element());
          for (const l of ['a', 'b', 'c']) {
            expect((page.getByTestId(`hintoric-${l}`).element() as HTMLButtonElement).disabled).toBe(true);
          }
        });
      }

      it(`${variant} vertical orientation matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { variant, orientation: 'vertical' });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`togglebuttongroup-vertical-${variant}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`togglebuttongroup-vertical-${variant}-hintoric-${scheme}`);
      });

      // spacing > 0 disconnects the buttons: full radius on every corner, and
      // the separator border survives only for `outlined`.
      it(`${variant} with spacing={1} matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { variant, spacing: 1 });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`togglebuttongroup-spacing-${variant}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`togglebuttongroup-spacing-${variant}-hintoric-${scheme}`);
      });

      it(`${variant} with IconButton children matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { variant }, true);
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`togglebuttongroup-iconbutton-${variant}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`togglebuttongroup-iconbutton-${variant}-hintoric-${scheme}`);
      });
    }

    for (const size of ['sm', 'lg'] as const) {
      it(`size=${size} reaches the buttons like Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { size });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`togglebuttongroup-size-${size}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`togglebuttongroup-size-${size}-hintoric-${scheme}`);
      });
    }

    // A focused button rises above its neighbours (z-index 2) so its focus
    // ring isn't clipped by the next button's overlapping border.
    it(`focus-visible matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);
      renderBoth(scheme, {});

      const read = (el: Element) => {
        const s = getComputedStyle(el);
        return { zIndex: s.zIndex, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor, outlineOffset: s.outlineOffset };
      };
      // Keyboard focus, so `:focus-visible` matches as it does for a real user.
      (page.getByTestId('joy-a').element() as HTMLElement).focus();
      await userEvent.keyboard('{Tab}');
      await settleTransitions();
      const joyFocused = read(page.getByTestId('joy-b').element());
      (page.getByTestId('hintoric-a').element() as HTMLElement).focus();
      await userEvent.keyboard('{Tab}');
      await settleTransitions();
      const hintoricFocused = read(page.getByTestId('hintoric-b').element());

      expect(hintoricFocused).toEqual(joyFocused);
    });

    it(`fills the same share of a fixed-width parent as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <div style={{ width: 400 }}>
            <JoyToggleButtonGroup data-testid="joy-sized" value={['a']}>
              <JoyButton value="a">A</JoyButton>
              <JoyButton value="b">B</JoyButton>
            </JoyToggleButtonGroup>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 400 }}>
            <HintoricToggleButtonGroup data-testid="hintoric-sized" value={['a']}>
              <HintoricButton value="a">A</HintoricButton>
              <HintoricButton value="b">B</HintoricButton>
            </HintoricToggleButtonGroup>
          </div>
        </ColorSchemeProvider>,
      );

      const joyEl = page.getByTestId('joy-sized').element();
      const hintoricEl = page.getByTestId('hintoric-sized').element();
      expect(getComputedStyle(hintoricEl).display).toBe(getComputedStyle(joyEl).display);
      expect(hintoricEl.getBoundingClientRect().width).toBeCloseTo(joyEl.getBoundingClientRect().width, 0);
    });
  }
});

