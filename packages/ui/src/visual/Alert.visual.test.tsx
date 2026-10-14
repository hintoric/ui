import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Alert as JoyAlert, SvgIcon as JoySvgIcon } from '@mui/joy';
import { Alert as HintoricAlert, AlertTitle, ALERT_ICONS, ALERT_ICON_FOR_COLOR } from '../components/Alert';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Alert is non-interactive — no focus state to cover, just the variant x
// color x size matrix.
//
// Our Alert shows an icon per colour by default; Joy's shows none. Joy gets
// the same path as its own SvgIcon, which it sizes through the alert's
// `--Icon-fontSize` — so the comparison also checks our icon's size and
// position against Joy's sizing, not against itself.
const joyIcon = (color: (typeof COLORS)[number], testId: string) => (
  <JoySvgIcon data-testid={testId}>
    <path d={ALERT_ICONS[ALERT_ICON_FOR_COLOR[color]]} />
  </JoySvgIcon>
);

function expectSameIcon(joyAlertId: string, joyIconId: string, hintoricAlertId: string) {
  const box = (alertId: string, icon: Element) => {
    const a = page.getByTestId(alertId).element().getBoundingClientRect();
    const i = icon.getBoundingClientRect();
    return { width: i.width, height: i.height, left: i.left - a.left, top: i.top - a.top, alertHeight: a.height };
  };
  const ours = page.getByTestId(hintoricAlertId).element().querySelector('svg[data-alert-icon]')!;
  expect(box(hintoricAlertId, ours)).toEqual(box(joyAlertId, page.getByTestId(joyIconId).element()));
  expect(getComputedStyle(ours).color).toBe(getComputedStyle(page.getByTestId(joyIconId).element()).color);
}
describe('Alert visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(
            <JoyCssVarsProvider defaultMode={scheme}>
              <JoyAlert
                data-testid={`joy-${variant}-${color}`}
                variant={variant}
                color={color}
                startDecorator={joyIcon(color, `joy-icon-${variant}-${color}`)}
              >
                {color}
              </JoyAlert>
            </JoyCssVarsProvider>,
          );
          render(
            <ColorSchemeProvider defaultMode={scheme}>
              <HintoricAlert data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
                {color}
              </HintoricAlert>
            </ColorSchemeProvider>,
          );

          const joyLocator = page.getByTestId(`joy-${variant}-${color}`);
          const hintoricLocator = page.getByTestId(`hintoric-${variant}-${color}`);

          const joyStyle = getComputedStyle(joyLocator.element());
          const hintoricStyle = getComputedStyle(hintoricLocator.element());

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.color).toBe(joyStyle.color);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.padding).toBe(joyStyle.padding);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
          expectSameIcon(`joy-${variant}-${color}`, `joy-icon-${variant}-${color}`, `hintoric-${variant}-${color}`);

          await expect(joyLocator).toMatchScreenshot(`alert-${variant}-${color}-joy-${scheme}`);
          await expect(hintoricLocator).toMatchScreenshot(`alert-${variant}-${color}-hintoric-${scheme}`);
        });
      }
    }

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed padding in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyAlert data-testid={`joy-size-${size}`} size={size} startDecorator={joyIcon('neutral', `joy-icon-size-${size}`)}>
              {size}
            </JoyAlert>
          </JoyCssVarsProvider>,
        );
        render(
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricAlert data-testid={`hintoric-size-${size}`} size={size}>
              {size}
            </HintoricAlert>
          </ColorSchemeProvider>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-size-${size}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element());

        expect(hintoricStyle.padding).toBe(joyStyle.padding);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expectSameIcon(`joy-size-${size}`, `joy-icon-size-${size}`, `hintoric-size-${size}`);
      });
    }

    // Joy centres the row; we top-align it. For a single line the two must
    // still agree, and with more lines the icon must sit on the first one.
    it(`single-line alert with a decorator keeps Joy's height and icon position in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const icon = (id: string) => <svg data-testid={id} width="20" height="20" />;

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoyAlert data-testid="joy-deco" startDecorator={icon('joy-icon')}>
            Text
          </JoyAlert>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricAlert data-testid="hintoric-deco" startDecorator={icon('hintoric-icon')}>
            Text
          </HintoricAlert>
        </ColorSchemeProvider>,
      );

      const rel = (alertId: string, iconId: string) => {
        const a = page.getByTestId(alertId).element().getBoundingClientRect();
        const i = page.getByTestId(iconId).element().getBoundingClientRect();
        return { height: a.height, top: i.top - a.top };
      };
      expect(rel('hintoric-deco', 'hintoric-icon')).toEqual(rel('joy-deco', 'joy-icon'));
    });

    it(`top-aligns the icon with the title line of a two-line alert in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <HintoricAlert
            data-testid="two-line"
            color="primary"
            startDecorator={<svg data-testid="two-line-icon" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" />
              </svg>}
            className="py-1.5 px-4 rounded"
          >
            <AlertTitle data-testid="two-line-title">Title</AlertTitle>
            <div className="text-sm font-normal">First line of text</div>
            <div className="text-sm font-normal">Second line of text</div>
          </HintoricAlert>
        </ColorSchemeProvider>,
      );

      const alert = page.getByTestId('two-line').element().getBoundingClientRect();
      const icon = page.getByTestId('two-line-icon').element().getBoundingClientRect();
      const title = page.getByTestId('two-line-title').element();
      const titleRect = title.getBoundingClientRect();
      const titleStyle = getComputedStyle(title);

      expect(titleStyle.fontSize).toBe('16px');
      expect(titleStyle.fontWeight).toBe('600');
      expect(titleRect.height).toBe(24);
      // Icon box and title line share a top edge; the row is taller than the icon.
      expect(icon.top).toBe(titleRect.top);
      expect(icon.height).toBe(24);
      expect(alert.height).toBeGreaterThan(icon.height + 12);

      await expect(page.getByTestId('two-line')).toMatchScreenshot(`alert-two-line-hintoric-${scheme}`);
    });
  }
});
