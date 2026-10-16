import type { JSX, SVGProps } from 'react';

export type IconMode = 'auto' | 'light' | 'dark';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'dangerouslySetInnerHTML' | 'mode' | 'title'> {
  /** Width and height. CSS sizing (`className="size-40"`) wins over it. @default '1em' */
  size?: number | string;
  /**
   * `auto` follows `data-color-scheme` on `<html>`, as set by `@hintoric/ui`'s
   * ColorSchemeProvider; `light` and `dark` pin one variant, for example on a
   * surface that is dark in both schemes. @default 'auto'
   */
  mode?: IconMode;
  /** Accessible name. Without it the icon is decorative and hidden from assistive technology. */
  title?: string;
}

export interface IconDefinition {
  slug: string;
  name: string;
  viewBox: string;
  /** Nested `<svg>` markup, sanitised by scripts/svg.ts at generation time. */
  light: string;
  dark: string | null;
  cdn: { light: string; dark: string | null };
}

export interface HintoricIcon {
  (props: IconProps): JSX.Element;
  displayName: string;
  slug: string;
  /** The same icon on the CDN, for `<img>`, emails or anything that is not React. */
  cdn: IconDefinition['cdn'];
}

// Hoisted into <head> once however many icons render (React 19 dedupes a
// <style> by href). The dark variant only shows under a dark scheme, so an
// icon without CSS support still renders its light variant, never both.
const CSS =
  '.hi-icon-dark{display:none}' +
  '[data-color-scheme="dark"] .hi-icon-auto>.hi-icon-light{display:none}' +
  '[data-color-scheme="dark"] .hi-icon-auto>.hi-icon-dark{display:inline}';

export function createIcon(def: IconDefinition): HintoricIcon {
  function Icon({ size = '1em', mode = 'auto', title, className, ...props }: IconProps) {
    const auto = mode === 'auto' && def.dark !== null;
    // A pinned dark variant must not carry .hi-icon-dark, which another,
    // automatic icon's stylesheet hides outside the dark scheme.
    const markup = auto
      ? def.light + def.dark
      : mode === 'dark' && def.dark
        ? def.dark.replace('class="hi-icon-dark"', 'class="hi-icon-pinned"')
        : def.light;
    return (
      <>
        {auto && (
          <style href="hintoric-icons" precedence="default">
            {CSS}
          </style>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={def.viewBox}
          width={size}
          height={size}
          data-icon={def.slug}
          className={[auto && 'hi-icon-auto', className].filter(Boolean).join(' ') || undefined}
          {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
          {...props}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      </>
    );
  }
  Icon.displayName = def.name;
  Icon.slug = def.slug;
  Icon.cdn = def.cdn;
  return Icon;
}
