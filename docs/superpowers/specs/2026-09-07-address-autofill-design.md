# AddressAutofill

Datum: 2026-09-07 · Status: Entwurf

Ein Kombinationsfeld, das beim Tippen deutsche Adressen von `autofill.api.hintoric.cloud`
(kostenlose, OSM-basierte PLZ-/Orts-/Straßensuche) vorschlägt und bei Auswahl ein strukturiertes
Adressobjekt zurückgibt. Erster von zwei geplanten Bausteinen — der zweite, `AddressForm` (drei
sich gegenseitig befüllende Felder für PLZ/Ort/Straße über `/api/lookup`), folgt als eigene Spec.

## Warum in dieser Bibliothek

Er ist ein **Block**, kein Primitiv: er bindet eine konkrete externe API fest ein, statt eine
allgemeine Fähigkeit zusammensetzbar zu machen. Das ist eine bewusste Ausnahme — `packages/ui`
macht sonst nirgends eigene Netzwerk-Aufrufe, jede andere Komponente ist ein reines, seiteneffektfreies
Joy-UI-Gegenstück. Diese Ausnahme ist Produktentscheidung, keine Bequemlichkeit: die Adresssuche ist
immer dieselbe Anfrage an denselben Dienst, und jede Anwendung, die sie selbst verdrahtet, baut
dieselbe Debounce-/Abbruch-/Ladezustands-Logik noch einmal.

## Was er ausdrücklich nicht tut

**Er hat kein `baseUrl`- oder `fetcher`-Prop.** Der Endpunkt ist fest `autofill.api.hintoric.cloud`
(explizite Entscheidung, kein Aufschub). Tests mocken das interne `addressApi`-Modul, nicht eine
injizierte Funktion — die öffentliche API bleibt minimal. Ein zweiter Dienst ist eine neue Aufgabe,
kein heute schon offenzuhaltender Erweiterungspunkt.

**Er füllt keine anderen Felder aus.** Das ist `AddressForm`s Aufgabe.

**Er cached und wiederholt nichts.** Kein Retry-mit-Backoff für eine kostenlose Nachschlage-API —
das wäre Aufwand für einen Fehlerfall, den ein erneutes Tippen ohnehin auflöst.

**Er funktioniert nur außerhalb keines Formulars — er verlangt eines.** Anders als `Autocomplete`
(das mit *und* ohne `FormProvider` läuft) gibt es hier **keinen unverbundenen Modus**: kein
`value`/`onChange`-Paar am Feld selbst, kein `AddressAutofillField` als eigenständige Variante. Das
Feld verlangt `name` und einen umgebenden `<Form>`/`FormProvider` und wirft sonst denselben Fehler,
den `useFormContext()` bei fehlendem Provider ohnehin wirft. Grund: das zurückgegebene Objekt hat
nur als Formularwert Sinn (es füllt am Ende PLZ/Ort/Straße-Felder oder wird beim Absenden
mitgeschickt) — ein zweiter, kontrollierter Pfad wäre eine API-Fläche für einen Anwendungsfall, den
niemand angefordert hat.

**Er hat keine eigenen Standardtexte.** Weder Englisch noch Deutsch. Dieselbe Begründung wie bei
`ConfirmationDialog`/`LocaleSwitcher`: eine Darstellungsbibliothek legt die Sprache ihrer Konsumenten
nicht fest. Die vier Zustandstexte (siehe API) sind deshalb **Pflicht-Props ohne Fallback**, keine
optionalen Props mit englischem Standardwert — bewusst strenger als `Autocomplete`s vorhandenes,
hartkodiertes „No options", weil das die ältere, gerade nicht wiederholenswerte Entscheidung ist.

## API

Neu auf `Autocomplete` (generisch nützlich, nicht `AddressAutofill`-spezifisch):

```ts
// Ergänzung zu AutocompleteProps<Value>:
/** Zeigt einen Spinner in der Empty-Slot-Fläche statt „No options". @default false */
loading?: boolean;
/** Ersetzt „No options", wenn die Liste leer ist und nicht geladen wird. */
emptyContent?: React.ReactNode;
/**
 * Reicht an `Combobox.Root` durch. `null` schaltet Base UIs eigene
 * Client-Filterung von `options` gegen den Eingabetext ab — nötig für jede
 * Nutzung mit einer bereits serverseitig gefilterten Ergebnisliste (siehe
 * Addendum unten). @default undefined (Base UIs eingebauter Filter, heutiges
 * Verhalten für alle bestehenden, statisch befüllten `Autocomplete`s).
 */
filter?: null | ((itemValue: Value, query: string, itemToString?: (itemValue: Value) => string) => boolean);
```

`AddressAutofill` selbst:

```ts
export interface AddressSuggestion {
  postalCode: string;
  city: string;
  street: string;
  borough: string | null;
  suburb: string | null;
}

export interface AddressAutofillProps {
  /** Pflicht — das Feld verlangt einen umgebenden <Form>. */
  name: string;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Wandelt einen Treffer in Anzeigetext. @default `${street}, ${postalCode} ${city}` */
  getOptionLabel?: (value: AddressSuggestion) => string;
  /** Zeichen, ab denen gesucht wird. @default 2 */
  minQueryLength?: number;
  /** Debounce zwischen letztem Tastenanschlag und Anfrage, in ms. @default 300 */
  debounceMs?: number;
  /** An die API durchgereicht. @default 10 */
  limit?: number;

  // Die vier Zustandstexte — Pflicht, kein Fallback (siehe oben).
  belowMinLengthContent: React.ReactNode;
  loadingContent: React.ReactNode;
  noResultsContent: React.ReactNode;
  errorContent: React.ReactNode;

  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
```

Am Aufrufort:

```tsx
<Form onSubmit={(values) => save(values)}>
  <AddressAutofill
    name="address"
    label="Adresse"
    placeholder="Straße, PLZ oder Ort"
    belowMinLengthContent="Mindestens 2 Zeichen eingeben."
    loadingContent="Suche läuft…"
    noResultsContent="Keine Adresse gefunden."
    errorContent="Adressen konnten nicht geladen werden."
  />
</Form>
```

### Warum `Autocomplete` zwei neue, generische Props bekommt statt eines eigenen Unterbaus

`AddressAutofill` braucht einen Lade- und einen Fehlerzustand in der Listbox, die `Autocomplete`
heute nicht kennt. Die Alternative — ein zweiter, eigener Aufbau direkt auf `Combobox` von Base UI,
wie `Autocomplete.tsx` ihn hat — würde dieselbe Tastatur-Navigation, Formularbindung und
`FieldShell`-Verdrahtung ein zweites Mal herstellen, mit dem Risiko, dass beide Stellen später
auseinanderlaufen. Zwei neue, generische Props auf dem vorhandenen Primitiv sind für jede künftige
asynchron befüllte `Autocomplete`-Nutzung brauchbar, nicht nur für diesen Block.

### Anfrage-Logik

Unterhalb von `minQueryLength`: keine Anfrage, `emptyContent` zeigt `belowMinLengthContent`.

**Die innere `<Autocomplete>` bekommt kein `name`.** `Autocomplete` bindet sich selbst an
react-hook-form, sobald `name` gesetzt ist *und* ein `FormProvider` existiert (`AutocompleteRootComponent`
in `Autocomplete.tsx`) — würde `AddressAutofill` seinen eigenen `name` durchreichen, verbänden sich
zwei unabhängige `useController`-Aufrufe mit demselben Feldnamen, einer mit `AddressSuggestion`-Objekten,
einer mit was auch immer `Autocomplete`s eigener Adapter daraus macht. `AddressAutofill` ruft
`useBoundField(name, valueAdapter, …)` **selbst**, genau einmal, und reicht das Ergebnis (`value`,
`onChange`, Fehlerzustand) als kontrolliertes Paar an die *namenlose* `<Autocomplete value onChange
label helperText error .../>` durch — die rendert dann ihren eigenen, unverbundenen `AutocompleteField`-Pfad
und trägt trotzdem `FieldShell`, Variant-Styling und Tastaturnavigation bei.

Ab `minQueryLength`, nach `debounceMs` Ruhe seit dem letzten Tastenanschlag: eine Anfrage an
`GET /api/autocomplete?q=<Text>&limit=<limit>`. Eine neue Eingabe während eine Anfrage noch fliegt
bricht sie per `AbortController` ab, statt auf eine veraltete Antwort zu warten, die eine neuere
überschreiben könnte.

**Bestehende Treffer bleiben sichtbar, während eine neue Anfrage lädt** (kein Leeren-vor-Neuladen) —
`loading` steuert nur, ob der *leere* Slot einen Spinner statt `loadingContent`/`belowMinLengthContent`
zeigt; solange die letzte Trefferliste nicht leer ist, rendert `Combobox.List` sie unverändert weiter,
und ein Flackern bei jedem Tastenanschlag entfällt.

Ein abgelehntes `fetch` (Netzwerk, Nicht-2xx) leert die Trefferliste und zeigt `errorContent` — kein
Retry (siehe oben).

## Aufbau

```
AddressAutofill
  State: query, suggestions, isLoading, hasError (debounced + AbortController-Fetch via addressApi.ts)
└── Autocomplete
    options={suggestions}
    inputValue={query} onInputChange={setQuery}
    onChange={(v) => field.onChange(v)}      // via useBoundField(name, valueAdapter, …), kein optionaler Zweig
    loading={isLoading}
    emptyContent={/* je nach Zustand: belowMinLength → loading → error → noResults */}
    filter={null}                            // kein Client-Refiltern serverseitiger Treffer
    getOptionLabel, variant, color, size, label, helperText, error, disabled, placeholder
```

`addressApi.ts`: ein einzelnes `fetchAddressSuggestions(query, { limit, signal })`, das
`GET https://autofill.api.hintoric.cloud/api/autocomplete` aufruft und die Antwort typisiert
zurückgibt. Einziger Aufrufer dieses Moduls in `packages/ui`.

## Visuelle Regressionsabdeckung

Wie beim `ConfirmationDialog`: Joy UI hat kein Gegenstück, also **keine Seite-an-Seite-Prüfung gegen
`@mui/joy`**. Stattdessen gegen **`Autocomplete`selbst**, weil genau die Weitergabe der Optik das ist,
was diese Komposition falsch machen könnte:

- Pro Variante × Farbe × Größe: `getComputedStyle`-Gleichheit von `AddressAutofill`s Eingabefläche
  mit einem daneben gerenderten `<Autocomplete>` derselben Kombination.
- Die vier Zustände (`belowMinLength`/`loading`/`noResults`/`error`) als Screenshots über
  `toMatchScreenshot()`, plus `getComputedStyle`-Gleichheit von `Autocomplete`s neuem Lade-Spinner
  mit dem vorhandenen `CircularProgress`.
- Fokus-Ring-Zustand, identisch zu `Autocomplete`s eigenem Test.

Die beiden neuen `Autocomplete`-Props (`loading`, `emptyContent`) bekommen ihre eigenen Fälle in
`Autocomplete.visual.test.tsx`, nicht in einer Kopie hier.

## Tests in jsdom

1. Unterhalb `minQueryLength`: keine Anfrage, `belowMinLengthContent` sichtbar.
2. Erreichen von `minQueryLength`: Anfrage erst nach `debounceMs`, nicht bei jedem Tastenanschlag.
3. Schnelles Weitertippen bricht die vorherige Anfrage ab (`AbortController`); nur die letzte
   Antwort landet in `options`.
4. Erfolgreiche Antwort füllt die Trefferliste; Auswahl ruft RHF-`onChange` mit dem vollen
   `AddressSuggestion`-Objekt.
5. Bestehende Treffer bleiben während einer neuen, laufenden Anfrage sichtbar (kein Zwischen-Leeren).
6. Leere Antwort zeigt `noResultsContent`.
7. Abgelehntes `fetch` zeigt `errorContent` und leert die Liste.
8. Fehlender `FormProvider` wirft (dasselbe Verhalten wie `useFormContext()` ohne Provider) —
   dokumentiert das „kein unverbundener Modus", statt still auf leere Werte zu degradieren.
9. `belowMinLengthContent`/`loadingContent`/`noResultsContent`/`errorContent` werden unverändert
   durchgereicht (kein interner Ersatztext, falls eine Prop doch leer ist).

## Doku-Seite

`apps/docs/src/pages/AddressAutofillPage.tsx`, nach dem Muster von `AutocompletePage.tsx`:

- "Basic usage": ein `<Form>` um ein einzelnes `<AddressAutofill name="address" .../>`, deutsche
  Platzhaltertexte.
- "Controlled" heißt hier **beobachtet, nicht kontrolliert** (Konsequenz aus „immer in `<Form>`"):
  eine lokale `AddressAutofillDemo`-Komponente, die `form.watch('address')` (bestehendes Muster,
  siehe `FormsPage.tsx`/`Input.test.tsx`) neben dem Feld anzeigt, damit man das echte, von der
  Hintoric-API zurückgegebene Objekt beim Tippen sieht.
- "Zustände" (falls deterministisch erzwingbar: sehr kurze Eingabe, Tippfehler ohne Treffer).
- `<PropsTable>` für `AddressAutofillProps` sowie die beiden neuen `Autocomplete`-Props.
- Eintrag in `nav.ts` (Gruppe `Inputs`) und Route in `App.tsx`, nach dem `Autocomplete`-Muster.
- Da die Doku-App gegen `@hintoric/ui`s gebautes `dist/` läuft (kein Alias auf `src/`): `pnpm build`
  vor jedem Doku-Vorschau-Lauf, solange an der Komponente gearbeitet wird.

## Was draußen bleibt

**Kein `AddressForm`** (PLZ/Ort/Straße als drei kreuzbefüllende Felder über `/api/lookup`) — eigene
Spec, eigener Zeitpunkt.

**Keine Routenerkennung** (PLZ vs. Ort vs. Straße im selben Freitextfeld unterscheiden) — dieser
Block nutzt ausschließlich `/api/autocomplete`; die Unterscheidung ist `AddressForm`s Aufgabe.

**Kein `fetcher`/`baseUrl`-Prop.** Siehe oben.

## Abnahme

Fertig, wenn `pnpm test` und `pnpm test:visual` grün sind, die Baseline-Screenshots unter
`__screenshots__/` liegen und angesehen wurden, `pnpm typecheck` und `pnpm lint` grün sind, die
Doku-Seite unter *Inputs* erreichbar ist und im Browser gegen die echte API funktioniert (nicht nur
gemockt), und ein Changeset (minor, für `AddressAutofill` sowie `Autocomplete`s zwei neue Props)
liegt.
