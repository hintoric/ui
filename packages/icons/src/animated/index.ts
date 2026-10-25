import { createAnimatedIcon, type HintoricAnimatedIcon } from './createAnimatedIcon';
import { cdnSources } from './slots';

/*
 * Written by hand, unlike the static icons: there is nothing to generate
 * from. An animated icon's files only live on the CDN, under
 * assets/icons/<slug>/ — <slug>.json, dark-slots.json, light.svg, dark.svg.
 * "AnimatedIcon" in the name keeps a static icon with the same slug free.
 */
export const FormReadingLensAnimatedIcon = /* @__PURE__ */ createAnimatedIcon({
  slug: 'form-reading-lens',
  name: 'FormReadingLensAnimatedIcon',
  cdn: cdnSources('form-reading-lens'),
});

/** Every animated icon, sorted by slug — for galleries and pickers. Importing it pulls in all of them. */
export const animatedIcons: readonly HintoricAnimatedIcon[] = [FormReadingLensAnimatedIcon];
