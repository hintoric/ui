import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const stylesDir = resolve(import.meta.dirname, '../src/styles');

/**
 * Source of the published `dist/tailwind.css`: the library's own Tailwind
 * input for a consumer who runs Tailwind themselves, used *instead of*
 * `styles.css`. One Tailwind build that scans both the consumer's markup and
 * our bundle emits a single, correctly sorted utilities layer. Adding a second
 * build next to the prebuilt `styles.css` does not: it re-emits utilities the
 * library already uses later in the same `utilities` layer, so a library
 * element with `p-2 px-4` ends up with 8px of horizontal padding instead of 16px
 * as soon as the consumer's markup contains `p-2` on its own.
 *
 * `theme.css` is inlined so the file has no relative imports into a `src/`
 * that isn't published. The `@source` is relative to the emitted file, i.e.
 * `dist/index.js`.
 */
export function tailwindEntry(): string {
  const theme = readFileSync(resolve(stylesDir, 'theme.css'), 'utf8');
  const library = readFileSync(resolve(stylesDir, 'library.css'), 'utf8');
  const themeImport = '@import "./theme.css";';
  if (!library.includes(themeImport)) throw new Error(`library.css no longer contains ${themeImport}`);
  if (/@import\s/.test(theme)) throw new Error('theme.css must stay free of @import to be inlined');
  return [
    '/*',
    ' * @hintoric/ui as Tailwind CSS v4 input. Use it instead of `@hintoric/ui/styles.css`',
    ' * when your app runs its own Tailwind:',
    ' *',
    ' *   @import "tailwindcss";',
    ' *   @import "@hintoric/ui/tailwind.css";',
    ' */',
    library.replace(themeImport, theme.trim()),
    '@source "./index.js";',
    '',
  ].join('\n');
}
