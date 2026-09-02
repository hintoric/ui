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
});
