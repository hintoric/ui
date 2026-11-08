/*
 * Review aid for retaken screenshot baselines: one HTML page per test file,
 * each row an id with the oracle's and our image side by side, light then
 * dark. Image paths are relative to the sheet, so serve a directory above
 * both (the repo root) to view them.
 *
 *   node packages/ui/scripts/contactSheets.ts packages/ui/src/visual/__screenshots__ .contact-sheets/ui joy hintoric
 *   node packages/ui/scripts/contactSheets.ts packages/email/src/visual/__screenshots__ .contact-sheets/email web email
 */
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEMES = ['light', 'dark'] as const;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function buildContactSheets(screenshotsRoot: string, outDir: string, labels: { theirs: string; ours: string }): string[] {
  mkdirSync(outDir, { recursive: true });
  const pattern = new RegExp(`^(.*)-(${labels.theirs}|${labels.ours})-(light|dark)(-.*)?\\.png$`);
  const written: string[] = [];

  for (const testFile of readdirSync(screenshotsRoot).sort()) {
    const dir = join(screenshotsRoot, testFile);
    if (!statSync(dir).isDirectory()) continue;
    const rows = new Map<string, Map<string, string>>();
    const unmatched: string[] = [];
    for (const png of readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
      const m = pattern.exec(png);
      if (!m) {
        unmatched.push(png);
        continue;
      }
      const [, id, side, scheme] = m;
      if (!rows.has(id)) rows.set(id, new Map());
      rows.get(id)!.set(`${side}-${scheme}`, join(dir, png));
    }

    const unpaired = [...unmatched];
    const img = (file: string | undefined) =>
      file ? `<td><img src="${escape(relative(outDir, file))}" alt="${escape(basename(file))}"><br><small>${escape(basename(file))}</small></td>` : '<td>—</td>';
    const body = [...rows.entries()]
      .map(([id, cells]) => {
        for (const scheme of SCHEMES) {
          const theirs = cells.get(`${labels.theirs}-${scheme}`);
          const ours = cells.get(`${labels.ours}-${scheme}`);
          if (!!theirs !== !!ours) unpaired.push(basename((theirs ?? ours)!));
        }
        const cols = SCHEMES.flatMap((s) => [cells.get(`${labels.theirs}-${s}`), cells.get(`${labels.ours}-${s}`)]);
        return `<tr><th>${escape(id)}</th>${cols.map(img).join('')}</tr>`;
      })
      .join('\n');

    const head = SCHEMES.flatMap((s) => [`${labels.theirs} ${s}`, `${labels.ours} ${s}`]).map((h) => `<th>${h}</th>`).join('');
    const html = `<!doctype html><meta charset="utf-8"><title>${escape(testFile)}</title>
<style>body{font:13px system-ui;margin:16px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px;vertical-align:top;text-align:left}td{background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/12px 12px}img{max-width:420px}</style>
<h1>${escape(testFile)}</h1>
<table><tr><th>id</th>${head}</tr>
${body}
</table>
<h2>Unpaired</h2>
<ul>${unpaired.map((f) => `<li>${escape(f)}</li>`).join('')}</ul>`;
    const sheet = join(outDir, `${testFile}.html`);
    writeFileSync(sheet, html);
    written.push(sheet);
  }
  return written;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root, out, theirs, ours] = process.argv.slice(2);
  if (!root || !out || !theirs || !ours) {
    console.error('usage: contactSheets.ts <screenshotsRoot> <outDir> <theirs> <ours>');
    process.exit(1);
  }
  const sheets = buildContactSheets(resolve(root), resolve(out), { theirs, ours });
  console.log(`${sheets.length} sheets in ${out}`);
}
