# Core-Komponenten-Audit für `@hintoric/ui`

Stand: 2026-09-24

## Ergebnis

`hintoric/core` verwendet `@hintoric/ui` bereits an den richtigen Grenzen:

- Primitive und wiederverwendbare UI kommen aus der Bibliothek: `Button`, `IconButton`,
  `Input`, `FormControl`, `FormLabel`, `Alert`, `Card`-Bausteine, `FileInput`,
  `Modal`/`ModalDialog`, `Menu`/`MenuItem`, `Snackbar`, `Skeleton`, `Tooltip`,
  `Stack`, `Typography`, `Link`, `LocaleSwitcher` und `ColorSchemeToggle`.
- Die App hält nur Verhalten und Domänenlogik: Upload-/Navigationsabläufe,
  Account-Menü mit Sessiondaten, Dokument-Kacheln, PDF-Viewer, DOCX-Editor-Integration
  und die Onboarding-/Auth-Kompositionen.
- Es gibt keine belastbare neue generische Komponente in `core`, die aktuell in die
  Library verschoben werden sollte.

## Konkrete Befunde

| Oberfläche in `core` | Entscheidung | Begründung |
| --- | --- | --- |
| `routes/documents.tsx` | In `@hintoric/ui` belassen | `FileInput` wird bereits für Drag-and-drop verwendet; der versteckte native Picker ist nur der technische Trigger eines domänenspezifischen Upload-Flows. |
| `layouts/AccountBar.tsx` | In `core` belassen | Session, Tenant, Logout und verschachtelte Appearance-/Language-Views sind Produktlogik, keine neutrale UI. Die Oberfläche komponiert bereits Library-Primitives. |
| `layouts/CreateMenu.tsx` | In `core` belassen | Upload-Navigation, Dateityp und Fehler-Toast sind app-spezifisch. `Dropdown`, `MenuButton`, `Menu`, `MenuItem` und `Snackbar` kommen korrekt aus der Library. |
| `components/RenameDocumentDialog.tsx` | In `core` belassen, Library-Komposition verwenden | Der Dialog kennt `DocumentView` und `renameDocument`. Für neue Dialoge sollen `DialogTitle`, `DialogContent` und `DialogActions` bevorzugt werden, sofern ihre Semantik zum Layout passt. |
| `components/DocumentEditor.tsx` / `PdfViewer.tsx` | In `core` belassen | Drittanbieter-Editor, PDF-Rendering und Dokumentaktionen sind keine generische UI-API. Nur der umgebende Chrome soll Library-Primitives verwenden. |
| `layouts/TopNavHeader.tsx` | In `core` belassen | Navigation, Routing, aktive Anzeige und responsive Suchzeile sind Produktlayout. `Box`, `Link`, `Input`, `Typography` werden bereits korrekt wiederverwendet. |
| `i18n/LanguageSwitcher.tsx` und `lib/ColorSchemeButton.tsx` | In `core` belassen | Das sind dünne Adapter für i18next bzw. lokale Übersetzungen. Sie erfinden keine visuelle Komponente. |

## Regeln für neue Komponenten

1. **Erst Library suchen, dann bauen.** Vor einem neuen `<button>`, `<input>`, Dialog,
   Menü, Toast, Formularfeld oder Layout-Primitive muss geprüft werden, ob
   `@hintoric/ui` bereits eine passende Komponente exportiert.
2. **`core` komponiert, `ui` abstrahiert.** Session-, Routing-, Upload-, Dokument-,
   Editor- und i18n-Logik bleibt in `core`. In die Library darf nur eine
   domänenneutrale Komponente mit mindestens zwei realistischen Konsumenten.
3. **Keine Einmal-Komponenten für Produktlayouts.** `AccountBar`, `CreateMenu`,
   `DocumentTile` und ähnliche Produktbausteine werden nicht als scheinbar
   allgemeine Library-Komponenten umbenannt.
4. **Joy-/Library-API beibehalten.** Für Library-Komponenten gelten die vorhandenen
   Props und Tokens (`variant`, `color`, `size`, `component`, Decorators,
   `className`). Keine eigenen Farbwerte, Schatten, Radien oder parallelen
   Variantensysteme erfinden.
5. **Layout-Klassen sind erlaubt, Token-Klassen nicht duplizieren.** App-CSS darf
   Grid, Positionierung, Breite und Produktlayout definieren. Farben, Typografie,
   Fokuszustände und Komponentengrundformen kommen aus `@hintoric/ui`.
6. **Abweichungen müssen begründet werden.** Wenn eine Library-Komponente nicht
   passt, muss der Grund im Code oder Audit festgehalten werden; keine stille
   lokale Kopie.
7. **Library-Änderungen brauchen vollständige Visual-Regressionsabdeckung.** Neue
   oder geänderte Komponenten folgen `CLAUDE.md`: Joy-Parität, Light/Dark,
   Interaktionszustände, `getComputedStyle()`-Assertions, Screenshots und
   Changeset.

## Empfohlene nächste Vereinheitlichung

Bei einer nächsten Änderung an `RenameDocumentDialog` sollte die Überschrift als
`DialogTitle` und die Aktionszeile als `DialogActions` geprüft werden. Das ist eine
Nutzung bereits vorhandener Library-Bausteine, kein Anlass für eine neue
`RenameDocumentDialog`-Komponente in `@hintoric/ui`.

