# KLM-inspired look for `@hintoric/ui` — design

Date: 2026-10-27. Status: agreed in conversation and checked by a builder review. Pending the
user's approval of this document.

## Intent

`@hintoric/ui` keeps Joy UI's **API and component structure**, but stops looking like Joy. It takes
on a rounder, flatter, warmer look inspired by KLM's 2026 web refresh. The user saw KLM's new
"Meine Reise" pages (rounded hero images, pill chips, 24px cards on a warm beige page) and wants
that feel for hintoric.

"Inspired by" is meant literally: we take KLM's **shape language and warm neutral/status
palettes**. We do not take KLM's brand blue, its licensed typeface (Universal Sans) or anything
else that would make a hintoric screen read as KLM.

## Where the inspiration comes from

KLM and Air France share one Angular component library ("aviato", `bwc-*` components, `--aero-*`
tokens). Its public Storybook is `https://storybook.klm.com` (defaults to the Air France theme;
add `&globals=selectedStylesheetID:kl` to an `iframe.html?id=…` URL to see KLM).

- **New look: v47.0.0.** Served on klm.de (`window.bwStaticGlobal.componentsVersion === "47.0.0"`,
  stylesheet `/assets/css/kl.<hash>.css`, ~530 KB).
- **Old look: v43.2.0.** Still served by KLM's login app on `identity.airfranceklm.com`
  (`/login/assets/kl/css/blueweb.css?v=14.2.0`, which references `components/43.2.0/…`).

Diffing the two `:root` token sets (resolved `var()` chains, formatting-only changes ignored)
gives 320 real changes. The ones that matter here:

| Area | v43.2.0 | v47.0.0 |
|---|---|---|
| Radius default / strong / stronger / strongest | 4 / 8 / 16 / 24px | **12 / 16 / 24 / 32px** |
| Radius subtle / subtler | 2 / 2px | 8 / 4px |
| New radius tokens | — | `expressive` 24→32px, `expressive-control` 999px, `expressive-signature` 40→56px (mobile→≥600px) |
| Border width default | 1px | **1.5px** |
| Shadow level 1 | `0 2px 6px 1px rgba(0,0,0,.08)` | **none** |
| Neutral scale | cool blue-grey (`#f6f7f8` … `#1f272c`) | **warm stone** (`#f5f1ed` … `#161514`) |
| Page background | `#f6f7f8` | `#f5f1ed` |
| Status colours | Joy-like | re-tuned (coral red, forest green, earthier orange, vivid soft surfaces) |
| Typography | Universal Sans | unchanged |

Where KLM applies them: buttons, inputs, selects, menus, dialogs, tooltips → 12px; cards → 24px
with no border; bottom sheet → 32px; chips, radios, toggles, badges → pill. KLM has **no dark
mode** (only "inverted" dark surfaces).

## Decisions made by the user

1. **Direction "C"**: KLM's shapes **plus** KLM's warm tones, our own primary blue. (Chosen over
   "today's Joy look" and "KLM shapes with today's cool colours" in a side-by-side mockup.)
2. **Replace, don't add.** The new look replaces the Joy look. There is no theme switch and no
   Joy-look fallback.
3. **Dark mode: today's Joy dark colours, new shapes.** Light is warm, dark stays cool. (Chosen
   over a derived "warm stone" dark.)
4. **Joy stays the test oracle, themed.** The visual tests keep rendering real `@mui/joy` next to
   our components, but Joy gets the new look through `extendTheme`. The tests then check "our
   component is built correctly from these tokens", not "looks like stock Joy".
5. **Local first.** Built on this branch and reviewed locally (playground, docs, both schemes)
   before anything is merged or published.

## The look

### Shape

- **Radius scale** (Joy's slot names, new values):

  | Token | Today (Joy) | New | KLM equivalent |
  |---|---|---|---|
  | `--radius-xs` | 2px | 4px | `subtler` |
  | `--radius-sm` | 6px | 12px | `default` |
  | `--radius-md` | 8px | 16px | `strong` |
  | `--radius-lg` | 12px | 24px | `stronger` |
  | `--radius-xl` | 16px | 32px | `strongest` |

  Components keep the slot Joy gives them, so Button/Input/Select/Menu (`sm`) move to 12px and
  ModalDialog (`md`) to 16px. **Card is the one deliberate slot change:** Joy's Card and ours use
  `md`, which would give 16px; Card moves to `lg` (24px) to match KLM's cards. The oracle mirrors it
  with a `JoyCard` override. ModalDialog, built on the same root in Joy, stays on `md`. Pill shapes
  (Chip, Switch, Badge, Avatar…) stay pills. *(Mapping and the Card slot change are my call; the
  mapping lines up step for step with KLM's scale.)*
- **Component outlines are 1.5px** wherever Joy draws a 1px border: outlined variants, Input,
  Select, Textarea, Autocomplete, Checkbox/Radio boxes, outlined Card/Sheet. Dividers, table rules
  and the focus ring keep today's thickness. Chromium snaps borders to whole device pixels, so
  1.5px shows as 1px on 1× displays and as 1.5px on HiDPI. That is accepted; klm.de behaves the
  same. *(My call.)*
- **Flat at rest.** `--shadow-xs` becomes `none` (it is what Joy puts on inputs and resting
  surfaces). `--shadow-md` / `--shadow-lg` stay for floating surfaces (Menu, Popover, Select
  listbox, Modal, Drawer, Snackbar). *(My call.)*
- **Cards at rest (light):** white, no visible border, no shadow, sitting on the warm page
  background.
- **Cards at rest (dark):** keep today's outline. Joy's dark palette puts the card surface
  (`#0B0D0E`) on a black canvas at about 1.08:1, so a borderless dark card would vanish. The
  mechanism therefore has to be scheme-dependent (not simply a different default variant), and the
  oracle override applies to light only. *(My call; it also keeps "dark only changed shape" true.)*
- **The library still doesn't paint `body`.** A borderless white Card is only visible on the
  canvas, so consumers put `bg-canvas` on their page root (already the documented pattern). The
  playground and docs do; the release notes say so. *(My call.)*

### Colour — light scheme

Mostly only the **raw palette stops** change. Every per-variant semantic token keeps Joy's formula
(which stop `soft`/`solid`/`outlined`/`plain` reads, including neutral's -700 override). That is
what lets the themed Joy oracle stay meaningful. *(My call.)*

**One exception, neutral fills in light.** The canvas is neutral-100, and under Joy's formula so
are `neutral-soft-bg`, the neutral plain/outlined hover backgrounds and every
`*-solid-disabled-bg`. Anything placed straight on the page would lose its fill or its hover
(default Avatar, Chip, Alert; IconButton, ListItemButton, Tab hover; a disabled solid Button). So in
light, every **neutral fill** (soft background, hover, active, disabled backgrounds) moves **one
stop darker**: 100→200, 200→300, 300→400. Text colours don't move, other colours don't move, dark
doesn't move. The approved mockup already showed the neutral chip at neutral-200 (`#EBE2DB`). The
oracle expresses this through Joy's `palette.neutral.*Bg` tokens, and `@hintoric/email`'s
`variantTokens()` follows. *(My call.)*

- **Primary:** unchanged (`#0B6BCB` scale).
- **Neutral:** 50–300 taken from KLM directly; 400–900 keep Joy's OKLCH lightness per stop
  (so text/icon contrast stays where Joy had it) with KLM's warm hue and chroma at that lightness.
  The 50–300 stops are where KLM's look lives (page, hover, borders); the dark half is text and
  icons, where KLM's own stops are lighter than Joy's and would cost contrast.

  | Stop | Joy today | New |
  |---|---|---|
  | 50 | `#FBFCFE` | `#FBF7F3` |
  | 100 | `#F0F4F8` | `#F5F1ED` |
  | 200 | `#DDE7EE` | `#EBE2DB` |
  | 300 | `#CDD7E1` | `#D4CCC6` |
  | 400 | `#9FA6AD` | `#AAA49E` |
  | 500 | `#636B74` | `#6E6966` |
  | 600 | `#555E68` | `#605C5A` |
  | 700 | `#32383E` | `#393735` |
  | 800 | `#171A1C` | `#1A1918` |
  | 900 | `#0B0D0E` | `#0D0C0C` |

- **Status:** start from KLM's 50–900 stops index for index (KLM's 950 is dropped):
  - `danger` ← KLM red: `#FFEEF6 #FFD9E3 #FEBEC6 #FD989E #FC6063 #D42A1E #A02118 #751811 #4C100B #2A0906`
  - `success` ← KLM green: `#DAFADA #B7F1BA #99DEA6 #73C58B #40A469 #287D52 #1C5D47 #0F433A #0A2B26 #051714`
  - `warning` ← KLM orange: `#FDEFD9 #FCE0B2 #F9C674 #F5A31E #CA8312 #A3680C #764905 #583400 #382100 #1D1200`

  (Each list is 50, 100, 200 … 900.)

  **50–300 stay exactly as listed.** They are the fills, and their saturation is the "vivid soft
  surfaces" from the mockup (mint success, apricot warning).

  **400–900 get darkened until contrast holds (user's decision).** Taken as is, KLM's stops fail
  pairs that pass under Joy. Examples: warning-500 text on the canvas is 4.11:1 (Joy 5.41); plain
  text on its own hover fill is 3.62–3.93:1; success-500 on its active fill is 3.22:1. So keep
  KLM's hue and chroma (OKLCH) and lower only the lightness of 400–900. Go just far enough that
  **every text colour meets ≥ 4.5:1 against every background the variant formula pairs it with,
  in every state** (resting, hover, active), plus status text on the canvas and on white. Result:
  status text a little darker than KLM's, fills unchanged. The builder derives the values and
  records them here together with the resulting contrast table.
- **Page and surfaces:** `--color-canvas` (page) becomes neutral-100 `#F5F1ED`;
  `--color-surface` (Card/Sheet resting background) and `--color-surface-popup` become white.

### Colour — dark scheme

Unchanged from today: Joy's cool neutral and Joy's status stops, primary unchanged.

Because the light raw stops change, the dark block has to **redeclare the raw neutral, danger,
success and warning stops with today's Joy values** rather than inherit them.

### Typography

Unchanged: same font stack, same type scale, same weights.

## Testing

The hard requirement in `CLAUDE.md` stays in force: every component, every variant × colour ×
scheme, interactive states, computed-style equality including font and sizing, screenshot
baselines. What changes is what Joy is rendered with.

- **One shared oracle theme.** A single module (e.g. `packages/ui/src/visual/joyTheme.ts`) builds
  the Joy theme with `extendTheme`: light palette (neutral, danger, success, warning,
  `background.body` / `background.surface`), dark palette left at Joy's defaults, radius, shadows,
  and outline width. Every `<JoyCssVarsProvider>` in the visual suite (196 sites today, plus the
  `darkMode.tsx` helpers) passes it.
- **Where `extendTheme` can't say it** (likely candidates: the 1.5px outline, the borderless Card),
  put a `components.Joy*.styleOverrides` / `defaultProps` entry in that same module, each with a
  comment naming the decision it encodes. Never weaken or skip an assertion to make a
  comparison pass.
- **Every baseline is retaken, Joy's included.** Joy's images move because of the theme, which is
  the one explained reason for them to move. An unexplained difference still means stop. That is
  about 5,400 PNGs (≈5,357 in `packages/ui`, 60 in `packages/email`), so they are reviewed **per
  component**, not one file at a time: a generated contact sheet per component puts the themed-Joy
  and our images side by side for both schemes. The builder reviews every sheet. The user reviews
  in the playground and can open any sheet. *(My call.)*
- **The 1.5px outline must be testable.** At the suite's current capture scale, 1px and 1.5px look
  the same and compute the same. At least the outline-bearing components need an assertion that
  can tell them apart (e.g. a device-pixel-ratio-2 run for those tests). How is the builder's call.
- **Contrast is checked automatically.** A test computes the contrast ratio of every text/background
  pair the light variant formula produces (all colours × variants × resting/hover/active, plus
  status text on canvas and white) and fails below 4.5:1. That keeps the darkened status stops
  honest and catches a later palette edit that breaks them.
- **jsdom unit tests** that encode old token values or class names are updated.
- **`@hintoric/email`** follows in the same branch: `src/tokens.ts`'s light palette gets the new
  stops, its dark scheme keeps Joy's, and the email parity suite (against the built `@hintoric/ui`
  `dist/`) must pass. Radius/border values the email components inline follow the new scale where
  email can render them.

## Documentation to update

- `CLAUDE.md`: the opening line ("Joy UI's look and API"), the hard requirement's wording (Joy
  rendered with the shared oracle theme), and "Don't re-derive what's already been
  reverse-engineered" — light tokens are now derived from KLM v47 by the rules above; dark tokens
  and all formulas are still Joy's.
- Comments in `packages/ui/src/styles/theme.css` that say a changed value was copied from Joy.

## Release

- Changesets: **major** for `@hintoric/ui` (the user's decision) and **major** for
  `@hintoric/email`, whose rendered look changes the same way *(my call)*. Write them for someone
  reading release notes: what changed visually, that no props changed, that dark mode only changed
  shape, and that pages should put `bg-canvas` on their root.
- Nothing is merged or published until the user has looked at it locally.

## Goals, non-goals, anti-goals

**Goals:** the new look across every `@hintoric/ui` component in both schemes; the same test
strength as today; email in step with the web library.

**Non-goals:** keeping the Joy look as an option; new components or props; typography changes;
a new primary colour; light-mode islands inside dark regions (still unsupported).
`@hintoric/icons` is also out of scope (user's decision). Its light illustrations bake in cool
blue-greys (`#8f9ba3`, `#8c98a1` …) that will look cool on the warm canvas. They get regenerated
with Recraft in a separate step after this lands. The release notes say the illustrations don't
match yet.

**Anti-goals (a failure even if everything is green):**
- A hintoric screen that reads as KLM (their blue, their font, their imagery).
- Tests that pass because the oracle was bent to match us instead of being configured with the
  agreed tokens.
- Dark mode that quietly turns warm because a raw stop leaked from the light block.
- Text/background pairs that met WCAG AA under Joy and no longer do.

## Constraints

- Light tokens live in Tailwind's `@theme { }` (compiles to `:root`); dark ones under
  `[data-color-scheme="dark"]`. The scheme is document state; never nest scopes.
- The wrapper-scope helpers in `visual/darkMode.tsx` put the dark attribute on an inner element.
  Custom properties declared on `:root` are inherited as already-resolved values, so any token the
  dark block does not redeclare keeps its light value there. Redeclaring the raw stops alone is
  not enough for those helpers; check the `DarkTokens` grid.
- Public token names (`--color-*`, `--radius-*`, `--shadow-*`, `bg-canvas` …) do not change; only
  their values.

## Left to the builder

- How the 1.5px outline is implemented (a token vs. per-component classes) and how Card ends up
  borderless at rest (default variant, a card-specific border token, …), as long as the Joy oracle
  is configured to the same result.
- Values for `--color-surface-1…3` and `--color-divider` in light, keeping their role (stepping
  away from the canvas) on the new canvas.
- Whether to keep a copy of the KLM token diff in the repo.
- Order of work across components.

## Done when

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --filter @hintoric/ui test:visual` and
  `pnpm --filter @hintoric/email test:visual` all pass, including the contrast test.
- Every component's contact sheet has been reviewed.
- The playground and docs show the new look in light and dark.
- The changesets exist, and the user has reviewed the branch locally.
