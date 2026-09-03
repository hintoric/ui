import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Slider as JoySlider } from '@mui/joy';
import { Slider as HintoricSlider } from '../components/Slider';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

describe('Slider visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed track/thumb styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoySlider
              defaultValue={40}
              variant={variant}
              color={color}
              data-testid={`joy-root-${variant}-${color}`}
              slotProps={{
                track: { 'data-testid': `joy-track-${variant}-${color}` },
                thumb: { 'data-testid': `joy-thumb-${variant}-${color}` },
              }}
            />
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricSlider
            defaultValue={40}
            variant={variant}
            color={color}
            data-testid={`hintoric-control-${variant}-${color}`}
          />,
        );

        const joyTrackStyle = getComputedStyle(page.getByTestId(`joy-track-${variant}-${color}`).element());
        const joyThumbStyle = getComputedStyle(page.getByTestId(`joy-thumb-${variant}-${color}`).element());

        const hintoricControl = page.getByTestId(`hintoric-control-${variant}-${color}`).element();
        // Structure is our own: Control > Track > Indicator, Control > Thumb.
        const hintoricIndicatorEl = hintoricControl.firstElementChild!.firstElementChild as HTMLElement;
        const hintoricThumbEl = hintoricControl.querySelector('[data-index="0"]') as HTMLElement;
        const hintoricTrackStyle = getComputedStyle(hintoricIndicatorEl);
        const hintoricThumbStyle = getComputedStyle(hintoricThumbEl);

        expect(hintoricTrackStyle.backgroundColor).toBe(joyTrackStyle.backgroundColor);
        expect(hintoricThumbStyle.backgroundColor).toBe(joyThumbStyle.backgroundColor);
        expect(hintoricThumbStyle.borderColor).toBe(joyThumbStyle.borderColor);

        await expect(page.getByTestId(`joy-root-${variant}-${color}`)).toMatchScreenshot(`slider-${variant}-${color}-joy`);
        await expect(hintoricControl).toMatchScreenshot(`slider-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed thumb dimensions`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoySlider defaultValue={40} size={size} slotProps={{ thumb: { 'data-testid': `joy-thumb-size-${size}` } }} />
        </JoyCssVarsProvider>,
      );
      render(<HintoricSlider defaultValue={40} size={size} data-testid={`hintoric-control-size-${size}`} />);

      const joyStyle = getComputedStyle(page.getByTestId(`joy-thumb-size-${size}`).element());
      const hintoricControl = page.getByTestId(`hintoric-control-size-${size}`).element();
      const hintoricThumb = hintoricControl.querySelector('[data-index="0"]') as HTMLElement;
      const hintoricStyle = getComputedStyle(hintoricThumb);

      expect(hintoricStyle.width).toBe(joyStyle.width);
      expect(hintoricStyle.height).toBe(joyStyle.height);
      expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
    });
  }

  it('disabled slider matches Joy UI (dimmed, non-interactive)', async () => {
    render(
      <JoyCssVarsProvider>
        <JoySlider defaultValue={40} disabled slotProps={{ track: { 'data-testid': 'joy-track-disabled' } }} />
      </JoyCssVarsProvider>,
    );
    render(<HintoricSlider defaultValue={40} disabled data-testid="hintoric-control-disabled" />);

    const joyStyle = getComputedStyle(page.getByTestId('joy-track-disabled').element());
    const hintoricControl = page.getByTestId('hintoric-control-disabled').element();
    const hintoricInput = hintoricControl.querySelector('input') as HTMLInputElement;

    expect(hintoricInput.disabled).toBe(true);
    expect(joyStyle.pointerEvents).toBe('none');
    expect(getComputedStyle(hintoricControl).pointerEvents).toBe('none');
  });
});
