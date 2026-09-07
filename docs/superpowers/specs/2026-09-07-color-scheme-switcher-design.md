# Farbschema-Umschalter

Datum: 2026-09-07 · Status: Entwurf

Sechs Darstellungsformen für dieselbe Entscheidung — Hell, Dunkel oder dem Betriebssystem folgen —
plus der Systemmodus im `ColorSchemeProvider`, der sie alle trägt.

## Warum in dieser Bibliothek

Weil zwei Konsumenten im eigenen Repository ihn bereits nachbauen, unabhängig voneinander und beide
unvollständig:

- `apps/docs/src/Layout.tsx` malt ein eigenes `SunIcon` und `MoonIcon` und schaltet mit
  `setMode(mode === 'light' ? 'dark' : 'light')`.
- `apps/playground/src/App.tsx` schaltet mit derselben Zeile, nur ohne Icons.

Keiner der beiden kennt die Betriebssystemeinstellung. Wer `@hintoric/ui` einbindet, schreibt heute
dieselben zwanzig Zeilen ein drittes Mal — und lässt dabei denselben Modus weg.

## Das Fundament: `ColorSchemeProvider` lernt `system`

Ohne diesen Teil hat keine der sechs Formen etwas darzustellen.

```ts
export type ColorSchemeMode = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

interface ColorSchemeContextValue {
  mode: ColorSchemeMode;              // was der Nutzer gewählt hat
  resolvedMode: ResolvedColorScheme;  // was tatsächlich gemalt wird
  setMode: (mode: ColorSchemeMode) => void;
}
```

`defaultMode` wechselt von `'light'` auf `'system'`. Das ist die eigentliche Verhaltensänderung: Wer
nichts konfiguriert, bekommt ab jetzt die Betriebssystemeinstellung statt Hell.

### Auflösung und Reihenfolge

1. `localStorage['hintoric-color-scheme']`, wenn der Wert einer der drei Modi ist.
2. Sonst `defaultMode`.

`resolvedMode` ist bei `'light'` und `'dark'` der Modus selbst. Bei `'system'` kommt er aus
`window.matchMedia('(prefers-color-scheme: dark)')`, angebunden über `useSyncExternalStore`:

- Der Abonnent hängt an `change` der MediaQueryList, der Umschalter folgt also **live**, wenn die
  Betriebssystemeinstellung sich ändert, ohne Neuladen.
- `getServerSnapshot` liefert `'light'`. Damit hat serverseitiges Rendern einen definierten Wert
  statt eines Effekts, der nach der Hydration nachzieht und sichtbar umschlägt.

Das `data-color-scheme`-Attribut auf dem Wrapper-`div` trägt **`resolvedMode`**, nie `mode`.
`theme.css` kennt nur `light` und `dark`; ein `data-color-scheme="system"` würde stumm jeden
Dunkelmodus-Token verlieren und die Anwendung in den Hell-Werten von `:root` stehen lassen.

### Warum `'system'` persistiert wird

Naheliegend wäre, bei `setMode('system')` den Storage-Schlüssel zu **löschen** — kein gespeicherter
Wert und „folge dem System" sind auf den ersten Blick derselbe Zustand. Sie sind es nicht: Ein
Konsument mit `defaultMode="light"` würde die ausdrückliche Wahl seines Nutzers beim nächsten Laden
wieder mit Hell überschreiben. Also wird `"system"` geschrieben. Ein fehlender Schlüssel bedeutet
weiterhin genau eine Sache — „der Nutzer hat nie etwas gewählt, nimm `defaultMode`".

### Synchronisierung über Tabs

Ein `storage`-Listener übernimmt die Wahl aus anderen Tabs desselben Ursprungs. Sechs Zeilen, und es
ist der Vertrag, den ein persistierter Modus ohnehin verspricht: Zwei offene Tabs, die sich im
Farbschema widersprechen, liest jeder Nutzer als Fehler.

### Was das an bestehendem Code bricht

**`mode` ist nicht mehr der aufgelöste Wert.** Jedes `mode === 'dark' ? a : b` kompiliert weiter und
wird falsch, sobald der Modus `'system'` ist. Im Repo trifft das genau eine Stelle, und sie ist
lehrreich — `apps/docs/src/Layout.tsx:30` wählt das Logo:

```tsx
src={`…/${mode === 'dark' ? 'white' : 'black'}.svg`}
```

Im Dunkelmodus über `system` käme hier das schwarze Logo auf dunklem Grund. Die Migration ersetzt
solche Stellen durch `resolvedMode`. Für Konsumenten ist das ein Breaking Change auf Typebene, den
der Changeset benennen muss; `resolvedMode` steht als direkter Ersatz daneben.

**`defaultMode` wirkt anders.** Wer bisher ohne Angabe Hell bekam, bekommt jetzt die
Betriebssystemeinstellung. Wer das alte Verhalten will, setzt `defaultMode="light"`.

## Die Tailwind-Variante

In `src/styles/index.css`:

```css
@custom-variant dark (&:where([data-color-scheme="dark"], [data-color-scheme="dark"] *));
```

Ohne diese Zeile folgt jede `dark:`-Klasse, die ein Konsument schreibt, dem rohen
`prefers-color-scheme` — und widerspricht damit dem Umschalter, den wir ihm gerade gegeben haben.
Unsere eigenen Komponenten benutzen `dark:` nirgends (sie beziehen alles aus den Tokens), es geht
ausschließlich um das Markup der Konsumenten.

Für Tailwind selbst gibt es keine Umschalt-Bibliothek. Tailwind v4 liefert die `dark:`-Variante und
sonst nichts; der De-facto-Standard ist `next-themes`, das React-, nicht Tailwind-spezifisch ist.
Es kommt hier nicht in Frage: Unser Provider ist schon öffentliche API, `next-themes` schreibt auf
`<html>` statt auf ein inneres `div`, und eine Darstellungsbibliothek darf ihren Konsumenten keine
Runtime-Abhängigkeit für dreißig Zeilen `matchMedia` aufzwingen — dieselbe Linie, aus der
`LocaleSwitcher` keine i18n-Bibliothek kennt. Das Einzige, was `next-themes` wirklich besser löst,
ist der SSR-Flash über ein blockierendes Inline-Script. Das bleibt draußen (siehe unten).

## Die sechs Formen

| Export | Aufbau | Heimat | Modi |
| --- | --- | --- | --- |
| `ColorSchemeToggle` | `IconButton` | Kopfzeilenecke | 3, im Zyklus |
| `ColorSchemeMenu` | `Dropdown` → `MenuButton` + `Menu` + `MenuItem` | Kopfzeilenecke | 3, direkt |
| `ColorSchemeMenuItems` | nur die `MenuItem`s | fremdes Menü | 3, direkt |
| `ColorSchemeToggleGroup` | `ToggleButtonGroup` | Einstellungsseite | 3, direkt |
| `ColorSchemeSwitch` | `Switch` | Einstellungszeile | 2 |
| `ColorSchemeSelect` | `Select` + `Option` | Einstellungsformular | 3, direkt |

**`ColorSchemeToggle`** ist die knappste Form und die aus dem Joy-Tutorial: ein Klick zykelt
`system → light → dark → system`, das Icon zeigt den **gewählten** Modus, nicht den aufgelösten.
Wer `system` gewählt hat, soll das Monitorsymbol sehen — zeigte der Knopf dort die Sonne, wäre
„folgt dem System und ist gerade hell" nicht von „steht fest auf hell" zu unterscheiden.
Der Preis ist Entdeckbarkeit: Drei unbeschriftete Stufen muss man durchklicken, um sie zu finden.

**`ColorSchemeMenu`** ist deshalb die empfohlene Form für alles, was nicht extrem knapp sein muss:
`MenuButton` mit dem Icon des aktuellen Modus, darin drei beschriftete Einträge mit `selected` am
aktiven. Beschriftet, in einem Schritt anspringbar, und exakt das Muster von `LocaleSwitcher`.

**`ColorSchemeMenuItems`** ist derselbe Inhalt ohne Trigger, für Anwendungen, die schon ein
Benutzermenü oder eine Schublade haben und keinen zweiten Knopf daneben wollen. Es rendert ein
Fragment aus drei `MenuItem`s und nimmt keine eigene Umgebung an — das übergeordnete `Menu` gehört
dem Aufrufer.

Ein Fragment ist hier sicher, und das ist geprüft, nicht angenommen: `Menu.tsx` gibt `children`
unverändert an `BaseMenu.Popup` weiter, ohne `React.Children.map` und ohne `cloneElement`. Wo eine
Komponente ihre Kinder klont — `ToggleButtonGroup` tut genau das —, wäre ein Fragment als einzelnes
Kind eine Falle, weil die Klone am Fragment landen statt an den Einträgen. `ColorSchemeToggleGroup`
gibt seine Segmente deshalb als flache Liste aus, nicht in einem Fragment.

**`ColorSchemeToggleGroup`** zeigt alle drei Zustände gleichzeitig. Es braucht eine Adapterschicht,
weil unser `ToggleButtonGroup` bewusst nur den Mehrfachauswahl-Modus umsetzt (siehe die
Scope-Notiz in `ToggleButtonGroup.tsx`): Der Adapter übergibt `value={[mode]}`, liest aus dem
`onChange`-Array den **neu hinzugekommenen** Wert und ignoriert ein leeres Array — ein Klick auf das
schon aktive Segment hebt die Auswahl also nicht auf, sondern tut nichts. Ein Farbschema ohne
gewählten Wert gibt es nicht.

Die Alternative, den `ToggleButtonGroup` um einen echten Einfachauswahl-Modus zu erweitern, bleibt
draußen: Das ist eine Änderung an einer Joy-verglichenen Komponente und gehört in ihren eigenen
Vorgang, nicht in diesen.

**`ColorSchemeSwitch`** kann `system` strukturell nicht darstellen — ein Schalter hat zwei Lagen.
Das ist keine Lücke, sondern die Form: „Dark Mode: [aus]" in einer Einstellungszeile ist ein
verbreitetes und verständliches Bedienelement. Wie es sich am dritten Zustand verhält, ist
festgelegt statt zufällig:

- `checked` ist `resolvedMode === 'dark'`. Bei `system` zeigt der Schalter also, was gerade gilt.
- Umschalten schreibt immer einen festen Modus (`'light'` oder `'dark'`) und verlässt `system`
  damit ausdrücklich. Der Nutzer hat eine Entscheidung getroffen; sie zu treffen und stillschweigend
  weiter dem System zu folgen wäre der überraschendere Weg.
- Wer `system` erreichbar halten will, nimmt eine der Dreizustandsformen. Der Schalter bekommt
  keinen versteckten Rückweg (kein langer Druck, kein Doppelklick).

**`ColorSchemeSelect`** ist die Formularform, für Einstellungsseiten, auf denen daneben schon
Auswahlfelder stehen und ein Segment-Control aus der Reihe fiele.

### Warum sechs Exporte und keine `variant`-Prop

Eine Komponente mit `variant="menu" | "segmented" | "switch"` wäre eine kleinere API-Oberfläche und
die schlechtere Entscheidung:

- **Bündelgröße.** Eine polymorphe Komponente zieht `Menu`, `ToggleButtonGroup`, `Switch` und
  `Select` in jeden Build, auch wenn nur der Icon-Knopf in der Kopfzeile steht. Dieses Paket
  behandelt Bündelgröße als Anforderung — `country-flag-icons` liegt genau deshalb in Rollups
  `external`.
- **Die Props gehen auseinander.** `Switch` hat keine `variant`-Achse und keinen dritten Zustand,
  `Select` hat `placeholder` und Dekoratoren, `Menu` hat Platzierung und einen Trigger. Eine
  gemeinsame Prop-Signatur wäre eine Vereinigungsmenge, in der zu jeder Form die Hälfte nicht gilt.
- **Das Repository macht es nirgends anders.** 65 Komponenten, ein Verzeichnis je Komponente, keine
  polymorphe Sammelkomponente. Joys eigene API ist genauso geschnitten.

### Der gemeinsame Kern

`src/internal/colorScheme.ts` — nicht exportiert, von allen sechs benutzt:

- `MODES = ['system', 'light', 'dark']` als Reihenfolge für Zyklus und Listen.
- `nextMode(mode)` für den Zyklus.
- Die englischen Standardbeschriftungen.
- Die Zuordnung Modus → Icon.

Damit hat „in welcher Reihenfolge stehen die drei" genau eine Antwort im Code statt sechs.

## Icons

Drei neue Dateien in `src/internal/svg-icons/` nach dem dort etablierten Muster
(`width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"`):
`LightModeIcon`, `DarkModeIcon`, `SettingsBrightnessIcon`. Das sind dieselben drei, die MUIs eigene
Dokumentation für ihren Moduswähler benutzt.

Keine Icon-Abhängigkeit: `@mui/icons-material` steht nicht in unseren Abhängigkeiten und soll es
für drei Pfade nicht werden. Die Pfaddaten werden aus der Material-Design-Quelle **übernommen, nicht
nachgezeichnet** — die bestehenden fünf Icons in diesem Verzeichnis tragen alle den Vermerk, dass sie
Joys internen Pfad exakt treffen, und geschätzte Kurven wären ein sichtbarer Bruch mit ihnen. Das ist
ein Arbeitsschritt im Plan mit einer Prüfung, keine Nebenbei-Erledigung.

Die Icons sind `aria-hidden`. Der zugängliche Name kommt vom Bedienelement.

## Beschriftungen und Zugänglichkeit

Standardbeschriftungen auf Englisch, überschreibbar — dieselbe Linie wie bei `LocaleSwitcher`: Die
Bibliothek entscheidet nicht, womit ihre Konsumenten übersetzen, und bringt keine Sprachdateien mit.

- `ColorSchemeToggle` trägt ein `aria-label`, das die **Wirkung** benennt („Switch to light mode"),
  nicht den Zustand — ein Knopf, der seinen Ist-Zustand vorliest, sagt nicht, was ein Klick tut. Die
  Komponente lässt Button-Props durch, ein eigenes `aria-label` gewinnt also.
- Die Dreizustandsformen brauchen kein `aria-label` je Eintrag, weil die Einträge beschriftet sind.
  Ihre Beschriftungen kommen über eine `labels`-Prop
  (`{ system?: ReactNode; light?: ReactNode; dark?: ReactNode }`), teilweise überschreibbar.
- `ColorSchemeToggleGroup` und `ColorSchemeSelect` bekommen einen Gruppennamen über
  `aria-label`/`FormLabel` durch den Aufrufer.
- `ColorSchemeSwitch` nimmt kein `labels` — es hat keine drei Optionen zu benennen. Seine
  Sonne/Mond-Symbole gehen als `startDecorator`/`endDecorator` durch, sein zugänglicher Name kommt
  wie bei `ColorSchemeToggle` aus einem überschreibbaren `aria-label`, das die Wirkung benennt.
- Der aktive Eintrag ist in jeder Dreizustandsform `selected`, nicht nur farblich hervorgehoben.

## Visuelle Regressionsabdeckung

Die Regel dieses Repositories lautet: jede Komponente Seite an Seite mit dem echten `@mui/joy`, die
volle Variant-mal-Color-Matrix, berechnete Stile als Pass/Fail und Screenshots für Menschen.

**Alle sechs Formen sind davon in der Kreuzprodukt-Achse ausgenommen, wie `LocaleSwitcher` es ist.**
Joy UI hat keine dieser Komponenten, und wichtiger: keine bringt eine eigene Optik mit. Sie sind
`IconButton`, `Menu`/`MenuItem`, `ToggleButtonGroup`, `Switch` und `Select` — jede davon trägt
schon eine vollständige Joy-verglichene Abdeckung. Ein zweites Kreuzprodukt prüfte dieselben
berechneten Stile ein zweites Mal.

Was eine Komposition dennoch falsch machen kann, und was deshalb geprüft wird:

- **Weitergabe.** `size` und `variant`/`color` müssen am zugrundeliegenden Bedienelement ankommen.
  Geprüft über `minHeight`/`width` je Größe — schluckte eine Form die Prop, fiele genau das auf.
- **Zustand.** Der aktive Eintrag trägt in jeder Dreizustandsform tatsächlich den
  `selected`-Hintergrund, und zwar der zu `mode` gehörende, nicht der zu `resolvedMode`.
- **Self-Baseline-Screenshots** je Form: Ruhezustand, und wo es einen gibt der geöffnete Zustand.
  Für `ColorSchemeToggle` zusätzlich alle drei Icon-Zustände — dass das richtige Symbol zum Modus
  erscheint, zeigt kein berechneter Stil.
- **Fokusring** je Form, weil er der Grund für die Abdeckungsregel dieses Repositories ist.

### Der eigentliche Fund: Dunkelmodus ist nirgends abgedeckt

`grep -rln "data-color-scheme" src/visual/` findet **nichts**. 63 Visual-Test-Dateien, keine
rendert je im Dunkelmodus. Der gesamte `[data-color-scheme="dark"]`-Block in `theme.css` —
mehrere hundert aus Joy übernommene Zeilen — ist damit nie gegen das echte Paket verifiziert
worden.

Das ist ein größeres Loch als dieses Feature, und dieses Feature läuft genau hinein: Wir liefern
sechs Bedienelemente, deren einziger Zweck es ist, Nutzer in einen unverifizierten Zustand zu
schicken.

Im Rahmen dieses Vorgangs abgedeckt, jeweils als echter Joy-Vergleich in **beiden** Schemata über
die volle Variant-mal-Color-Matrix:

`IconButton`, `MenuItem`, `ToggleButtonGroup`, `Switch`, `Select` — also die fünf Primitive, auf
denen die sechs Formen aufsetzen. Damit ist der Dunkelmodus dort verifiziert, wo dieses Feature ihn
sichtbar macht.

Die verbleibenden ~57 Komponenten bleiben draußen und bekommen einen eigenen Vorgang. Sie hier
mitzunehmen wäre ein zweites Projekt in diesem Spec, und ein Fund in ihnen wäre eine
Token-Korrektur, die nichts mit dem Umschalter zu tun hat.

Ein technisches Risiko, das der Plan zuerst klären muss: wie Joys Dunkelmodus im Browsertest
zuverlässig aktiviert wird (`CssVarsProvider` mit `defaultMode="dark"` setzt
`data-joy-color-scheme` auf `<html>`, unser Provider auf ein inneres `div` — beide müssen im selben
Dokument gleichzeitig gelten, ohne sich zu überschreiben). Das ist der erste Arbeitsschritt, nicht
eine Annahme.

### Zur Menge der Screenshots

Die volle Matrix in beiden Schemata wäre je Komponente ein dreistelliger PNG-Berg, den niemand mehr
ansieht — und Screenshots sind hier ausdrücklich für Menschen, nicht das Prüfsignal. Also:
`getComputedStyle`-Vergleiche über die **komplette** Matrix in beiden Schemata,
`toMatchScreenshot()` auf ein lesbares Raster je Komponente und Schema plus die Zustände, die nur
ein Bild zeigt.

## Tests in jsdom

Provider:

- `system` löst über `matchMedia` auf und folgt einem `change`-Ereignis ohne Neuladen.
- Ein gespeicherter Wert schlägt `defaultMode`; ein ungültiger gespeicherter Wert fällt auf
  `defaultMode` zurück statt zu werfen.
- `setMode('system')` schreibt `"system"`, löscht den Schlüssel nicht.
- `data-color-scheme` trägt `resolvedMode`, nie `"system"`.
- Ein `storage`-Ereignis aus einem anderen Tab wird übernommen.
- Braucht ein `matchMedia`-Stub — jsdom bringt keins mit.

Je Form:

- Der Zyklus von `ColorSchemeToggle` läuft `system → light → dark → system`.
- Jede Dreizustandsform bietet genau drei Optionen und markiert die zu `mode` gehörende.
- Ein Klick ruft `setMode` mit dem Modus, nicht mit der Beschriftung.
- `ColorSchemeSwitch` spiegelt `resolvedMode` und verlässt beim Umschalten aus `system` heraus in
  einen festen Modus.
- `ColorSchemeToggleGroup` ignoriert einen Klick auf das aktive Segment statt in einen leeren
  Zustand zu fallen.
- Unbekannte Props erreichen das jeweilige Bedienelement.
- Jede Form wirft außerhalb eines `ColorSchemeProvider`, so wie `useColorScheme` es tut.

## Einsatz in der Dokumentation

Nicht nur Demoseiten, sondern echter Einsatz — das ist der eigentliche Gewinn: Sobald die
Dokumentationsanwendung selbst umschaltbar ist, fällt jede Komponente mit falschen Dunkel-Tokens
über alle ~70 Seiten sofort auf, statt in einem Einzeltest zu schlummern.

- `apps/docs/src/Layout.tsx`: die handgemalten `SunIcon`/`MoonIcon` und der Zweizustands-Flip
  entfallen, `ColorSchemeMenu` ersetzt sie. Die Logo-Auswahl in Zeile 30 wechselt auf
  `resolvedMode`.
- `apps/playground/src/App.tsx`: derselbe Ersatz.
- Je Form eine Dokumentationsseite mit lauffähigem Beispiel, dazu Einträge in `nav.ts` und
  `RoadmapPage`.
- `ColorSchemeProviderPage` um `system`, `resolvedMode` und die Storage-Reihenfolge erweitert,
  inklusive des Hinweises auf `mode` gegen `resolvedMode`.
- `GettingStarted` bekommt die `@custom-variant dark`-Zeile, weil sie Konsumenten betrifft, die
  eigene `dark:`-Klassen schreiben.

## Was draußen bleibt

**Kein blockierendes Inline-Script gegen den SSR-Flash.** Das ist das eine, was `next-themes`
wirklich besser kann, und es ist ein eigenes Thema: Es verlangt, dass der Konsument ein Script in
sein Dokument-`<head>` einhängt, also eine API, die über React hinausgeht. Unser Provider hat das
Problem heute schon, dieser Vorgang macht es nicht schlimmer, und die Lösung gehört in ihren eigenen
Vorgang.

**Kein Einfachauswahl-Modus für `ToggleButtonGroup`.** Der Adapter reicht; die Komponente selbst zu
erweitern ist eine Änderung an einer Joy-verglichenen Optik.

**Keine mitgelieferten Übersetzungen.** Englische Standardwerte, `labels` zum Überschreiben.

**Kein `resolvedMode`-Icon auf `ColorSchemeToggle`.** Das Icon zeigt den gewählten Modus, damit
„folgt dem System" sichtbar bleibt.

**Keine Abdeckung der übrigen ~57 Komponenten im Dunkelmodus.** Eigener Vorgang, hier benannt.

## Abnahme

Fertig, wenn:

- `pnpm test` und `pnpm test:visual` grün sind.
- Die neuen Baseline-Screenshots unter `__screenshots__/` liegen **und angesehen wurden** — hell und
  dunkel.
- Die fünf tragenden Primitive einen bestandenen Joy-Vergleich im Dunkelmodus haben.
- Dokumentationsanwendung und Playground keinen eigenen Umschalter mehr enthalten und beide über
  `resolvedMode` gehen.
- `pnpm typecheck` und `pnpm lint` grün sind, `pnpm build` durchläuft.
- Ein Changeset als **minor** vorliegt, der die Typerweiterung von `mode` und den geänderten
  `defaultMode`-Standard ausdrücklich als Migrationshinweis benennt.
