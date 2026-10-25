---
'@hintoric/icons': minor
---

Animated icons, starting with `FormReadingLensAnimatedIcon` for long-running "reading the form" states. They play a Lottie animation from the CDN, follow `data-color-scheme` like the static icons (a scheme change reloads the animation in the other colours), and show the still image instead under reduced motion: `<html data-reduced-motion="reduce">` from `@hintoric/ui`'s `ReducedMotionProvider`, or else the system setting. The player, `lottie-web`, is a new dependency that loads lazily on the first animated icon, so it stays out of your main bundle. Also new: `animatedIcons` and `createAnimatedIcon`.
