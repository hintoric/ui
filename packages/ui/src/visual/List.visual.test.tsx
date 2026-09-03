import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, List as JoyList, ListItem as JoyListItem } from '@mui/joy';
import { List as HintoricList } from '../components/List';
import { ListItem as HintoricListItem } from '../components/ListItem';

describe('List visual parity with @mui/joy', () => {
  it('plain list layout matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
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

    await expect(page.getByTestId('joy')).toMatchScreenshot('list-joy');
    await expect(page.getByTestId('hintoric')).toMatchScreenshot('list-hintoric');
  });

  it('horizontal orientation matches Joy UI', async () => {
    render(
      <JoyCssVarsProvider>
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
});
