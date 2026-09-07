# LocaleProvider

Datum: 2026-09-07 · Status: Entwurf

Eine Quelle für die Anzeigesprache, aus der `RelativeTime` liest und in die der `LocaleSwitcher`
schreibt — statt zwei Zustände, die nichts voneinander wissen.

## Das Problem

Alle Teile sind da, nur verbunden ist nichts:

- `DateTimeProvider` trägt ein `locale`, besitzt es aber nicht — er reicht ein Prop durch.
- `LocaleSwitcher` ist rein kontrolliert und kennt diesen Provider überhaupt nicht.
- Jede Anwendung hält deshalb ihren eigenen Zustand für den Umschalter (`apps/playground/src/App.tsx`
  und die Docs-Seite tun genau das) und füttert damit **nie** den `DateTimeProvider`.

Die Folge ist sichtbar: Der Umschalter steht auf Deutsch, und `RelativeTime` schreibt „3 days ago",
weil es mangels Vorgabe auf die Sprache der Laufzeit zurückfällt. Wer beides gleichziehen will, muss
heute dieselbe Sprache an zwei Stellen von Hand einspeisen und daran denken, sie zusammenzuhalten.

## Was er ausdrücklich nicht tut

**Er besitzt die Sprache nicht.** `locale` ist ein Pflicht-Prop; der Provider spiegelt nur. Kein
`useState`, kein `localStorage`, keine Erkennung der Browsersprache.

Das ist der Unterschied zum `ColorSchemeProvider`, und er ist beabsichtigt. Das Farbschema hat außer
der Bibliothek keinen Besitzer — die Sprache schon: In den Anwendungen hält i18next sie, samt
Erkennung, Persistenz und dem Nachladen der Übersetzungsdateien. Ein zweiter Zustand daneben wäre
kein einheitlicher Provider, sondern ein dritter Streitpartner. Er würde auseinanderlaufen, sobald
i18next die Sprache aus einem anderen Anlass wechselt als über den Umschalter.

**Er kennt weiterhin keine i18n-Bibliothek.** Die Begründung aus der `LocaleSwitcher`-Spec gilt
unverändert: Eine Darstellungsbibliothek darf nicht festlegen, womit ihre Konsumenten übersetzen.
Die Verknüpfung ist eine Zeile Anwendungscode, siehe unten.

## API

Neu in `src/theme/LocaleProvider.tsx` — neben `ColorSchemeProvider` und `DateTimeProvider`, nicht
unter `components/`. Er hat keine Optik und fällt damit, wie die anderen Provider, nicht unter die
Pflicht dieses Repositories zur visuellen Vergleichsabdeckung gegen `@mui/joy`.

```tsx
export interface LocaleOption {
  value: string;
  label: React.ReactNode;
  region?: string;
}

export interface LocaleProviderProps {
  children: React.ReactNode;
  /** Die aktuelle Sprache. Pflicht — der Provider spiegelt, er besitzt nicht. */
  locale: string;
  /** Fehlt er, ist der Provider eine reine Lesequelle. */
  onLocaleChange?: (locale: string) => void;
  /** Die angebotene Auswahl. Fehlt sie, braucht ein Umschalter darunter eigene `locales`. */
  locales?: readonly LocaleOption[];
}

export interface LocaleContextValue {
  locale: string;
  setLocale: ((locale: string) => void) | undefined;
  locales: readonly LocaleOption[] | undefined;
}

/** Wirft außerhalb eines LocaleProvider, wie `useColorScheme`. */
export function useLocale(): LocaleContextValue;
```

`onLocaleChange` heißt am Provider wie ein Callback und im Kontext `setLocale` wie ein Setzer —
dieselbe Aufteilung, die `ColorSchemeProvider` zwischen seinem Prop und `setMode` schon macht.

Beide optionalen Felder sind im Kontext ausdrücklich `| undefined` statt stillschweigend leer: Eine
Anwendung, die `RelativeTime` nur auf Deutsch stellen will und gar keinen Umschalter zeigt, ist ein
echter Fall und soll keinen leeren Callback erfinden müssen.

### `LocaleOption` zieht um

Der Typ wohnt heute in `components/LocaleSwitcher/types.ts`, wird jetzt aber vom Provider gebraucht.
Er wandert nach `theme/LocaleProvider.tsx`, und `components/LocaleSwitcher/types.ts` exportiert ihn
von dort weiter. Dieselbe Richtung, in der `HourCycle` schon aus `theme/DateTimeProvider` kommt —
`theme/` hängt nicht von `components/` ab. Für Konsumenten ändert sich nichts: `index.ts` exportiert
weiterhin `LocaleOption` unter demselben Namen mit derselben Form.

## Rangfolge

```
prop am Bauteil  >  DateTimeProvider.locale  >  LocaleProvider.locale  >  Laufzeitvorgabe
```

Zwei Provider tragen damit eine Sprache, und das ist der Preis für die Fähigkeit, Datumsangaben
bewusst anders zu setzen als die Oberfläche — die Docs-Seite zu `RelativeTime` zeigt genau das mit
`<DateTimeProvider locale="ja-JP" timeZone="Asia/Tokyo">`. Mehrdeutig ist es nicht: Der engere
Bereich gewinnt, wie bei CSS-Spezifität oder einer geschachtelten Variablenbindung.

Die Auflösung gehört in `useDateTimeDefaults`, nicht in die Bauteile:

```tsx
export function useDateTimeDefaults(): DateTimeContextValue {
  const dateTime = React.useContext(DateTimeContext) ?? {};
  const localeContext = useLocaleContext();          // paketintern, wirft nicht
  return { ...dateTime, locale: dateTime.locale ?? localeContext?.locale };
}
```

Damit bleibt `RelativeTime.tsx` **unverändert** — es liest weiter `localeProp ?? defaults.locale`,
und die ganze Kette liegt an einer Stelle. Jedes künftige Datums-/Zeitbauteil erbt sie umsonst.

`useLocaleContext()` ist die nicht werfende, paketinterne Lesart desselben Kontexts; sie wird nicht
aus `index.ts` exportiert. Das öffentliche `useLocale()` wirft, weil Anwendungscode, der es aufruft,
den Provider auch beabsichtigt — dieselbe Wahl wie bei `useColorScheme`.

## `LocaleSwitcher` wird prop-frei verwendbar

`locales`, `value` und `onChange` werden optional und fallen auf den Kontext zurück. Gesetzte Props
gewinnen. Der Umbau ist damit rein additiv — kein bestehender Aufruf bricht, auch die Docs-Seite
nicht, die mehrere unabhängige Beispiel-Umschalter nebeneinander zeigt.

```tsx
<LocaleSwitcher />                                       // im Provider
<LocaleSwitcher locales={LOCALES} value={l} onChange={setL} />  // wie bisher, gewinnt
<LocaleSwitcher locales={NUR_HIER} />                    // Sprache aus dem Kontext, eigene Auswahl
```

Liefert weder Prop noch Kontext ein `locales`, ein `value` oder einen Änderungsweg, wirft der
Umschalter beim Rendern mit einer Meldung, die das fehlende Stück benennt:

```
LocaleSwitcher: no `locales` given and no LocaleProvider supplies them.
Pass a `locales` prop, or set `locales` on LocaleProvider.
```

Eine leere Schaltfläche mit leerem Menü wäre der stille falsche Ausgang, den dieses Repository
sonst auch vermeidet.

## Anbindung in der Anwendung

Die Verknüpfung mit i18next bleibt Sache des Konsumenten und ist eine Zeile:

```tsx
<LocaleProvider
  locale={i18n.language}
  onLocaleChange={i18n.changeLanguage}
  locales={LOCALES}
>
  <App />   {/* <LocaleSwitcher /> irgendwo darin, RelativeTime auch */}
</LocaleProvider>
```

i18next bleibt alleiniger Besitzer: Es meldet die Sprache herein, bekommt die Änderung heraus, und
der neue Wert kommt über sein eigenes Rendern zurück. Wechselt die Sprache aus einem anderen Anlass
— gespeicherte Einstellung beim Start, ein Deep-Link, ein zweiter Tab —, folgt der Umschalter, weil
er nichts Eigenes gespeichert hat.

## Tests

Alles jsdom (`pnpm test`); keine visuellen Tests, weil sich an der Optik des Umschalters nichts
ändert und Provider keine haben.

**`theme/LocaleProvider.test.tsx`**
- `useLocale` gibt `locale`, `setLocale` und `locales` weiter
- `useLocale` wirft außerhalb eines Providers
- ohne `onLocaleChange` ist `setLocale` `undefined`; ohne `locales` ist `locales` `undefined`

**`components/RelativeTime/RelativeTime.test.tsx`** (Ergänzung zu den vorhandenen Rangfolgetests)
- liest die Sprache aus `LocaleProvider`, wenn kein `DateTimeProvider` da ist
- `DateTimeProvider.locale` gewinnt gegen `LocaleProvider.locale`
- ein `locale`-Prop gewinnt gegen beide
- `timeZone`/`hourCycle` kommen unverändert weiter nur aus `DateTimeProvider`

**`components/LocaleSwitcher/LocaleSwitcher.test.tsx`**
- prop-frei im Provider: zeigt das Label zur Kontextsprache, listet die Kontextauswahl
- ein Klick auf einen Eintrag ruft `onLocaleChange` des Providers
- ausdrückliche Props gewinnen gegen den Kontext (je einer für `locales`, `value`, `onChange`)
- wirft mit benennender Meldung, wenn weder Prop noch Kontext `locales`, `value` oder den
  Änderungsweg liefern

## Docs und Playground

- Neue Seite `LocaleProviderPage` unter derselben Rubrik wie `ColorSchemeProvider`, mit der
  i18next-Zeile, der Rangfolgetabelle und einem lebenden Beispiel, in dem ein `<LocaleSwitcher />`
  ein `<RelativeTime />` daneben mitzieht — der Beweis, dass das Ausgangsproblem weg ist.
- `LocaleSwitcherPage`: ein prop-freies Beispiel voran, die bestehenden bleiben als „ohne Provider".
- `RelativeTimePage`: der Absatz zur Herkunft der Werte nennt jetzt die vollständige Rangfolge.
- `RoadmapPage`: `LocaleProvider` als erledigt.
- `apps/playground/src/App.tsx`: der lokale `useState` wandert in einen `LocaleProvider`.

## Changeset

`minor` — neuer Provider, neuer Hook, gelockerte Props am Umschalter, nichts Brechendes.

## Verworfene Alternativen

**`locale` aus `DateTimeProvider` entfernen.** Eine einzige Stelle für die Sprache wäre sauberer,
kostet aber den Fall „Oberfläche englisch, Datumsangaben deutsch", der in den eigenen Docs schon
vorgeführt wird. Die Rangfolge löst die Mehrdeutigkeit, die das Entfernen vermeiden sollte,
vollständig auf.

**`DateTimeProvider` zu einem `IntlProvider` verschmelzen.** Ein Provider weniger, aber Zeitzone und
Sprache wären aneinandergekettet, obwohl sie in Anwendungen regelmäßig aus verschiedenen Quellen
kommen — die Sprache aus i18next, die Zeitzone aus dem Benutzerprofil.

**Den Provider die Sprache besitzen lassen** (State plus `localStorage`, wie `ColorSchemeProvider`).
Verworfen mit der Begründung oben: In den Zielanwendungen besitzt i18next sie bereits, und zwei
Besitzer laufen auseinander, sobald der Wechsel nicht über den Umschalter kommt.

**Den Umschalter ausschließlich am Provider betreiben** (`value`/`onChange`/`locales` streichen).
Kleinste API-Fläche, aber die Docs-Seite mit mehreren unabhängigen Beispielen ließe sich nicht mehr
bauen, und ein bereits veröffentlichtes Bauteil bräche ohne Not.
