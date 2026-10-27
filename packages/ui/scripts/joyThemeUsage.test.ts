import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const visualDir = resolve(import.meta.dirname, '../src/visual');

/*
 * Real @mui/joy is the visual suite's oracle only when it is rendered with the
 * agreed look (src/visual/joyTheme.ts). A provider without `theme={joyTheme}`
 * falls back to Joy's default theme and compares our components against the
 * old look — a test that cannot pass, or worse, one rewritten until it does.
 */
describe('visual suite', () => {
  it('renders every JoyCssVarsProvider with the oracle theme', () => {
    const offenders: string[] = [];
    for (const file of readdirSync(visualDir).filter((f) => f.endsWith('.tsx'))) {
      readFileSync(resolve(visualDir, file), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (line.includes('<JoyCssVarsProvider') && !line.includes('<JoyCssVarsProvider theme={joyTheme}')) {
            offenders.push(`${file}:${i + 1}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
