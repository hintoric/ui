# @hintoric/ui — RelativeTime — Design Spec

Datum: 2026-09-04
Status: Approved

## 1. Ziel

Nach dem Vergleich mit [Blueprint.js](https://github.com/palantir/blueprint) fehlt `@hintoric/ui`
eine ganze Kategorie: Datum/Zeit-Komponenten. Diese Kategorie wird bewusst in zwei unabhängige
Projekte zerlegt:

1. **Anzeige-Komponenten** (dieses Dokument): `RelativeTime`, angelehnt an GitHubs quelloffenes
   [`@github/relative-time-element`](https://github.com/github/relative-time-element)
   (`<relative-time>` Web Component) — zeigt Zeitstempel als "vor 3 Minuten" / "in 2 Tagen" an,
   aktualisiert sich selbst, zeigt die absolute Zeit im nativen Browser-Tooltip.
2. **Eingabe-Widgets** (DatePicker, DateInput, DateRangePicker, TimePicker) — eigenes, späteres
   Brainstorming, nicht Teil dieser Spec.

## 2. Referenz-Implementierung

Der tatsächliche Quellcode von `@github/relative-time-element` (`src/relative-time-element.ts`)
wurde direkt von GitHub gelesen, nicht aus Dokumentation abgeleitet. Zentrale Erkenntnisse, die
in dieses Design übernommen werden:

- **Keine externe Datums-Library nötig.** Die gesamte Formatierung läuft über native
  `Intl.RelativeTimeFormat` und `Intl.DateTimeFormat`.
- **Ein geteilter, globaler Timer statt einem Timer pro Instanz.** GitHubs `dateObserver` ist ein
  Singleton: jede sichtbare `<relative-time>`-Instanz meldet sich an, der Singleton berechnet den
  über alle Instanzen hinweg frühesten nötigen Update-Zeitpunkt, setzt genau **einen**
  `setTimeout`, aktualisiert bei Ablauf alle betroffenen Instanzen und plant neu. Bei vielen
  Zeitstempeln auf einer Seite (z. B. eine Kommentar-Liste) spart das erheblichen Timer-Overhead
  gegenüber einem `setInterval` pro Komponente.
- **`threshold`** (ISO-8601-Dauer, Standard `P30D`): Zeitspannen jenseits dieser Schwelle werden
  als absolutes Datum statt als Relativzeit angezeigt.
- Die absolute Zeit landet automatisch im `title`, außer ein eigener Titel wurde gesetzt oder
  `noTitle` ist aktiv.

## 3. Abweichung von der Projekt-Regel "Visual Regression gegen echtes @mui/joy"

Wie bei `DataGrid` (siehe `docs/superpowers/specs/2026-09-03-datagrid-phase-1-design.md`, Abschnitt
2) hat Joy UI keine Entsprechung zu `RelativeTime` — kein `getComputedStyle()`-Vergleich gegen eine
Joy-Referenz möglich. Anders als bei `DataGrid` wurde hier aber trotzdem entschieden, **zusätzlich
zu den jsdom-Verhaltenstests echte Self-Baseline-Screenshots** (`toMatchScreenshot()` gegen die
eigene vorherige Baseline, kein Joy-Vergleich) beizubehalten — auch wenn der Komponentenwert
primär reiner Text ist, sollen typografische Regressionen (Schriftgröße/-farbe im umgebenden
Kontext) trotzdem sichtbar auffallen.

## 4. Dateistruktur

```
packages/ui/src/theme/
  DateTimeProvider.tsx        — neuer, optionaler Context-Provider
  DateTimeProvider.test.tsx

packages/ui/src/components/RelativeTime/
  relativeTimeFormat.ts       — reine Formatierungs-Funktion, kein React
  duration.ts                 — ISO-8601-Dauer-Parsing + Restzeit-Berechnung
  relativeTimeScheduler.ts    — der geteilte Timer-Singleton
  RelativeTime.tsx
  types.ts
  index.ts
  RelativeTime.test.tsx
  relativeTimeScheduler.test.ts

packages/ui/src/visual/
  RelativeTime.visual.test.tsx  — Self-Baseline-Screenshots
```

## 5. `DateTimeProvider` (neuer, optionaler globaler Context)

Anders als `ColorSchemeProvider` (verpflichtend, wirft ohne Provider) ist `DateTimeProvider`
**komplett optional** — `RelativeTime` funktioniert ohne ihn mit Browser-Standardwerten. Der
Provider setzt nur Standardwerte für den gesamten Unterbaum; ein expliziter Prop an einer
einzelnen `RelativeTime`-Instanz überschreibt ihn (Prop > Context > Browser-Default).

Bewusst generisch benannt (nicht `RelativeTimeProvider`) — spätere Datum/Zeit-Anzeige-Komponenten
(z. B. eine künftige `DateTime`-Anzeigekomponente) sollen denselben Context ohne Umbenennung
wiederverwenden können.

```tsx
export interface DateTimeContextValue {
  locale?: string;
  timeZone?: string;
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
}

export function DateTimeProvider({
  children,
  ...value
}: DateTimeContextValue & { children: React.ReactNode }): React.ReactElement;

// Gibt {} zurück, wenn kein Provider im Baum ist — wirft nicht.
export function useDateTimeDefaults(): DateTimeContextValue;
```

## 6. `RelativeTime` — Props

```ts
export interface RelativeTimeProps {
  date: Date | string;
  format?: 'auto' | 'relative' | 'datetime' | 'duration' | 'micro'; // Default 'auto'
  formatStyle?: 'long' | 'short' | 'narrow';
  tense?: 'auto' | 'past' | 'future'; // Default 'auto'
  threshold?: string; // ISO-8601-Dauer, Default 'P30D'
  precision?: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'; // Default 'second'
  locale?: string; // überschreibt DateTimeProvider
  timeZone?: string; // überschreibt DateTimeProvider
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24'; // überschreibt DateTimeProvider
  noTitle?: boolean;
  className?: string;
}
```

`date` akzeptiert sowohl ein `Date`-Objekt als auch einen ISO-String — React-Consumer haben meist
bereits ein geparstes `Date` (z. B. aus einer API-Antwort), anders als GitHubs Web Component, die
als HTML-Attribut nur Strings kennt.

Rendert `<time dateTime={isoString} title={absoluterText}>{berechneterText}</time>` — ein
schlichtes Inline-Element ohne eigene Optik (kein Underline/Hover-Hinweis), passend zu GitHubs
eigener Darstellung: die einzige Affordance ist der native Tooltip.

## 7. Formatierungslogik (`relativeTimeFormat.ts`)

Eine reine Funktion, die GitHubs `#resolveFormat`/`#getRelativeFormat`/`#getDurationFormat`/
`#getDateTimeFormat`/`#getMicroRelativeFormat`-Logik nachbildet (Verhalten nachgebaut, kein
Code kopiert — MIT-lizenziert, aber eigene Implementierung):

```ts
interface RelativeTimeFormatOptions {
  format: 'auto' | 'relative' | 'datetime' | 'duration' | 'micro';
  formatStyle?: 'long' | 'short' | 'narrow';
  tense: 'auto' | 'past' | 'future';
  threshold: string;
  precision: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';
  locale?: string;
  timeZone?: string;
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
}

interface RelativeTimeFormatResult {
  text: string;
  title: string;
  /** Infinity, wenn dieser Format-Modus nie erneut aktualisiert werden muss (z. B. 'datetime'). */
  nextUpdateMs: number;
}

function computeRelativeTimeText(date: Date, now: number, options: RelativeTimeFormatOptions): RelativeTimeFormatResult;
```

`nextUpdateMs` folgt GitHubs `getUnitFactor`-Heuristik: 1s-Granularität unter einer Minute
Abstand, 1min-Granularität unter einer Stunde, sonst 1h-Granularität — nie öfter aktualisieren,
als für die aktuell sichtbare Granularität nötig ist.

`duration.ts` übernimmt reine ISO-8601-Dauer-Parsing/-Vergleichs-Logik (für `threshold`) sowie die
Umrechnung einer Zeitspanne zwischen zwei Zeitpunkten in eine `{ years, months, weeks, days,
hours, minutes, seconds }`-Struktur — beides ebenfalls ohne externe Library.

## 8. Geteilter Scheduler (`relativeTimeScheduler.ts`)

Ein Modul-Singleton, der GitHubs `dateObserver` nachbildet:

```ts
export function scheduleRelativeTimeUpdate(getNextDelayMs: () => number, onTick: () => void): () => void; // gibt unsubscribe zurück
```

Intern hält der Singleton ein `Set` registrierter `{ getNextDelayMs, onTick }`-Paare, berechnet
bei jeder (Neu-)Registrierung sowie nach jedem eigenen Tick das Minimum aller `getNextDelayMs()`,
setzt genau **einen** `setTimeout` auf dieses Minimum und ruft bei Ablauf `onTick()` auf **allen**
registrierten Paaren auf (jede Komponente berechnet dabei mit einem frischen `Date.now()` neu, ob
und was sich geändert hat) — exakt das Verhalten von GitHubs `dateObserver.observe()`/`update()`.

## 9. Datenfluss in `RelativeTime.tsx`

1. `date`-Prop (Date|String) wird zu einem `Date`-Objekt normalisiert.
2. Bei jedem Render (initial und nach jedem Scheduler-Tick) wird `computeRelativeTimeText(date,
   Date.now(), options)` aufgerufen — `options` kombiniert explizite Props mit
   `useDateTimeDefaults()` (Prop-Werte haben Vorrang).
3. Gerendert wird `<time dateTime={date.toISOString()} title={noTitle ? undefined : title}
   className={className}>{text}</time>`.
4. Ist `nextUpdateMs` endlich, registriert ein `useEffect` die Komponente beim Scheduler
   (`scheduleRelativeTimeUpdate`); der `onTick`-Callback löst ein Re-Render aus (z. B. via
   `useReducer`-basiertem Force-Update), wodurch Schritt 2 mit einem frischen `now` erneut läuft.
5. Beim Unmount (oder wenn `nextUpdateMs` auf `Infinity` wechselt, z. B. weil `format="datetime"`
   gesetzt wurde) wird die Registrierung entfernt.

## 10. Fehlerbehandlung

Ein nicht parsbares `date` (ungültiger String, `Number.isNaN(date.getTime())`) wirft nicht —
`computeRelativeTimeText` gibt einen leeren/neutralen Text zurück (kein Scheduler-Eintrag, da
keine sinnvolle Restzeit berechenbar ist), analog zu GitHubs eigenem robusten Verhalten bei
ungültigen Zeitstempeln.

## 11. Testing

**jsdom (`RelativeTime.test.tsx`, `relativeTimeScheduler.test.ts`)**: `vi.useFakeTimers()` +
`vi.setSystemTime()` für deterministisches "jetzt". Abgedeckt:

- Relativ-Formatierung über alle Einheiten (Sekunden bis Jahre), Vergangenheit und Zukunft.
- `threshold` schaltet jenseits der Schwelle auf absolutes Datum um.
- `tense="past"`/`"future"` erzwingt die jeweilige Richtung.
- `title` enthält die korrekt formatierte absolute Zeit; `noTitle` unterdrückt das Attribut.
- **Scheduler-Verhalten**: mehrere gleichzeitig gemountete `RelativeTime`-Instanzen erzeugen
  nachweisbar nur **einen** aktiven Timer (Spy auf `setTimeout`-Aufrufe); Unmount stoppt weitere
  Updates für diese Instanz; eine `format="datetime"`-Instanz registriert sich nie beim Scheduler.
- `DateTimeProvider`: gesetzter Context-Wert wird verwendet, ein expliziter Prop überschreibt ihn;
  `useDateTimeDefaults()` gibt `{}` zurück, wenn kein Provider im Baum ist (kein Wurf).
- Ungültiges `date` wirft nicht und rendert einen neutralen Fallback.

**Self-Baseline Visual (`RelativeTime.visual.test.tsx`)**: `toMatchScreenshot()` für eine
Auswahl repräsentativer gerenderter Zeitangaben (siehe Abschnitt 3) — kein
`getComputedStyle()`-Vergleich gegen Joy.

## 12. Barrelexport

`packages/ui/src/index.ts` exportiert `RelativeTime`, `DateTimeProvider`, `useDateTimeDefaults`
sowie die zugehörigen Typen (`RelativeTimeProps`, `DateTimeContextValue`).
