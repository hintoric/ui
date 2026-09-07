import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Switch as JoySwitch } from '@mui/joy';
import { Switch as HintoricSwitch } from '../components/Switch';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Switch visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const color of COLORS) {
      it(`color=${color} unchecked matches Joy UI's computed styles in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoySwitch data-testid={`joy-${color}`} color={color} />
          </JoyCssVarsProvider>,
        );
        render(<HintoricSwitch data-testid={`hintoric-${color}`} color={color} />);

        const joyTrack = page.getByTestId(`joy-${color}`).element().querySelector('.MuiSwitch-track') as HTMLElement;
        const joyStyle = getComputedStyle(joyTrack);
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${color}`).element());

        expect(hintoricStyle.width).toBe(joyStyle.width);
        expect(hintoricStyle.height).toBe(joyStyle.height);
        expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
        expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
        expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
        expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);

        await expect(page.getByTestId(`joy-${color}`)).toMatchScreenshot(`switch-${color}-unchecked-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-${color}`)).toMatchScreenshot(`switch-${color}-unchecked-hintoric-${scheme}`);
      });

      it(`color=${color} checked matches Joy UI's computed styles in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoySwitch data-testid={`joy-checked-${color}`} color={color} defaultChecked />
          </JoyCssVarsProvider>,
        );
        render(<HintoricSwitch data-testid={`hintoric-checked-${color}`} color={color} defaultChecked />);

        const joyTrack = page.getByTestId(`joy-checked-${color}`).element().querySelector('.MuiSwitch-track') as HTMLElement;
        const joyStyle = getComputedStyle(joyTrack);
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-checked-${color}`).element());

        expect(hintoricStyle.width).toBe(joyStyle.width);

        await expect(page.getByTestId(`joy-checked-${color}`)).toMatchScreenshot(`switch-${color}-checked-joy-${scheme}`);
        await expect(page.getByTestId(`hintoric-checked-${color}`)).toMatchScreenshot(`switch-${color}-checked-hintoric-${scheme}`);
      });
    }

    it(`defaults to neutral track unchecked, primary track checked (no color prop) in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoySwitch data-testid="joy-default" />
        </JoyCssVarsProvider>,
      );
      render(<HintoricSwitch data-testid="hintoric-default" />);

      const joyDefaultTrack = page.getByTestId('joy-default').element().querySelector('.MuiSwitch-track') as HTMLElement;
      expect(getComputedStyle(page.getByTestId('hintoric-default').element()).backgroundColor).toBe(
        getComputedStyle(joyDefaultTrack).backgroundColor,
      );
    });

    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`size=${size} matches Joy UI's computed dimensions in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoySwitch data-testid={`joy-size-${size}`} size={size} />
          </JoyCssVarsProvider>,
        );
        render(<HintoricSwitch data-testid={`hintoric-size-${size}`} size={size} />);

        const joySizeTrack = page.getByTestId(`joy-size-${size}`).element().querySelector('.MuiSwitch-track') as HTMLElement;
        expect(getComputedStyle(page.getByTestId(`hintoric-size-${size}`).element()).width).toBe(
          getComputedStyle(joySizeTrack).width,
        );
      });
    }

    it(`shows the same focus-visible outline as Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <JoyCssVarsProvider defaultMode={scheme}>
          <JoySwitch data-testid="joy-focus" />
        </JoyCssVarsProvider>,
      );
      render(<HintoricSwitch data-testid="hintoric-focus" />);

      const joyEl = page.getByTestId('joy-focus').element().querySelector('input') as HTMLInputElement;
      const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

      joyEl.focus();
      await settleTransitions();
      const joyOutline = getComputedStyle(joyEl.parentElement!).outline;
      joyEl.blur();

      hintoricEl.focus();
      await settleTransitions();
      const hintoricOutline = getComputedStyle(hintoricEl).outline;
      hintoricEl.blur();

      expect(hintoricOutline).toBe(joyOutline);
    });
  }
});
