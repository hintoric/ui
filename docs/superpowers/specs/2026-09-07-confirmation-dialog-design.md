# ConfirmationDialog

Datum: 2026-09-07 · Status: Entwurf

Ein Dialog für eine unumkehrbare Tat, der die Bestätigung nicht klicken, sondern tippen lässt.

## Warum in dieser Bibliothek

Jede Anwendung, die etwas endgültig löscht, baut denselben Dialog: Titel, eine Warnung, ein Feld, in
das der Name des Objekts getippt werden muss, ein gesperrter Knopf, der erst bei Gleichheit aufgeht.
Nichts daran ist anwendungsspezifisch — und jede Anwendung, die ihn selbst baut, baut auch die
Doppelklick-Sperre und den Zustandsreset beim Wiederöffnen selbst, oder eben nicht.

Er ist ein **Block**, kein Primitiv: er löst eine ganze Aufgabe aus mehreren Komponenten, wo alles in
den übrigen Kategorien ein Teil ist, das man selbst zusammensetzt. Wer die Teile einzeln will, hat
sie schon — `Modal`, `Input`, `Button`.

## Was er ausdrücklich nicht tut

**Er hat keine eigenen Texte.** Kein Titel, keine Beschreibung, keine Knopfbeschriftung, keine
Fehlermeldung mit englischem Standardwert. Dieselbe Entscheidung wie beim `LocaleSwitcher`, aus
demselben Grund: Eine Darstellungsbibliothek legt die Sprache ihrer Konsumenten nicht fest. Englische
Vorgaben wären bequemer und würden genau dann englischen Text veröffentlichen, wenn jemand eine
übersieht — ein Fehler, der erst im Betrieb auffällt.

**Er löscht nicht selbst.** Er ruft `onConfirm` und wartet auf das Ergebnis. Was dort geschieht —
`fetch`, ein Mutation-Hook, ein Server-Aufruf — bleibt draußen.

**Er hält sein `open` nicht selbst.** Kontrolliert wie `Modal` und `Drawer` in dieser Bibliothek.
Ein imperativer Haken (`await confirm({…})`) wäre am Aufrufort angenehmer, verlangte aber einen
Provider im Wurzelknoten, einen Portal-Wirt und eine Warteschlange für gleichzeitige Aufrufe — eine
zweite, andersartige API-Sorte in einer bisher durchgehend kontrollierten Bibliothek.

## API

```ts
export interface ConfirmationDialogProps {
  open: boolean;
  /** Ruft der Block auch selbst auf, sobald `onConfirm` erfolgreich war. */
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  /** Der Text, den der Benutzer eintippen muss — meist der Name des Objekts. */
  confirmationText: string;

  title: React.ReactNode;
  description?: React.ReactNode;
  /** Der Satz über dem Feld. Bekommt `confirmationText` übergeben. */
  prompt: (confirmationText: string) => React.ReactNode;
  /** Übersetzt eine Ablehnung aus `onConfirm` in Text für den Fehler-Alert. */
  errorMessage: (error: unknown) => React.ReactNode;
  confirmLabel: React.ReactNode;
  cancelLabel: React.ReactNode;

  color?: JoyColor;          // default 'danger'
  size?: 'sm' | 'md' | 'lg'; // default 'md'
}
```

Am Aufrufort:

```tsx
<ConfirmationDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={() => deleteCustomer(customer.id)}
  confirmationText={customer.name}
  title="Kunden löschen"
  description="Alle Vorgänge dieses Kunden werden mitgelöscht. Das lässt sich nicht rückgängig machen."
  prompt={(name) => <>Tippe <b>{name}</b>, um das Löschen zu bestätigen.</>}
  errorMessage={(error) => (error instanceof ApiError ? error.detail : 'Löschen fehlgeschlagen.')}
  confirmLabel="Endgültig löschen"
  cancelLabel="Abbrechen"
/>
```

### Warum `prompt` eine Funktion ist

Als schlichte `ReactNode` müsste der Aufrufer den Namen ein zweites Mal hinschreiben. Wer dabei
„Kunde-4711" anzeigt, aber gegen „kunde-4711" vergleicht, baut einen Dialog, der sich nicht
bestätigen lässt — ein Fehler, den keine Typprüfung findet und den nur ein Benutzer merkt, der
nicht weiterkommt. Die Funktion bekommt dieselbe Zeichenkette, die verglichen wird; ein
Auseinanderlaufen ist strukturell unmöglich. Die Wortstellung bleibt trotzdem beim Aufrufer, was
für deutsche Sätze nötig ist.

### Warum `errorMessage` Pflicht ist

Eine Ablehnung ist nicht zwingend ein `Error` mit lesbarer `message` — ein abgelehntes `fetch`
liefert ein Antwortobjekt, eine API einen Fehlercode. Der Block hat keinen eigenen Ersatztext (siehe
oben) und darf deshalb nicht in die Lage kommen, einen leeren Alert zu zeigen. Der Aufrufer weiß,
wie sein Fehlerobjekt zu lesen ist, und in welcher Sprache.

Der Block fängt die Ablehnung, gibt sie aber unverändert an `errorMessage` weiter. Wer sie
protokollieren will, tut das in `onConfirm` und wirft weiter — wer dort fängt, ohne zu werfen, sagt
dem Block „erfolgreich", und der Dialog schließt.

### Abgleichregel

Beide Seiten getrimmt, dann exakter Vergleich, **Groß-/Kleinschreibung zählt**.

Getrimmt, weil Einfügen aus der Zwischenablage regelmäßig ein Leerzeichen oder einen Zeilenumbruch
mitbringt — und ein Dialog, der wegen eines unsichtbaren Zeichens gesperrt bleibt, ist kaputt, nicht
streng. Groß-/kleinschreibungsgenau, weil genaues Hinsehen der ganze Zweck der Reibung ist.

Kein `caseSensitive`-Schalter. Er wäre nur dazu da, den Zweck der Komponente abzuschalten.

Ein leeres oder nur aus Leerraum bestehendes `confirmationText` hält den Knopf **gesperrt**. Sonst
wäre das unberührte, leere Feld sofort „gleich" und der Dialog bestätigte eine Löschung, ohne dass
jemand etwas getippt hat — aus der Sicherung würde ein Schnellabzug. Ein Aufrufer, der das
auslöst, hat ein Objekt ohne Namen; die richtige Antwort ist ein Dialog, der nicht weitergeht.

## Aufbau

Aus vorhandenen Bausteinen, nicht aus neuem Markup:

```
Modal
└── ModalDialog                  outlined/neutral, size
    ├── DialogTitle              title
    ├── DialogContent            description        (aria-describedby via Base UI)
    └── form                     Enter sendet ab
        ├── FormControl
        │   ├── FormLabel        prompt(confirmationText), htmlFor={id}
        │   └── Input            id, immer outlined/neutral
        ├── Alert                errorMessage(error) — nur bei Fehler, soft, color
        └── DialogActions
            ├── Button           confirmLabel — type="submit", solid, color
            └── Button           cancelLabel — plain, neutral
```

Das `<form>` ist nicht Zierde: es macht Enter im Feld zum Absenden, ohne einen eigenen Tastenhandler.
`DialogActions` ist `flex-row-reverse` (Joys eigene Vorgabe), das erste Kind steht also rechts.

### Wohin `color` reicht — und wohin nicht

Nur zum Bestätigen-Knopf und zum Fehler-Alert. Die Dialogfläche bleibt `outlined`/`neutral`, und das
**Eingabefeld bleibt immer neutral**. Ein rot getöntes Feld, während jemand mittendrin tippt,
bestraft das Tippen selbst; das Signal „noch nicht gleich" trägt schon der abgeschaltete Knopf. Der
Abbrechen-Knopf ist `plain`/`neutral`, damit die gefährliche Tat die einzige farbige Fläche im
Dialog ist.

Das Feld trägt auch kein `aria-invalid`: eine halb getippte Bestätigung ist keine Falscheingabe.

### Fokus und Vorlesbarkeit

`DialogTitle` und `DialogContent` verdrahten `aria-labelledby` und `aria-describedby` über Base UI
von allein. Das Feld braucht eine eigene `useId`-Verbindung zu `FormLabel`, weil der `FormControl`
dieser Bibliothek nur an Label und Helper kaskadiert, nicht an das Feld (Notiz in
`FormControl.tsx:7`).

Der Anfangsfokus liegt ausdrücklich **im Feld**, nicht auf einem Knopf — dort ist die nächste
Handlung.

Der Fehler steht in `Alert`, dessen `role="alert"` ihn beim Erscheinen ansagt.

### Zustand lebt nur, solange offen ist

Getippter Text und Fehler liegen in einer inneren Komponente, die der `Modal` erst beim Öffnen
einhängt. Der Reset ist damit strukturell statt per Effekt, und der eigentliche Fehler ist
ausgeschlossen: Dialog für „kunde-4711" öffnen, abbrechen, Dialog für „kunde-0815" öffnen — und der
alte Name steht noch da, der Knopf schon frei. Während der Ausblende-Animation bleibt der letzte
Stand sichtbar, was richtig ist.

### Während der Löschvorgang läuft

Der Dialog ist verschlossen: Feld abgeschaltet, Abbrechen abgeschaltet, Bestätigen im Ladezustand
(`Button` hat `loading` bereits und schaltet sich dabei selbst ab). **Escape und Klick auf den
Hintergrund sind wirkungslos** — der Block ignoriert sein eigenes `onClose`, solange etwas fliegt.
Eine abgeschickte Löschung lässt sich nicht zurückrufen; wer den Dialog dabei wegklickt, erfährt den
Ausgang nie.

Ein `pending`-Wächter im Handler selbst verhindert das Doppelabsenden, nicht bloß der abgeschaltete
Knopf. Löst das Promise auf, ruft der Block `onClose()`. Wird es abgelehnt, bleibt der eingetippte
Text stehen, damit der zweite Versuch ein Klick ist. Ein `mounted`-Ref schützt das `setState` nach
dem `await`, falls der Aufrufer `open` von außen umlegt.

## Visuelle Regressionsabdeckung

Die Regel dieses Repositories lautet: jede Komponente Seite an Seite mit dem echten `@mui/joy`.
**Der `ConfirmationDialog` erbt die Ausnahme des `LocaleSwitcher`s**, aus derselben Begründung: Joy
UI hat kein Gegenstück, und der Block bringt keine eigene Optik mit — er ist `ModalDialog`,
`DialogTitle`, `DialogContent`, `FormLabel`, `Input`, `Alert`, `DialogActions` und `Button`, die je
eine vollständige Joy-verglichene Abdeckung tragen.

Statt gegen Joy vergleicht er gegen **unsere eigenen Primitive**, was hier das stärkere Signal ist,
weil genau die Weitergabe das ist, was eine Komposition falsch machen kann:

- **5 Farben × 4 Zustände** (leer · gleich · lädt · Fehler) als Selbst-Baseline-Screenshots über
  `toMatchScreenshot()` — 20 Bilder.
- **Pro Farbe** `getComputedStyle`-Gleichheit des Bestätigen-Knopfes mit einem daneben gerenderten
  `<Button variant="solid" color={c}>` und des Fehler-Alerts mit `<Alert variant="soft" color={c}>`.
  Schluckte der Block `color`, fiele genau das auf.
- **Pro Größe** (3) Feld und Knöpfe gleich einem einzeln gerenderten `Input`/`Button` derselben
  Größe.
- **Die Dialogfläche gleich einem blanken `<ModalDialog>`** — der Wächter dagegen, dass später
  jemand `color` doch an die Fläche durchreicht und den Dialog rot tönt.

Kein Variant-mal-Color-Kreuzprodukt: Die Variant-Achse gehört den Primitiven, die sie schon gegen
Joy prüfen. Der Block wählt die Varianten selbst (`solid` fürs Bestätigen, `plain` fürs Abbrechen,
`soft` für den Alert, `outlined` für Fläche und Feld) — das ist Teil seiner Gestalt, keine Prop.

## Tests in jsdom

1. Bestätigen ist gesperrt, solange der Text nicht gleich ist.
2. Bestätigen geht bei exakter Gleichheit auf.
3. Führende und schließende Leerzeichen auf beiden Seiten werden ignoriert.
4. Abweichende Groß-/Kleinschreibung bleibt gesperrt.
5. Enter im Feld sendet bei Gleichheit ab.
6. Enter bei Ungleichheit tut nichts.
7. Während des Fluges: Feld und Abbrechen abgeschaltet, Bestätigen lädt.
8. Auflösung ruft `onClose` genau einmal.
9. Ablehnung zeigt `errorMessage(error)` und behält den getippten Text.
10. Escape und Hintergrundklick sind während des Fluges wirkungslos.
11. Zweimal Absenden löst `onConfirm` genau einmal aus.
12. Wiederöffnen mit anderem `confirmationText` startet mit leerem Feld.
13. Anfangsfokus liegt im Feld; Beschriftung, zugänglicher Name und Beschreibung sind verdrahtet.
14. Ein leeres `confirmationText` hält den Knopf gesperrt, auch bei leerem Feld.

## Was draußen bleibt

**Keine Zwischenablage-Hilfe.** Ein „Namen kopieren"-Knopf neben dem Feld macht das Tippen zum
Klicken und die Reibung zur Zeremonie.

**Keine eingebaute Verzögerung** („Knopf für 3 Sekunden gesperrt"). Sie erzieht zum Warten, nicht
zum Lesen.

**Kein `caseSensitive`, kein `requireTyping={false}`.** Ein Schalter, der die Bestätigung abschaltet,
macht aus dem Block einen gewöhnlichen Dialog — dafür gibt es `Modal` plus zwei Knöpfe.

**Kein Kaskadieren über `FormControl`.** Der Block verdrahtet `id`/`htmlFor` selbst; den
FormControl-Kaskaden-Umbau anzufangen ist eine eigene Aufgabe.

## Abnahme

Fertig, wenn `pnpm test` und `pnpm test:visual` grün sind, die 20 Baseline-Screenshots unter
`__screenshots__/` liegen und angesehen wurden, `pnpm typecheck` und `pnpm lint` grün sind, die
Doku-Seite unter *Blocks* erreichbar ist und ein Changeset (minor) liegt.

---

## Addendum, 2026-09-07: drei Funde aus der Umsetzung

### `Button`s Ladezustand war kaputt, und zwar für alle

Sichtbar geworden im ersten `pending`-Screenshot dieses Blocks: die Beschriftung stand lesbar
**hinter** dem Spinner. Ursache war nicht der Block, sondern `Button` selbst.

`Button` setzte `loading && 'relative text-transparent'`, um die Beschriftung zu verbergen — und
schaltet sich bei `loading` immer selbst ab (`disabled={disabled || loading}`). Damit greift
`disabled:text-…-disabled-color` aus der Variantenkarte, und das hat mit `(0,2,0)` die höhere
Spezifität als das nackte `text-transparent` mit `(0,1,0)`. Die Beschriftung blieb also sichtbar.

Joy löst denselben Konflikt über die Reihenfolge und schreibt das sogar hin — `color: 'transparent'`
steht dort hinter den Variantenstilen, mit dem Kommentar *„this has to come after the variant styles
to take effect"* (`@mui/joy/Button/Button.js`). Bei Klassen aus einer geteilten Karte ist die
Reihenfolge nicht unsere Wahl, also entscheidet die Wichtigkeit: `text-transparent!`.

Das allein machte den Spinner unsichtbar, denn er zeichnet mit `border-current` und erbte die
Transparenz. Auch dafür hat Joy die Antwort: sein Indikator bekommt ausdrücklich
`theme.variants[variant + 'Disabled'][color].color`. Dafür gibt es jetzt `DISABLED_TEXT_CLASSES` in
`colorVariantClasses.ts` — dieselben Farbtoken ohne den `disabled:`-Präfix.

`Button.visual.test.tsx` hatte **keinen einzigen** `loading`-Fall; die jsdom-Tests prüften nur, dass
ein ladender Knopf keine Klicks annimmt. Genau die Lücke, die der Abdeckungs-Audit vom 2026-09-06
für 18 Komponenten beschreibt. Jetzt liegen fünf Farben Joy-verglichen vor.

### Der `mounted`-Ref war unter `StrictMode` von Anfang an falsch

Der schwerere Fehler, und nur im echten Browser zu finden. Der Ref hieß

```tsx
const mounted = React.useRef(true);
React.useEffect(() => () => { mounted.current = false; }, []);
```

`StrictMode` führt jeden Effekt zweimal aus — einhängen, aufräumen, wieder einhängen. Der Cleanup
setzte `mounted.current = false`, und **nichts** setzte ihn je zurück. Also war er ab dem ersten
Rendern falsch, und jedes Ergebnis von `onConfirm` wurde mit ihm verworfen: kein Schließen bei
Erfolg, kein Fehler bei Fehlschlag, ein Dialog, der für immer lädt.

Die jsdom-Tests sahen das nicht, weil Testing Librarys `render` nicht in `StrictMode` rendert — die
Doku- und die Playground-App aber schon (`apps/docs/src/main.tsx:13`). Der Ref wird jetzt im
Effektkörper gesetzt, nicht nur im Cleanup gelöscht, und zwei Tests rendern ausdrücklich in
`StrictMode`. **Jede neue Komponente mit einem `mounted`- oder Abbruch-Ref braucht so einen Test.**

### `FormLabel` ist ein Flex-Container und zerlegt Sätze

`prompt` liefert einen Satz mit Hervorhebung — „Tippe **kunde-4711** zum Bestätigen." `FormLabel` ist
aber `flex` mit `gap: 0.5` (gebaut für ein kurzes Label plus Pflicht-Sternchen). Jeder lose
Textknoten wird dort ein eigenes Flex-Item und verliert seine umgebenden Leerzeichen; der Satz wurde
mit 2px statt echter Wortabstände gesetzt. `prompt(…)` steckt deshalb in genau einem `<span>`.

### Zwei Verifikationsfallen, keine Produktfehler

Für die nächste Sitzung, damit niemand ihnen nachjagt: das Enter des Browser-Panes trägt nicht die
Standardaktion für implizites Absenden — ein blankes `<form><input><button type="submit">` sendet
damit ebenso wenig ab wie unser Dialog, der Klickpfad dagegen schon. Und in einem verborgenen Tab
laufen CSS-Transitions nicht zu Ende, weshalb ein geschlossener Dialog mit `data-ending-style` im DOM
stehen bleibt, statt ausgehängt zu werden.
