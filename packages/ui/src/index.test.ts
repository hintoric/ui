import { describe, expect, it } from 'vitest';
import * as HintoricUI from './index';

describe('package entry point', () => {
  it('exports every Phase 1 component and the color-scheme hook', () => {
    const expectedExports = [
      'ColorSchemeProvider',
      'useColorScheme',
      'Box',
      'Stack',
      'Typography',
      'Sheet',
      'Card',
      'Button',
      'IconButton',
      'Input',
      'Textarea',
    ];
    for (const name of expectedExports) {
      expect(HintoricUI).toHaveProperty(name);
      expect((HintoricUI as Record<string, unknown>)[name]).toBeDefined();
    }
  });

  it('exports all six colour scheme forms', () => {
    // Six separate exports rather than one component with a `variant` prop, so
    // a header icon button does not drag Menu, Switch and Select into the
    // bundle. That only holds while each one is actually exported — a build
    // that dropped one would otherwise pass silently.
    const forms = [
      'ColorSchemeToggle',
      'ColorSchemeMenu',
      'ColorSchemeMenuItems',
      'ColorSchemeToggleGroup',
      'ColorSchemeSwitch',
      'ColorSchemeSelect',
    ];
    for (const name of forms) {
      expect(HintoricUI).toHaveProperty(name);
      expect((HintoricUI as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
