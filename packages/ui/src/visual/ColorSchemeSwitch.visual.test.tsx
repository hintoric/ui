import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Switch as HintoricSwitch } from '../components/Switch';
import { ColorSchemeSwitch } from '../components/ColorSchemeSwitch';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

function track(testId: string): Element {
  return page.getByTestId(testId).element().querySelector('[role="switch"]') as Element;
}

// Exempt from the Joy parity cross-product: Switch already carries it. What
// this composition owns is pass-through, the sun/moon decorators, and mirroring
// resolvedMode rather than mode.
describe('ColorSchemeSwitch visual', () => {
  it.each(SIZES)('passes size %s through to the track', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <div data-testid={`ours-${size}`}>
          <ColorSchemeSwitch size={size} />
        </div>
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="light">
        <div data-testid={`reference-${size}`}>
          <HintoricSwitch size={size} />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    expect(getComputedStyle(track(`ours-${size}`)).width).toBe(
      getComputedStyle(track(`reference-${size}`)).width,
    );
  });

  it('sizes both decorators identically', async () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <div data-testid="ours">
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    const icons = [...page.getByTestId('ours').element().querySelectorAll('svg')];
    expect(icons).toHaveLength(2);
    // ICON_SIZE_CLASS.sm is `size-5` = 20px on both sides; a lopsided pair
    // reads as a bug rather than a style.
    expect(icons.map((icon) => getComputedStyle(icon).width)).toEqual(['20px', '20px']);
  });

  it('shows the checked track colour when the resolved scheme is dark', async () => {
    window.localStorage.setItem('hintoric-color-scheme', 'light');
    render(
      <ColorSchemeProvider>
        <div data-testid="off">
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider>
        <div data-testid="on">
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    expect(getComputedStyle(track('on')).backgroundColor).not.toBe(
      getComputedStyle(track('off')).backgroundColor,
    );
  });

  it.each(COLOR_SCHEMES)('matches its own baseline in %s', async (scheme) => {
    window.localStorage.setItem('hintoric-color-scheme', scheme);
    render(
      <ColorSchemeProvider>
        <div data-testid="switch-box" style={{ padding: 8 }}>
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );
    await setColorScheme(scheme);

    await expect(page.getByTestId('switch-box')).toMatchScreenshot(`colorschemeswitch-${scheme}`);
  });

  it('actually changes appearance between the two schemes', async () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <div data-testid="box">
          <ColorSchemeSwitch />
        </div>
      </ColorSchemeProvider>,
    );

    await setColorScheme('light');
    const light = getComputedStyle(page.getByTestId('box').element().querySelector('svg') as Element).color;

    await setColorScheme('dark');
    const dark = getComputedStyle(page.getByTestId('box').element().querySelector('svg') as Element).color;

    // The decorators inherit the surrounding ink colour, so a hardcoded light
    // value would show up here.
    expect(dark).not.toBe(light);
  });
});
