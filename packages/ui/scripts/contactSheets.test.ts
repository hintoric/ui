import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildContactSheets } from './contactSheets';

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'sheets-'));
  const dir = join(root, 'Card.visual.test.tsx');
  mkdirSync(dir);
  for (const name of [
    'card-outlined-neutral-joy-light-chromium-darwin.png',
    'card-outlined-neutral-hintoric-light-chromium-darwin.png',
    'card-outlined-neutral-joy-dark-chromium-darwin.png',
    'card-outlined-neutral-hintoric-dark-chromium-darwin.png',
    'stray-chromium-darwin.png',
  ]) {
    writeFileSync(join(dir, name), '');
  }
  return root;
}

describe('buildContactSheets', () => {
  it('writes one sheet per test file, pairing theirs and ours per scheme', () => {
    const root = fixture();
    const out = mkdtempSync(join(tmpdir(), 'sheets-out-'));
    const sheets = buildContactSheets(root, out, { theirs: 'joy', ours: 'hintoric' });

    expect(sheets).toHaveLength(1);
    const html = readFileSync(sheets[0], 'utf8');
    const row = html.slice(html.indexOf('card-outlined-neutral'), html.indexOf('Unpaired'));
    const order = ['joy-light', 'hintoric-light', 'joy-dark', 'hintoric-dark'].map((k) => row.indexOf(`card-outlined-neutral-${k}`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(html.slice(html.indexOf('Unpaired'))).toContain('stray-chromium-darwin.png');
  });
});
