import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  List as JoyList,
  ListItem as JoyListItem,
  ListItemButton as JoyListItemButton,
} from '@mui/joy';
import { List as HintoricList } from '../components/List';
import { ListItem as HintoricListItem } from '../components/ListItem';
import { ListItemButton as HintoricListItemButton } from '../components/ListItemButton';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

describe('List visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`plain list layout matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyList data-testid="joy">
            <JoyListItem>One</JoyListItem>
            <JoyListItem>Two</JoyListItem>
          </JoyList>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricList data-testid="hintoric">
          <HintoricListItem>One</HintoricListItem>
          <HintoricListItem>Two</HintoricListItem>
        </HintoricList>,
      );

      const joyStyle = getComputedStyle(page.getByTestId('joy').element());
      const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.listStyleType).toBe(joyStyle.listStyleType);
      expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
      expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
      expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

      await expect(page.getByTestId('joy')).toMatchScreenshot(`list-joy-${scheme}`);
      await expect(page.getByTestId('hintoric')).toMatchScreenshot(`list-hintoric-${scheme}`);
    });

    it(`horizontal orientation matches Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyList data-testid="joy-h" orientation="horizontal">
            <JoyListItem>One</JoyListItem>
          </JoyList>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricList data-testid="hintoric-h" orientation="horizontal">
          <HintoricListItem>One</HintoricListItem>
        </HintoricList>,
      );

      expect(getComputedStyle(page.getByTestId('hintoric-h').element()).flexDirection).toBe(
        getComputedStyle(page.getByTestId('joy-h').element()).flexDirection,
      );
    });
  }
});

// Joy's List cascades its size into its rows through --ListItem-* variables
// (min-height 32/36/44px, padding, gap), stacks the rows flush, pads the block
// axis 4/6/8px, and keeps body-sm/-lg's 1.5 line-height (21/27px). Ours had a
// 4-6px row gap, md-sized rows at every size and Tailwind's 20/28px lines, so
// a three-row list came out 132px against Joy's 104px at sm. Measured
// 2026-10-16. The ListItemButton sits in a List directly: nested inside a
// ListItem, Joy pulls it over the item's padding with negative margins, which
// ours does not do yet.
describe('List size parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed metrics in ${scheme}`, async () => {
        await setColorScheme(scheme);

        const { container: joyContainer } = render(
          <div data-testid={`joy-size-${size}`} style={{ width: 320 }}>
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyList size={size}>
                <JoyListItem>One</JoyListItem>
                <JoyListItem>Two</JoyListItem>
                <JoyListItemButton>Three</JoyListItemButton>
              </JoyList>
            </JoyCssVarsProvider>
          </div>,
        );
        const { container: hintoricContainer } = render(
          <div data-testid={`hintoric-size-${size}`} style={{ width: 320 }}>
            <HintoricList size={size}>
              <HintoricListItem>One</HintoricListItem>
              <HintoricListItem>Two</HintoricListItem>
              <HintoricListItemButton>Three</HintoricListItemButton>
            </HintoricList>
          </div>,
        );

        const joyRows = joyContainer.querySelector('ul')!.children;
        const hintoricRows = hintoricContainer.querySelector('ul')!.children;
        const pairs: [Element, Element][] = [
          [joyContainer.querySelector('ul')!, hintoricContainer.querySelector('ul')!],
          [joyRows[0], hintoricRows[0]],
          [joyRows[2], hintoricRows[2]],
        ];
        for (const [joyEl, hintoricEl] of pairs) {
          const joyStyle = getComputedStyle(joyEl);
          const hintoricStyle = getComputedStyle(hintoricEl);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
          expect(hintoricStyle.minHeight).toBe(joyStyle.minHeight);
          expect(hintoricStyle.height).toBe(joyStyle.height);
          expect(hintoricStyle.width).toBe(joyStyle.width);
          expect(hintoricStyle.display).toBe(joyStyle.display);
          expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
          expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);
          expect(hintoricStyle.paddingLeft).toBe(joyStyle.paddingLeft);
          expect(hintoricStyle.paddingRight).toBe(joyStyle.paddingRight);
          expect(hintoricStyle.columnGap).toBe(joyStyle.columnGap);
        }
        // Rows stack flush: the second starts where the first ends.
        expect(hintoricRows[1].getBoundingClientRect().top - hintoricRows[0].getBoundingClientRect().bottom).toBe(
          joyRows[1].getBoundingClientRect().top - joyRows[0].getBoundingClientRect().bottom,
        );

        await expect(page.getByTestId(`joy-size-${size}`)).toMatchScreenshot(`list-size-${size}-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-size-${size}`)).toMatchScreenshot(`list-size-${size}-hintoric-${scheme}`);
      });
    }
  }
});
