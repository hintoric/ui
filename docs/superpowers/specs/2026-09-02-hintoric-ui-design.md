# @hintoric/ui — Design Spec

Datum: 2026-09-02
Status: Approved (Phase 1 Scope)

## 1. Ziel

`@hintoric/ui` ist eine neue React-Komponentenbibliothek, die

- **API-kompatibel zu [MUI Joy UI](https://mui.com/joy-ui/)** ist (gleiche Komponenten-Namen, gleiche Props wie `variant`, `color`, `size`, `startDecorator`/`endDecorator`, `component`, gleiche Default-Werte), damit bestehender Joy-UI-Code mit minimalem Aufwand migrierbar ist,
- als Verhaltens-/Barrierefreiheits-Unterbau **[Base UI](https://base-ui.com)** (`@base-ui/react`, aktuell v1.x) verwendet statt des veralteten `@mui/base`,
- als Styling-Basis **Tailwind CSS v4** nutzt statt Emotion/CSS-in-JS,
- unter dem Scope `@hintoric` öffentlich auf npm veröffentlicht wird.

Nicht-Ziel: eine 1:1-Portierung der Joy-UI-Implementierung. Übernommen wird die **Optik und die Props-API**, nicht der Emotion-basierte Unterbau.

## 2. Repo-Struktur

pnpm-Workspace-Monorepo:

```
hintoric-ui/
├── packages/
│   └── ui/                  # @hintoric/ui
│       ├── src/
│       │   ├── theme/       # Farbpaletten, CSS-Variablen, ColorSchemeProvider
│       │   ├── styles/      # Tailwind v4 @theme-Definition, globale CSS-Entry
│       │   ├── utils/       # cva-Helper, className-Merge-Utility (clsx+tailwind-merge)
│       │   └── components/
│       │       ├── Box/
│       │       ├── Stack/
│       │       ├── Typography/
│       │       ├── Sheet/
│       │       ├── Card/
│       │       ├── Button/
│       │       ├── IconButton/
│       │       ├── Input/
│       │       └── Textarea/
│       ├── package.json
│       └── vite.config.ts   # Library Mode Build
├── apps/
│   └── playground/          # Vite + React App zum visuellen Testen
├── package.json              # Workspace-Root
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .changeset/
```

Jede Komponente liegt in einem eigenen Ordner mit `ComponentName.tsx`, `ComponentName.test.tsx`, `types.ts` (Props-Interface) und `index.ts` (Re-Export). Das ist bewusst granular, damit jede Komponente unabhängig lesbar, testbar und ersetzbar ist.

## 3. Styling-Stack

- **Tailwind CSS v4**, CSS-first Konfiguration über `@theme` in `packages/ui/src/styles/theme.css`.
- **Farbpaletten**: Joy UIs Skalen für `primary`, `neutral`, `danger`, `success`, `warning` (je Stufen `50`–`900`) werden als CSS-Custom-Properties definiert, z. B. `--color-primary-500`. Werte werden 1:1 aus Joy UIs Default-Theme übernommen.
- **Light/Dark**: Umschaltung über ein `data-color-scheme="light" | "dark"`-Attribut auf einem Wrapper-Element (Pendant zu Joys `data-joy-color-scheme`). Kein JS-Theme-Objekt zur Laufzeit — die CSS-Variablen ändern sich per Attribut-Selektor in CSS.
- **Variant-Matrix**: `variant` (`solid` | `soft` | `outlined` | `plain`) × `color` (`primary` | `neutral` | `danger` | `success` | `warning`) × `size` (`sm` | `md` | `lg`) wird pro Komponente über `class-variance-authority` (cva) abgebildet. Jede Komponente definiert eine cva-Config mit diesen Achsen; die konkreten Tailwind-Klassen je Zelle werden visuell gegen die echte Joy-UI-Referenz (Storybook/Docs von mui.com/joy-ui) abgeglichen.
- **className-Merging**: `clsx` kombiniert bedingte Klassen, `tailwind-merge` löst Konflikte auf (z. B. wenn ein von außen übergebenes `className` eine cva-Klasse überschreiben soll). Eine gemeinsame Utility `cx()` in `src/utils/cx.ts` bündelt beides.
- **Kein `sx`-Prop.** Komponenten akzeptieren `className` als Erweiterungspunkt. Dieser Punkt ist eine bewusste Abweichung von 1:1-Joy-UI-Kompatibilität (siehe Abschnitt 7).

## 4. Theming-API

Statt Joys `CssVarsProvider`/`extendTheme` gibt es einen leichtgewichtigen `ColorSchemeProvider`:

```tsx
<ColorSchemeProvider defaultMode="light">
  <App />
</ColorSchemeProvider>
```

- Setzt `data-color-scheme` auf ein Wrapper-`<div>` (oder `document.documentElement`, konfigurierbar).
- Liest/schreibt die aktuelle Einstellung optional in `localStorage` (Parität zu Joys Verhalten), aber ohne eigenes React-Context-Theme-Objekt — Komponenten lesen nichts aus dem Context, sie verlassen sich rein auf CSS-Variablen-Kaskade.
- Ein `useColorScheme()`-Hook liefert `{ mode, setMode }` für Komponenten wie einen Dark-Mode-Toggle.

Eine tiefere Theme-Anpassung (eigene Farbpaletten) erfolgt, indem Konsument:innen die CSS-Variablen in ihrem eigenen Stylesheet überschreiben — nicht über ein JS-Theme-Objekt.

## 5. Komponenten-Pattern

Zwei Kategorien:

**A. Komponenten mit Base-UI-Primitive** (Button, IconButton, Input, Textarea):
- Base UI liefert die unstyled Primitive (`@base-ui/react/button`, `@base-ui/react/input`, …) inkl. Verhalten, ARIA-Attributen, Zustands-Data-Attributen (`data-disabled`, `data-pressed`, etc.).
- Unsere Komponente ist ein dünner Wrapper: Base-UI-Primitive + cva-generierte Klassen basierend auf `variant`/`color`/`size` + Forwarding aller übrigen Props/Refs.
- Joy-UI-spezifische Props ohne Base-UI-Äquivalent (z. B. `startDecorator`/`endDecorator`) werden in der Wrapper-Komponente selbst gerendert (zusätzliche `<span>`-Slots links/rechts vom `children`-Inhalt).

**B. Rein visuelle Komponenten ohne Base-UI-Primitive** (Box, Stack, Typography, Sheet, Card):
- Kein Base-UI-Pendant nötig, da keine Interaktions-/A11y-Logik erforderlich ist.
- Polymorphes Rendering (Joys `component`-Prop, z. B. `<Typography component="h1">`) wird über Base UI's `useRender`-Hook umgesetzt, statt eine eigene Polymorphic-Component-Lösung zu bauen.
- Styling ebenfalls über cva + Tailwind-Klassen (z. B. Stack: `display:flex` + `gap`/`direction`-Varianten; Typography: `level`-Prop wie bei Joy UI, gemappt auf Tailwind Font-Größen/-Gewichte).

Jede Komponente exportiert ein TypeScript-Props-Interface, das strukturell den Joy-UI-Props entspricht (minus `sx`, plus `className`-Verhalten wie oben beschrieben).

## 6. Phase-1-Komponenten

| Komponente | Base-UI-Primitive? | Bemerkung |
|---|---|---|
| `ColorSchemeProvider` | — | Ersatz für `CssVarsProvider` |
| `Box` | `useRender` | Generischer Layout-Container |
| `Stack` | `useRender` | Flex-Layout-Helper |
| `Typography` | `useRender` | `level`-Prop (h1…body-sm) wie Joy UI |
| `Sheet` | `useRender` | Oberflächen-Container mit Varianten |
| `Card` | `useRender` | Zusammengesetzt aus Sheet + Layout |
| `Button` | `@base-ui/react/button` | inkl. `loading`, `startDecorator`/`endDecorator` |
| `IconButton` | `@base-ui/react/button` | Quadratische Button-Variante für Icons |
| `Input` | `@base-ui/react/input` | inkl. `startDecorator`/`endDecorator` |
| `Textarea` | natives `<textarea>` + `useRender` | Base UI liefert kein dediziertes Textarea-Primitive |

Ziel von Phase 1: das Gesamtmuster (Theme, Variant-System, Base-UI-Integration, Build, Publish) end-to-end beweisen, bevor die übrigen ~40 Joy-UI-Komponenten in weiteren Phasen nach demselben Schema ergänzt werden (z. B. Phase 2: Select, Checkbox, Radio, Switch, Chip, Alert, Modal/Dialog, Avatar).

## 7. Bekannte Abweichungen von Joy UI

Bewusste, mit dem Auftraggeber abgestimmte Abweichungen von 1:1-API-Kompatibilität:

- **Kein `sx`-Prop.** Ersetzt durch `className` (siehe Abschnitt 3). Migrierender Code, der `sx` nutzt, muss auf Tailwind-Klassen umgestellt werden.
- **Kein Laufzeit-Theme-Objekt** (`extendTheme`). Theme-Anpassung erfolgt über CSS-Variablen-Overrides statt eines JS-Objekts.
- Ansonsten: Komponenten-Namen, Kern-Props (`variant`, `color`, `size`, `component`, Decorator-Props) und visuelles Verhalten bleiben deckungsgleich zu Joy UI.

## 8. Testing

- **Vitest + React Testing Library**: pro Komponente Tests für Rendering, Prop-Varianten (mind. eine Stichprobe je `variant`/`color`), Ref-Forwarding, sowie grundlegende Tastatur-/ARIA-Erwartungen (übernommen/verifiziert via Base UI, wo zutreffend).
- **Visuelle Verifikation**: `apps/playground` enthält für jede Komponente eine Seite/Route, die alle `variant`×`color`×`size`-Kombinationen nebeneinander zeigt, zum manuellen Abgleich gegen die Joy-UI-Referenz (mui.com/joy-ui-Doku).
- Kein Storybook in Phase 1 (bewusste Entscheidung, siehe Brainstorming-Verlauf).

## 9. Build & Publish

- **Build**: Vite Library Mode in `packages/ui`, ESM-Output, Typdeklarationen via `vite-plugin-dts`.
- **Peer Dependencies**: `react`, `react-dom`, `@base-ui/react`.
- **package.json**: `"name": "@hintoric/ui"`, `"sideEffects": false` (außer dem CSS-Einstiegspunkt), `exports`-Map für JS + CSS-Datei (Konsument:innen importieren einmal das globale Stylesheet, z. B. `@hintoric/ui/styles.css`).
- **Versionierung/Release**: Changesets, Veröffentlichung auf öffentlichem npm unter dem Scope `@hintoric`.
- Tailwind-Konfiguration wird so gebaut, dass Konsument:innen entweder (a) das vorgebaute CSS importieren oder (b) `@hintoric/ui`s Tailwind-Preset in ihre eigene Tailwind-v4-Konfiguration einbinden können (für Tree-Shaking von ungenutzten Utility-Klassen in größeren Apps). Genaue Mechanik wird beim Implementieren von Button/Input als erste Komponenten geprüft und ggf. in dieser Spec nachgeschärft, falls sich Abweichungen ergeben.

## 10. Out of Scope (Phase 1)

- Alle Joy-UI-Komponenten außerhalb der Liste in Abschnitt 6 (~40 weitere: Select, Checkbox, Radio, Switch, Chip, Alert, Modal/Dialog, Avatar, Tabs, Table, Tooltip, Menu, Slider, …).
- RTL-Support.
- Next.js-spezifische SSR-Theming-Helper (z. B. `InitColorSchemeScript`-Äquivalent für FOUC-Vermeidung) — wird in einer späteren Phase nachgezogen, sobald ein SSR-Konsument existiert.
- Icon-Set/Icon-Komponenten.
- Animationssystem über das hinaus, was native CSS-Transitions + Base UI's eingebaute Open/Close-Transition-Unterstützung (z. B. für Dialog) bieten.
