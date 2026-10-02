import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  ButtonGroup as JoyButtonGroup,
  Button as JoyButton,
  IconButton as JoyIconButton,
} from '@mui/joy';
import { ButtonGroup as HintoricButtonGroup } from '../components/ButtonGroup';
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
// compared the group root's display/flex/font around plain `<button>`s, so it
// could never notice that the group handed nothing down to its children — the
// child is where a ButtonGroup's look lives: the variant/color/size it
// inherits, the per-side separator borders, the per-corner radii that make the
// group read as one control, and the -1px overlap margin.
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
  expect(hintoricRoot.getAttribute('role')).toBe(joyRoot.getAttribute('role'));
  expect(hintoricRoot.children.length).toBe(joyRoot.children.length);
  Array.from(joyRoot.children).forEach((joyChild, i) => {
    const hintoricChild = hintoricRoot.children[i]!;
    expect({ child: i, ...pick(hintoricChild, BUTTON_PROPS) }).toEqual({ child: i, ...pick(joyChild, BUTTON_PROPS) });
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
 * Three buttons by default: first, middle and last child each get their own
 * radius/separator rule in Joy, so all three positions are covered. No
 * variant/color on the buttons themselves — they must come from the group.
 */
function renderBoth(
  scheme: (typeof COLOR_SCHEMES)[number],
  props: GroupProps,
  { icons = false, labels = ['a', 'b', 'c'] }: { icons?: boolean; labels?: string[] } = {},
) {
  render(
    <JoyCssVarsProvider defaultMode={scheme}>
      <JoyButtonGroup data-testid="joy" {...props}>
        {labels.map((l) =>
          icons ? (
            <JoyIconButton key={l} data-testid={`joy-${l}`}>
              {l.toUpperCase()}
            </JoyIconButton>
          ) : (
            <JoyButton key={l} data-testid={`joy-${l}`}>
              {l.toUpperCase()}
            </JoyButton>
          ),
        )}
      </JoyButtonGroup>
    </JoyCssVarsProvider>,
  );
  render(
    <ColorSchemeProvider defaultMode={scheme}>
      <HintoricButtonGroup data-testid="hintoric" {...props}>
        {labels.map((l) =>
          icons ? (
            <HintoricIconButton key={l} data-testid={`hintoric-${l}`}>
              {l.toUpperCase()}
            </HintoricIconButton>
          ) : (
            <HintoricButton key={l} data-testid={`hintoric-${l}`}>
              {l.toUpperCase()}
            </HintoricButton>
          ),
        )}
      </HintoricButtonGroup>
    </ColorSchemeProvider>,
  );
  return {
    joy: page.getByTestId('joy'),
    hintoric: page.getByTestId('hintoric'),
  };
}

describe('ButtonGroup visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`defaults to Joy's outlined/neutral/md, connected, in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { joy, hintoric } = renderBoth(scheme, {});
      await settleTransitions();

      expectSameGroup(joy.element(), hintoric.element());

      await expect(joy).toMatchScreenshot(`buttongroup-joy-${scheme}`);
      await expect(hintoric).toMatchScreenshot(`buttongroup-hintoric-${scheme}`);
    });

    // Joy tags no child of a one-button group, and its middle-child rules
    // exclude `:only-child`, so a lone button keeps all four corners and gains
    // no separator border.
    it(`a single child matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { joy, hintoric } = renderBoth(scheme, { variant: 'solid' }, { labels: ['a'] });
      await settleTransitions();

      expectSameGroup(joy.element(), hintoric.element());

      await expect(joy).toMatchScreenshot(`buttongroup-single-joy-${scheme}`);
      await expect(hintoric).toMatchScreenshot(`buttongroup-single-hintoric-${scheme}`);
    });

    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's group and per-button styles in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { joy, hintoric } = renderBoth(scheme, { variant, color });
          await settleTransitions();

          expectSameGroup(joy.element(), hintoric.element());

          await expect(joy).toMatchScreenshot(`buttongroup-${variant}-${color}-joy-${scheme}`);
          await expect(hintoric).toMatchScreenshot(`buttongroup-${variant}-${color}-hintoric-${scheme}`);
        });

        // The middle button (separators on both sides) and the first one
        // (outer corners): a hovered button rises to z-index 2 so its own
        // border wins over the neighbour it overlaps.
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
          await parkPointer('buttongroup');
        });

        it(`${variant}/${color} disabled group matches Joy UI in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { joy, hintoric } = renderBoth(scheme, { variant, color, disabled: true });
          await settleTransitions();

          expectSameGroup(joy.element(), hintoric.element());
          for (const l of ['a', 'b', 'c']) {
            expect((page.getByTestId(`joy-${l}`).element() as HTMLButtonElement).disabled).toBe(true);
            expect((page.getByTestId(`hintoric-${l}`).element() as HTMLButtonElement).disabled).toBe(true);
          }
        });
      }

      it(`${variant} vertical orientation matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { variant, orientation: 'vertical' });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`buttongroup-vertical-${variant}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`buttongroup-vertical-${variant}-hintoric-${scheme}`);
      });

      // spacing > 0 disconnects the buttons: full radius on every corner, and
      // the separator border survives only for `outlined`.
      it(`${variant} with spacing={1} matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { variant, spacing: 1 });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`buttongroup-spacing-${variant}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`buttongroup-spacing-${variant}-hintoric-${scheme}`);
      });

      it(`${variant} with IconButton children matches Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { variant }, { icons: true });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`buttongroup-iconbutton-${variant}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`buttongroup-iconbutton-${variant}-hintoric-${scheme}`);
      });
    }

    for (const size of ['sm', 'lg'] as const) {
      it(`size=${size} reaches the buttons like Joy UI in ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { joy, hintoric } = renderBoth(scheme, { size });
        await settleTransitions();

        expectSameGroup(joy.element(), hintoric.element());

        await expect(joy).toMatchScreenshot(`buttongroup-size-${size}-joy-${scheme}`);
        await expect(hintoric).toMatchScreenshot(`buttongroup-size-${size}-hintoric-${scheme}`);
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
            <JoyButtonGroup data-testid="joy-sized">
              <JoyButton>A</JoyButton>
              <JoyButton>B</JoyButton>
            </JoyButtonGroup>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={{ width: 400 }}>
            <HintoricButtonGroup data-testid="hintoric-sized">
              <HintoricButton>A</HintoricButton>
              <HintoricButton>B</HintoricButton>
            </HintoricButtonGroup>
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
