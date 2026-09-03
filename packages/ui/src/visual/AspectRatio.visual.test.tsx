import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, AspectRatio as JoyAspectRatio } from '@mui/joy';
import { AspectRatio as HintoricAspectRatio } from '../components/AspectRatio';

// Joy UI achieves the ratio via a legacy padding-bottom hack; we use the
// modern CSS `aspect-ratio` property. The underlying CSS techniques differ,
// so raw computed-style strings can't be unified — instead we compare the
// achieved width/height RATIO, which is the actual visual contract.
describe('AspectRatio visual parity with @mui/joy', () => {
  const RATIOS: [string, number][] = [
    ['16/9', 16 / 9],
    ['1/1', 1],
    ['4/3', 4 / 3],
  ];

  for (const [ratio, expected] of RATIOS) {
    it(`ratio=${ratio} achieves the same aspect ratio as Joy UI`, async () => {
      render(
        <JoyCssVarsProvider>
          <div style={{ width: 300 }}>
            <JoyAspectRatio data-testid={`joy-${ratio}`} ratio={ratio}>
              <div />
            </JoyAspectRatio>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <div style={{ width: 300 }}>
          <HintoricAspectRatio data-testid={`hintoric-${ratio}`} ratio={ratio}>
            <div />
          </HintoricAspectRatio>
        </div>,
      );

      const joyRect = page.getByTestId(`joy-${ratio}`).element().getBoundingClientRect();
      const hintoricRect = page.getByTestId(`hintoric-${ratio}`).element().getBoundingClientRect();

      const joyRatio = joyRect.width / joyRect.height;
      const hintoricRatio = hintoricRect.width / hintoricRect.height;

      expect(hintoricRatio).toBeCloseTo(joyRatio, 1);
      expect(hintoricRatio).toBeCloseTo(expected, 1);

      await expect(page.getByTestId(`joy-${ratio}`)).toMatchScreenshot(`aspectratio-${ratio.replace('/', '-')}-joy`);
      await expect(page.getByTestId(`hintoric-${ratio}`)).toMatchScreenshot(`aspectratio-${ratio.replace('/', '-')}-hintoric`);
    });
  }
});
