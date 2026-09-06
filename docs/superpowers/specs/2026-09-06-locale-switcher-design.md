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
