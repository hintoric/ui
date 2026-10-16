/**
 * Mirrors the CDN's icons into svg/: reads the public manifest the CDN's
 * drive-assets-sync Lambda writes (/icons.json), downloads every icon's
 * light.svg and dark.svg, and removes icons the CDN no longer has. Commit the
 * result together with a changeset — svg/ is what the package is built from.
 *
 *   pnpm --filter @hintoric/icons sync
 *   ICONS_CDN=https://cdn.hint-staging.com pnpm --filter @hintoric/icons sync
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SLUG } from './svg.ts';

interface IconManifest {
  icons: { slug: string; light: string; dark: string | null }[];
}

const cdn = (process.env.ICONS_CDN ?? 'https://cdn.hintoric.com').replace(/\/$/, '');
const root = join(import.meta.dirname, '..', 'svg');

async function get(path: string): Promise<Response> {
  const res = await fetch(cdn + path);
  if (!res.ok) throw new Error(`${cdn}${path}: ${res.status} ${res.statusText}`);
  return res;
}

const manifest = (await (await get('/icons.json')).json()) as IconManifest;
const wanted = new Set<string>();

for (const icon of manifest.icons) {
  if (!SLUG.test(icon.slug)) {
    console.warn(`skipping ${JSON.stringify(icon.slug)}: not a kebab-case slug`);
    continue;
  }
  wanted.add(icon.slug);
  const dir = join(root, icon.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'light.svg'), await (await get(icon.light)).text());
  if (icon.dark) await writeFile(join(dir, 'dark.svg'), await (await get(icon.dark)).text());
  else await rm(join(dir, 'dark.svg'), { force: true });
  console.log(`${icon.slug}${icon.dark ? '' : ' (light only)'}`);
}

await mkdir(root, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isDirectory() && !wanted.has(entry.name)) {
    await rm(join(root, entry.name), { recursive: true });
    console.log(`removed ${entry.name}`);
  }
}
console.log(`${wanted.size} icon(s) from ${cdn}`);
