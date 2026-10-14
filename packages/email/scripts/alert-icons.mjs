// Renders the Alert icons as the PNGs mail clients load from the CDN: one per
// icon and text colour (emailAlertIconFiles), 48px square — twice the largest
// size an Alert shows them at — on a transparent background.
//
//   pnpm --filter @hintoric/ui build && pnpm --filter @hintoric/email build
//   node packages/email/scripts/alert-icons.mjs
//
// writes them to packages/email/assets/email/alert/. That folder mirrors the
// CDN path: its contents go into email/alert/ of the shared Drive folder that
// syncs to cdn.hintoric.com/assets.
/* global console */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { ALERT_ICONS } from '@hintoric/ui';
import { emailAlertIconFiles } from '../dist/index.js';

const SIZE = 48;
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'email', 'alert');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
for (const { name, ink, file } of emailAlertIconFiles()) {
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" style="display:block"><path fill="${ink}" d="${ALERT_ICONS[name]}"/></svg></body></html>`,
  );
  writeFileSync(join(out, file), await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: SIZE, height: SIZE } }));
  console.log(file);
}
await browser.close();
