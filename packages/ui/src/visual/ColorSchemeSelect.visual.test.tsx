import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select as HintoricSelect } from '../components/Select';
import { Option } from '../components/Option';
import { ColorSchemeSelect } from '../components/ColorSchemeSelect';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

const SIZES = ['sm', 'md', 'lg'] as const;

function trigger(testId: string): Element {
  return page.getByTestId(testId).element().querySelector('[role="combobox"]') as Element;
}

/*
 * Base UI splits the popup (the styled surface, role="presentation") from the
 * list inside it (role="listbox"), so getByRole('listbox') resolves to the
 * inner list and screenshots an unstyled box. Reach the surface the way
 * Select.visual.test.tsx does: through the trigger's aria-controls, then one
 * step up.
 */
function openPopupSurface(): HTMLElement {
  const triggers = [...document.querySelectorAll('[role="combobox"]')] as HTMLElement[];
  const listId = triggers[triggers.length - 1].getAttribute('aria-controls') as string;
  return document.getElementById(listId)?.parentElement as HTMLElement;
}

// Exempt from the Joy parity cross-product: Select and Option already carry
// it. What this composition owns is pass-through, the fill-the-form width
// Select regressed on once, and scheme handling.
describe('ColorSchemeSelect visual', () => {
  it.each(SIZES)('passes size %s through to the trigger', async (size) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid={`ours-${size}`} style={{ width: 240 }}>
          <ColorSchemeSelect size={size} />
        </div>
      </ColorSchemeProvider>,
    );
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid={`reference-${size}`} style={{ width: 240 }}>
          <HintoricSelect size={size} value="system">
            <Option value="system">System</Option>
          </HintoricSelect>
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    expect(getComputedStyle(trigger(`ours-${size}`)).minHeight).toBe(
      getComputedStyle(trigger(`reference-${size}`)).minHeight,
    );
  });

  it('fills the width of its container, like Select itself', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid="wrapper" style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );
    await settleTransitions();

    // Select's own regression: an inline-flex root shrank to its content
    // instead of filling the form. A wrapper form control must not undo that.
    expect(getComputedStyle(trigger('wrapper')).width).toBe('240px');
  });

  it.each(COLOR_SCHEMES)('matches its own baseline closed in %s', async (scheme) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid="select" style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );
    await setColorScheme(scheme);

    await expect(page.getByTestId('select')).toMatchScreenshot(`colorschemeselect-closed-${scheme}`);
  });

  it.each(COLOR_SCHEMES)('matches its own baseline open in %s', async (scheme) => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('option', { name: 'Light' });
    await setColorScheme(scheme);

    await expect(page.elementLocator(openPopupSurface())).toMatchScreenshot(
      `colorschemeselect-open-${scheme}`,
    );
  });

  it('actually changes appearance between the two schemes', async () => {
    render(
      <ColorSchemeProvider defaultMode="system">
        <div data-testid="box" style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </ColorSchemeProvider>,
    );

    await setColorScheme('light');
    const light = getComputedStyle(trigger('box'));
    const lightTriple = [light.backgroundColor, light.color, light.borderColor].join('|');

    await setColorScheme('dark');
    const dark = getComputedStyle(trigger('box'));
    const darkTriple = [dark.backgroundColor, dark.color, dark.borderColor].join('|');

    expect(darkTriple).not.toBe(lightTriple);
  });
});
