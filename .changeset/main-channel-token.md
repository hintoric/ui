---
'@hintoric/ui': patch
---

Fix `Link` and `Divider` rendering their light colours in dark mode.

Joy UI remaps its "main" palette channel per colour scheme — palette step 500
in light, step 400 in dark (`extendTheme.js`). This project had no `main` token
at all, so components that want "the" colour rather than a variant slot
hardcoded step 500 and never changed when the scheme did. A variant-less
`Link` stayed at `#0B6BCB` on a dark page where Joy renders `#4393E4`, and the
`Divider` line kept the light neutral channel, so it read too dark against a
dark surface.

New `--color-{primary,neutral,danger,success,warning}-main` tokens carry the
remap, and `Link` and the divider token now read them.

Found by the first dark-mode assertions the visual regression suite has ever
had: until now every one of its 1248 screenshots and every computed-style
comparison ran in light mode only.
