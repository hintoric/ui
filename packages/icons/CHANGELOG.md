# @hintoric/icons

## 0.5.0

### Minor Changes

- 26cf47b: Animated icons, starting with `FormReadingLensAnimatedIcon` for long-running "reading the form" states. They play a Lottie animation from the CDN, follow `data-color-scheme` like the static icons (a scheme change reloads the animation in the other colours), and show the still image instead under reduced motion: `<html data-reduced-motion="reduce">` from `@hintoric/ui`'s `ReducedMotionProvider`, or else the system setting. The player, `lottie-web`, is a new dependency that loads lazily on the first animated icon, so it stays out of your main bundle. Also new: `animatedIcons` and `createAnimatedIcon`.

## 0.4.0

### Minor Changes

- 359a7dd: New illustration `CompanyDataFoundIcon` with a light and a dark variant: a small shop that holds up a magnifying glass, gives a thumbs up and carries a blue check badge. Use it where hintoric has found a company's details (name, address, register entry) and asks the user to review them, for example in the "Firmendaten gefunden" email.

## 0.3.1

### Patch Changes

- 1ced478: `EmptyTemplatesUploadIcon` is redrawn in the style of the other illustrations: a smiling sheet of paper holding an upload badge over its head, instead of a flat outline sheet with an arrow badge.

## 0.3.0

### Minor Changes

- 4ecdbd2: New illustrations `EmptyBankAccountsIcon` and `ErrorNotFoundIcon`, each with a light and a dark variant: a waving bank card holding a plus badge, for an empty state that asks the user to add a bank account, and a puzzled magnifying glass for a "not found" error.

## 0.2.0

### Minor Changes

- ff12697: New illustration `EmptyOpenMailIcon`, with a light and a dark variant: an open envelope with a letter, for an empty state that asks the user to open a mail to see its workflows.

## 0.1.1

### Patch Changes

- ae71158: Icons whose artwork does not start at the top-left corner of its canvas no longer render shifted up and to the left and cut off. All icons now also have the same margin around their artwork, so they line up when used side by side.

## 0.1.0

### Minor Changes

- c31c4f0: Five new illustrations, each with a light and a dark variant: `AuthLoginKeyIcon` and `AuthRegistrationClipboardIcon` for the sign-in and registration screens, `EmptyNoPreviewIcon` for a missing document preview, and `ErrorLoadFailedIcon` and `ErrorServiceUnreachableIcon` for pages that could not load or a service that cannot be reached.
- 281417f: New package: `@hintoric/icons` ships hintoric's icons and spot illustrations as React components. Each icon renders inline as SVG and switches between its light and dark variant with `data-color-scheme` on `<html>`, which `ColorSchemeProvider` from `@hintoric/ui` sets. Pin a variant with `mode="light"` or `mode="dark"`, name it for screen readers with `title`, and find its CDN URLs on `Icon.cdn`. The `icons` export lists every icon, for galleries and pickers.
