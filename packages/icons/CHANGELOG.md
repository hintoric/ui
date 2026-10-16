# @hintoric/icons

## 0.1.0

### Minor Changes

- c31c4f0: Five new illustrations, each with a light and a dark variant: `AuthLoginKeyIcon` and `AuthRegistrationClipboardIcon` for the sign-in and registration screens, `EmptyNoPreviewIcon` for a missing document preview, and `ErrorLoadFailedIcon` and `ErrorServiceUnreachableIcon` for pages that could not load or a service that cannot be reached.
- 281417f: New package: `@hintoric/icons` ships hintoric's icons and spot illustrations as React components. Each icon renders inline as SVG and switches between its light and dark variant with `data-color-scheme` on `<html>`, which `ColorSchemeProvider` from `@hintoric/ui` sets. Pin a variant with `mode="light"` or `mode="dark"`, name it for screen readers with `title`, and find its CDN URLs on `Icon.cdn`. The `icons` export lists every icon, for galleries and pickers.
