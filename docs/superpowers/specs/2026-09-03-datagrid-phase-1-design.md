# @hintoric/ui — DataGrid (Phase 1: Foundation) — Design Spec

Datum: 2026-09-03
Status: Approved (Phase 1 Scope)

## 1. Ziel

Aufbauend auf Anfragen nach einem Excel/Google-Sheets- bzw. Blueprint.js-Table-artigen
(`https://blueprintjs.com/docs/#table/features`) Grid-Component für `@hintoric/ui`, das auf
`@tanstack/react-table` (headless Table-Logik) aufsetzt und mit den bestehenden
`@hintoric/ui`-Design-Tokens/Primitives gestylt wird.

Das Gesamtziel ("volles Spreadsheet-Grid": Zellauswahl, Keyboard-Navigation, Copy/Paste,
Inline-Editing, Virtualisierung für große Datenmengen) ist zu groß für eine einzelne
Spec/Plan/Implementierungs-Runde. Es wird in vier Phasen zerlegt:

1. **Phase 1 — Foundation** (dieses Dokument): `DataGrid` verdrahtet mit TanStack Tables
   Core Row Model, Column-Defs, Sorting, Column-Resizing; gestylt mit unseren Tokens.
   Keine Zellauswahl/Editing.
2. **Phase 2 — Selection & Navigation**: Zell-/Range-Auswahl, Keyboard-Pfeil-/Tab-Navigation,
   Copy-to-Clipboard.
3. **Phase 3 — Editing**: Inline-Zell-Editing (Text/Select/etc. Cell-Types), Paste-to-Fill.
4. **Phase 4 — Scale**: Row-Virtualisierung für große Datenmengen.

Phase 2–4 werden erst gespeckt, wenn die jeweils vorherige Phase implementiert ist — sie
hängen an Architekturentscheidungen, die erst in der vorherigen Phase konkret werden (z. B.
beeinflusst Virtualisierung, wie Selection-Ranges berechnet werden).

**Nicht-Ziel dieser Phase**: Zellauswahl, Keyboard-Navigation, Copy/Paste, Editing,
Virtualisierung, Row-Selection, Pagination, Column-Pinning/-Reordering/-Grouping.

## 2. Abweichung von der Projekt-Regel "Visual Regression gegen echtes @mui/joy"

CLAUDE.md verlangt für jede Komponente einen visuellen Vergleichstest gegen die echte
`@mui/joy`-Komponente. **`@mui/joy` hat kein Äquivalent zu einem DataGrid** (MUIs eigenes
Pendant, `@mui/x-data-grid`, ist ein separates, unabhängiges Produkt mit eigener API — kein
Teil von Joy UI und keine sinnvolle Vergleichsbasis für Style-Parität).

Für `DataGrid` (und alle Folge-Phasen) gilt daher eine bewusste, dokumentierte Ausnahme:

- Kein `getComputedStyle()`-Vergleich gegen eine Joy-UI-Referenzkomponente.
- Stattdessen: jsdom-Verhaltenstests (Sortier-/Resize-Logik, Rendering) plus
  **Self-Baseline-Screenshots** über Vitests `toMatchScreenshot()` — dieselbe Mechanik wie
  bei allen anderen Komponenten, aber nur gegen die eigene vorherige `DataGrid`-Baseline,
  nicht Seite-an-Seite mit Joy.
- Die visuelle Konsistenz zu Joy ergibt sich indirekt daraus, dass `DataGrid`s
  Default-Rendering dieselben Style-Bausteine wiederverwendet wie die bereits gegen Joy
  verifizierte `Table`-Komponente (siehe Abschnitt 5).

Diese Ausnahme wird im Kopf von `DataGrid.visual.test.tsx` als Kommentar dokumentiert.

## 3. Neue Abhängigkeit

`@tanstack/react-table` wird als reguläre Dependency zu `packages/ui/package.json`
hinzugefügt. Kein Base-UI-Primitive nötig: TanStack Table liefert die headless Logik
(Sortier-/Resize-State, Row-Model), native `<table>`-Semantik reicht für Barrierefreiheit
aus — analog zur bestehenden `Table`-Komponente, die ebenfalls ohne Base-UI-Primitive
auskommt.

**Versions-Hinweis (nach Recherche gegen das echte Package korrigiert):** Die aktuelle
`latest`-Version ist `9.x`, die die klassische v8-`useReactTable({ columns, data,
getCoreRowModel: getCoreRowModel() })`-API vollständig ersetzt hat — diese existiert in v9
nur noch als `@deprecated` markiertes `useLegacyTable` unter einem separaten
`/legacy`-Importpfad. Nach expliziter Nutzer-Entscheidung baut Phase 1 auf v9s neuer
`useTable`/`tableFeatures`-API auf (siehe Abschnitt 5) statt auf dem veralteten Legacy-Pfad
oder einem Pin auf `^8`. Die Namen der Runtime-Optionen und -Methoden
(`enableSorting`, `onSortingChange`, `header.getResizeHandler()`, `column.getSize()`, etc.)
sind gegenüber v8 unverändert geblieben — geändert hat sich nur die Art, wie Features beim
Hook registriert werden (`tableFeatures({...})` statt einzelner `getXRowModel()`-Optionen).

## 4. Dateistruktur

```
packages/ui/src/components/DataGrid/
  useDataGrid.ts          — Hook, dünner Wrapper um useReactTable
  DataGridContext.ts      — { table, size, variant, color, borderAxis }
  DataGrid.tsx            — Root; rendert Default-Grid ohne children, sonst Context-Provider
  DataGridHeaderCell.tsx  — <th>: Sort-Click-Handler, Sort-Icon, Resize-Handle
  DataGridRow.tsx         — <tr>
  DataGridCell.tsx        — <td>, nutzt flexRender
  dataGridVariants.ts     — reuse TABLE_SIZE_CLASS/TABLE_HEAD_CLASS/TABLE_BORDER_AXIS_CLASS/STATIC_COLOR_CLASSES
  types.ts
  index.ts
  DataGrid.test.tsx
packages/ui/src/visual/
  DataGrid.visual.test.tsx
```

## 5. API & State-Modell

`useDataGrid` ist ein dünner Wrapper um TanStack Table v9s `useTable`-Hook. Die
Feature-Zusammensetzung (`tableFeatures({...})`) wird **einmalig auf Modulebene**
fest verdrahtet — Consumer sehen davon nichts, sie übergeben weiterhin dieselben
Options-Namen wie in TanStack Table v8 (`enableSorting`, `onSortingChange`,
`enableColumnResizing`, `onColumnSizingChange`), da sich diese Namen zwischen v8 und v9
nicht geändert haben (siehe Abschnitt 3):

```tsx
// useDataGrid.ts — einmalig, modulweit
import { tableFeatures, rowSortingFeature, columnSizingFeature, columnResizingFeature, createSortedRowModel } from '@tanstack/react-table';

const dataGridFeatures = tableFeatures({
  rowSortingFeature,
  columnSizingFeature,
  columnResizingFeature,
  sortedRowModel: createSortedRowModel(),
});
```

Aufruf durch Consumer:

```tsx
const { table } = useDataGrid<TData>({
  columns,                              // DataGridColumnDef<TData>[] (re-exportiert von uns, an dataGridFeatures gebunden)
  data,
  enableSorting,                        // default true
  enableColumnResizing,                 // default true
  sorting, onSortingChange,             // optional, controlled — sonst verwaltet TanStack intern
  columnSizing, onColumnSizingChange,   // optional, controlled — sonst verwaltet TanStack intern
});
```

`ColumnDef`/`Table`/`Header`/`Row`/`Cell` sind in v9 generisch über das konkrete
Feature-Set (`ColumnDef<TFeatures, TData, TValue>`), nicht nur über `TData` wie in v8. Wir
re-exportieren daher eigene, an `typeof dataGridFeatures` gebundene Alias-Typen
(`DataGridColumnDef<TData, TValue>`, `DataGridTable<TData>`, `DataGridHeader<TData>`,
`DataGridRowInstance<TData>`, `DataGridCellInstance<TData>`), damit Consumer nie mit dem
`TFeatures`-Typparameter selbst hantieren müssen.

Zwei Render-Modi, beide über denselben Hook/Context:

**Shorthand** (häufigster Fall):

```tsx
<DataGrid columns={columns} data={data} size="md" color="primary" />
```

**Compound** (custom Layout):

```tsx
const { table } = useDataGrid({ columns, data });

<DataGrid table={table}>
  {table.getHeaderGroups().map((hg) => (
    <DataGridRow key={hg.id}>
      {hg.headers.map((header) => (
        <DataGridHeaderCell key={header.id} header={header} />
      ))}
    </DataGridRow>
  ))}
  {table.getRowModel().rows.map((row) => (
    <DataGridRow key={row.id}>
      {row.getAllCells().map((cell) => (
        <DataGridCell key={cell.id} cell={cell} />
      ))}
    </DataGridRow>
  ))}
</DataGrid>;
```

`row.getAllCells()` (nicht `getVisibleCells()`) wird verwendet: Letzteres gehört zum
`columnVisibilityFeature`, das Phase 1 nicht registriert (kein Spalten-Ein-/Ausblenden in
dieser Phase) — `getAllCells()` ist eine Core-Methode und immer verfügbar.

Spaltenbreiten für Resizing folgen dem von TanStack empfohlenen
`<colgroup><col style={{ width }} /></colgroup>`-Ansatz (Tailwind kann keine dynamischen
Pixel-Breiten pro Spalte ausdrücken), kombiniert mit `Table`s bestehender `table-fixed`
Layout-Klasse.

## 6. Styling

`DataGrid`s Default-Rendering baut die äußere `<table>` durch Wiederverwendung von
`Table`s eigenen Klassen (`TABLE_SIZE_CLASS`, `TABLE_HEAD_CLASS`, `TABLE_BORDER_AXIS_CLASS`,
`STATIC_COLOR_CLASSES`), sodass ein `<DataGrid>` mit denselben Props optisch identisch zu
einem `<Table>` aussieht — Sorting/Resizing sind additives Verhalten, keine eigene
Optik-Sprache.

- **Sort-Indikator**: Wiederverwendung von `ArrowDropDownIcon` (bereits vorhanden, aus
  Autocomplete), sichtbar wenn `header.column.getCanSort()`, Rotation nach demselben
  `data-[state]`-Rotationsmuster wie bei `AccordionSummary` (runter für `desc`, 180° für
  `asc`, ausgeblendet/gedimmt wenn unsortiert).
- **Resize-Handle**: absolut positionierter `div` an der rechten Kante der Header-Zelle,
  `cursor-col-resize`, angetrieben von `header.getResizeHandler()`, sichtbar bei
  Header-Hover.
- **Interaktive States**: sortierbare Header-Zellen erhalten `cursor-pointer` +
  `hover:bg-*Hover` über die bestehende `HOVER_BG_CLASS`-Map (bereits für Menu/Select
  gebaut).

## 7. Testing

- **`DataGrid.test.tsx`** (jsdom): Shorthand-Rendering; Sortier-Toggle per Header-Klick
  (asc → desc → unsorted); controlled `sorting`/`onSortingChange`; Resize-Handle
  aktualisiert `columnSizing`; Compound-Modus erzeugt dieselbe DOM-Struktur wie Shorthand.
- **`src/visual/DataGrid.visual.test.tsx`**: Self-Baseline-Screenshots via
  `toMatchScreenshot()` (siehe Abschnitt 2) über die Size × Color × BorderAxis-Matrix,
  sortierte/unsortierte/gehoverte Header-States, sowie einen Resize-Drag-Zwischenzustand.
  Kein `getComputedStyle()`-Vergleich gegen Joy für diese Familie.

## 8. Barrelexport

`packages/ui/src/index.ts` exportiert `DataGrid`, `DataGridHeaderCell`, `DataGridRow`,
`DataGridCell`, `useDataGrid` sowie die zugehörigen Typen. TanStack Tables eigene Typen
(`ColumnDef`, `SortingState`, etc.) werden nicht re-exportiert — Consumer importieren sie
bei Bedarf direkt aus `@tanstack/react-table`.
