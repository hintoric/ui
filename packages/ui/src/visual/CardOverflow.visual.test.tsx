import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Card as JoyCard, CardOverflow as JoyCardOverflow } from '@mui/joy';
import { Card as HintoricCard } from '../components/Card';
import { CardOverflow as HintoricCardOverflow } from '../components/CardOverflow';

describe('CardOverflow visual parity with @mui/joy', () => {
  it('bleeds past the parent Card padding, matching Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyCard data-testid="joy-card">
          <JoyCardOverflow data-testid="joy">
            <img src="/a.jpg" alt="a" />
          </JoyCardOverflow>
        </JoyCard>
      </JoyCssVarsProvider>,
    );
    render(
      <HintoricCard data-testid="hintoric-card">
        <HintoricCardOverflow data-testid="hintoric">
          <img src="/a.jpg" alt="a" />
        </HintoricCardOverflow>
      </HintoricCard>,
    );

    const joyCardRect = page.getByTestId('joy-card').element().getBoundingClientRect();
    const joyOverflowRect = page.getByTestId('joy').element().getBoundingClientRect();
    const hintoricCardRect = page.getByTestId('hintoric-card').element().getBoundingClientRect();
    const hintoricOverflowRect = page.getByTestId('hintoric').element().getBoundingClientRect();

    const joyBleed = joyCardRect.right - joyOverflowRect.right;
    const hintoricBleed = hintoricCardRect.right - hintoricOverflowRect.right;

    expect(hintoricBleed).toBeCloseTo(joyBleed, 0);

    await expect(page.getByTestId('joy-card')).toMatchScreenshot('cardoverflow-joy');
    await expect(page.getByTestId('hintoric-card')).toMatchScreenshot('cardoverflow-hintoric');
  });
});
