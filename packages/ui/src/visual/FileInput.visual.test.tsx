import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { FileInput } from '../components/FileInput';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

/**
 * No `@mui/joy` counterpart, so no parity comparison — but scheme coverage
 * applies. The zone paints a border and a surface of its own, so the
 * layout-only exception does not: the colours have to differ between schemes.
 */
describe('FileInput', () => {
  const painted: Record<string, { borderColor: string; backgroundColor: string }> = {};

  for (const scheme of COLOR_SCHEMES) {
    it(`renders its drop zone in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(<FileInput onFiles={() => {}}>Dokument wählen</FileInput>);

      const zone = page.getByTestId('file-input-zone').element();
      const style = getComputedStyle(zone);
      painted[scheme] = { borderColor: style.borderTopColor, backgroundColor: style.backgroundColor };

      expect(style.borderTopStyle).toBe('dashed');
      await expect(page.getByTestId('file-input-zone')).toMatchScreenshot(`file-input-${scheme}`);
    });
  }

  it('paints differently in dark than in light', () => {
    // A committed PNG only catches a regression once somebody looks at it;
    // this catches a hardcoded light colour on the next run.
    expect(painted.dark.borderColor).not.toBe(painted.light.borderColor);
    expect(painted.dark.backgroundColor).not.toBe(painted.light.backgroundColor);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`dims the zone while disabled in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <FileInput onFiles={() => {}} disabled>
          Dokument wählen
        </FileInput>,
      );

      await expect(page.getByTestId('file-input-zone')).toMatchScreenshot(`file-input-disabled-${scheme}`);
    });
  }
});
