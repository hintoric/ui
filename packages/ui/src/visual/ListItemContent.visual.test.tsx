import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, ListItemContent as JoyListItemContent } from '@mui/joy';
import { ListItemContent as HintoricListItemContent } from '../components/ListItemContent';

describe('ListItemContent visual parity with @mui/joy', () => {
  it("matches Joy UI's flex layout", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyListItemContent data-testid="joy">Label</JoyListItemContent>
      </JoyCssVarsProvider>,
    );
    render(<HintoricListItemContent data-testid="hintoric">Label</HintoricListItemContent>);

    const joyStyle = getComputedStyle(page.getByTestId('joy').element());
    const hintoricStyle = getComputedStyle(page.getByTestId('hintoric').element());

    expect(hintoricStyle.flexGrow).toBe(joyStyle.flexGrow);
    expect(hintoricStyle.minWidth).toBe(joyStyle.minWidth);

    await expect(page.getByTestId('joy')).toMatchScreenshot('listitemcontent-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('listitemcontent-hintoric');
  });
});
