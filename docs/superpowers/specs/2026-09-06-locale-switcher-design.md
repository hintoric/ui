# LocaleSwitcher

Datum: 2026-09-06 · Status: Entwurf

Ein kompakter Umschalter für die Anzeigesprache, für die Ecke einer Kopfzeile.

## Warum in dieser Bibliothek

`hintoric/core` braucht ihn zuerst, aber er ist in jeder Anwendung derselbe: eine Schaltfläche mit
der aktuellen Sprache, ein Menü mit den verfügbaren. Nichts daran ist anwendungsspezifisch.

## Was er ausdrücklich nicht tut

**Er kennt keine i18n-Bibliothek.** Weder i18next noch react-intl, weder `useTranslation` noch einen
Sprachkontext. Er nimmt `locales`, `value` und `onChange` — mehr nicht.

Das ist die tragende Entscheidung. Kennte er i18next, erbte jede Anwendung, die `@hintoric/ui`
einbindet, diese Wahl mitsamt Abhängigkeit. Eine Darstellungsbibliothek darf nicht festlegen, womit
ihre Konsumenten übersetzen.

Er übersetzt auch die Sprachnamen nicht selbst. `label` kommt vom Aufrufer — der weiß, ob dort
„Deutsch", „German" oder „DE" stehen soll.

## API

```tsx
export interface LocaleOption {
  value: string;
  label: React.ReactNode;
}

export interface LocaleSwitcherProps {
  locales: readonly LocaleOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: JoyVariant;              // default 'plain'
  color?: JoyColor;                  // default 'neutral'
  size?: 'sm' | 'md' | 'lg';         // default 'sm'
  'aria-label'?: string;
}
```

`plain` und `sm` als Vorgabe, weil der Platz eine Kopfzeilenecke ist — dort ist ein rahmenloses,
kleines Bedienelement das Übliche. Wer ihn prominenter braucht, setzt `variant`.

Ein `value`, das in `locales` nicht vorkommt, ist kein Fehler: Die Schaltfläche zeigt dann `value`
selbst. Das passiert genau dann, wenn der Browser eine Sprache meldet, die die Anwendung nicht
anbietet — dort abzustürzen wäre die schlechteste Antwort.

## Aufbau

Aus vorhandenen Bausteinen, nicht aus neuem Markup:

```
Dropdown
└── MenuButton     zeigt das Label zum aktuellen value
└── Menu
    └── MenuItem   je Sprache, selected={locale.value === value}
```

Kein `Select`: Das ist ein Formularsteuerelement mit Platzhalter und Formularbreite. Der Umschalter
gehört in eine Ecke und ist kein Eingabefeld.

## Visuelle Regressionsabdeckung

Die Regel dieses Repositories lautet: jede Komponente Seite an Seite mit dem echten `@mui/joy`.
**Der `LocaleSwitcher` ist davon ausgenommen**, wie `RelativeTime` es ist — mit einer stärkeren
Begründung als dort.

Joy UI hat keinen `LocaleSwitcher`; es gibt nichts zu vergleichen. Wichtiger aber: Der Umschalter
bringt **keine eigene Optik mit**. Er besteht ausschließlich aus `Dropdown`, `MenuButton`, `Menu`
und `MenuItem`, und die tragen bereits je eine vollständige Joy-verglichene Abdeckung. Ein zweiter
Vergleich prüfte dieselben berechneten Stile noch einmal und fände nichts Neues.

Was er dennoch bekommt, weil eine Komposition eigene Fehler hat — falsche Größenweitergabe, ein
verrutschtes Menü, ein fehlender `selected`-Zustand:

- **Self-Baseline-Screenshots** über `toMatchScreenshot()` gegen die eigenen vorherigen Bilder:
  geschlossener Zustand, geöffnetes Menü, und der geöffnete Zustand mit markierter Auswahl.
- **Berechnete Stile** dort, wo die Komposition etwas weitergibt statt es zu erben: `size` muss an
  `MenuButton` und `Menu` durchschlagen. Geprüft wird `minHeight` des Knopfes für jede der drei
  Größen — schluckte die Komponente `size`, fiele genau das auf.

Kein Variant-mal-Color-Kreuzprodukt: Diese Achse liegt vollständig bei `MenuButton`, das sie schon
gegen Joy prüft.

## Tests in jsdom

- Zeigt das Label zur aktuellen Sprache, nicht deren Schlüssel.
- Öffnen listet alle `locales`.
- Ein Klick ruft `onChange` mit dem Wert, **nicht** mit dem Label.
- Die aktuelle Sprache trägt `selected`.
- Ein `value` außerhalb von `locales` zeigt `value` selbst, statt leer zu bleiben.

## Was draußen bleibt

Keine Flaggen. Eine Flagge steht für ein Land, nicht für eine Sprache — Deutsch ist nicht Deutschland,
Englisch nicht das Vereinigte Königreich, und Spanisch gehört keinem. Wer trotzdem eine will, setzt
sie über `label`.

Keine automatische Erkennung der Browsersprache. Der Umschalter zeigt, was ihm gegeben wird; woher
der Wert kommt, entscheidet die Anwendung.

Kein Persistieren der Auswahl. Auch das ist Sache der Anwendung — `localStorage`, ein Cookie oder ein
Serverprofil sind Entscheidungen, die eine Darstellungskomponente nicht treffen darf.

## Abnahme

Fertig, wenn `pnpm test` und `pnpm test:visual` grün sind, die drei Baseline-Screenshots unter
`__screenshots__/` liegen und angesehen wurden, und die Playground-App den Umschalter mit zwei
Sprachen zeigt.

---

## Addendum, 2026-09-06: flags, a border by default, and pass-through props

Three changes after the first version shipped.

**The default variant is now `outlined`, not `plain`.** The original reasoning
— the usual home is a header corner, where a border is noise — held for that
one placement and nowhere else. A control that renders as bare text does not
read as a control. `variant="plain"` still gives the old look for headers that
want it.

**Unrecognised props reach the trigger button.** `LocaleSwitcherProps` now
extends `React.ComponentPropsWithoutRef<'button'>` and spreads the rest onto
`MenuButton`, so `className`, `data-*` attributes and event handlers work. The
previous closed prop list meant callers could not label, style or target the
trigger at all beyond `aria-label`.

**Country flags, on by default.** Rendered from `country-flag-icons`, opt out
with `flags={false}`.

### Why the 1x1 set and a circular mask

The flags are round. The square `1x1` set takes a circular mask cleanly, where
the `3x2` set would have to be cropped first or render as an ellipse. The 1x1
SVGs carry a genuinely square viewBox (`US.svg` is `59.85 0 342 342`, cropped
from the 513-wide original), so `size-*` plus `rounded-full` is enough — no
wrapper element and no `object-fit` needed. Sizing uses `size-*` rather than a
bare height so width and height stay locked: a round flag that is off-square
reads as a bug, not a style.

### Why a dependency and not emoji

Unicode regional-indicator flags (🇩🇪) need no dependency and no bundle, but
Windows renders them as a two-letter pair rather than a flag — on the platform
where most users would see them, they do not work. `@mui/icons-material` was
considered and does not apply: it ships Material symbols, not country flags.

### Why it is external rather than bundled

`country-flag-icons`' React set is 5.3 MB on disk, which is misleading: built
and minified it is **229 kB (52 kB gzipped)** for every country. Still enough
to matter against a 613 kB library, and it would be paid by every consumer
including those that never render a switcher.

Unlike Base UI — bundled deliberately, because its deep subpath imports carry a
CJS `require('react')` fallback that throws in a browser ESM context — this is
a plain ESM barrel of SVG components with nothing to trip over. So
`country-flag-icons/react/1x1` is listed in Rollup's `external`. It stays a
normal `dependencies` entry, our `dist` is unchanged (613.79 kB, +0.5 kB), and
it drops out entirely for anyone who tree-shakes `LocaleSwitcher` away.

### Which locales get a flag

A flag needs a country, and a language is not one. The country comes from
`LocaleOption.region` when given, otherwise from the tag's own region subtag:
only a two-letter uppercase subtag counts, so `de-DE` resolves to `DE` while
`zh-Hant`'s four-letter script subtag is correctly ignored.

A locale with no determinable country simply gets no flag. This is the right
outcome rather than a gap to fill: `en` deliberately belongs to no single
country, and picking one for it would be a political statement the component
has no business making. Callers who want a flag there can say which with
`region`.

The flags are `aria-hidden`: the label beside each one already names the
language, so announcing both would just repeat it.
