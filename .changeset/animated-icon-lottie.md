---
'@hintoric/ui': minor
---

New `AnimatedIcon`: plays an animated hintoric icon (Lottie) from the CDN, e.g. `<AnimatedIcon name="form-reading-lens" />` for a long-running loading state. It follows `data-color-scheme` on `<html>` and reloads with the dark colours when the scheme changes, shows the still image instead under reduced motion (`ReducedMotionProvider` or the system setting), and is decorative unless you give it a `title`. The player, `lottie-web`, is a new dependency that loads lazily on the first animated icon, so it stays out of your main bundle.
