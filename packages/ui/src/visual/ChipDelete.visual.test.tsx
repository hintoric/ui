import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ChipDelete as JoyChipDelete } from '@mui/joy';
import { ChipDelete as HintoricChipDelete } from '../components/ChipDelete';
import { settleTransitions } from './helpers';

describe('ChipDelete visual parity with @mui/joy', () => {
  it('default plain/neutral matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyChipDelete data-testid="joy-d" aria-label="delete" />
      </JoyCssVarsProvider>,
    );
    render(<HintoricChipDelete data-testid="hintoric-d" aria-label="delete" />);

    const joyStyle = getComputedStyle(page.getByTestId('joy-d').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric-d').element());

    expect(hintoricStyle.color).toBe(joyStyle.color);
    expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
    expect(hintoricStyle.cursor).toBe(joyStyle.cursor);

    await expect(page.getByTestId('joy-d')).toMatchScreenshot('chipdelete-joy');
    await expect(page.getByTestId('hintoric-d')).toMatchScreenshot('chipdelete-hintoric');
  });

  it('shows the same focus-visible outline as Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
        <JoyChipDelete data-testid="joy-focus" aria-label="delete" />
      </JoyCssVarsProvider>,
    );
    render(<HintoricChipDelete data-testid="hintoric-focus" aria-label="delete" />);

    const joyEl = page.getByTestId('joy-focus').element() as HTMLElement;
    const hintoricEl = page.getByTestId('hintoric-focus').element() as HTMLElement;

    joyEl.focus();
    await settleTransitions();
    const joyOutline = getComputedStyle(joyEl).outline;
    joyEl.blur();

    hintoricEl.focus();
    await settleTransitions();
    const hintoricOutline = getComputedStyle(hintoricEl).outline;
    hintoricEl.blur();

    expect(hintoricOutline).toBe(joyOutline);
  });
});
