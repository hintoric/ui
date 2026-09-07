# react-hook-form als Fundament der Formulare

Datum: 2026-09-07 · Status: Entwurf

Jedes Feld dieser Bibliothek verbindet sich selbst mit react-hook-form, sobald es in einem `<Form>`
steht und einen `name` trägt. Außerhalb bleibt es genau das, was es heute ist.

## Warum in dieser Bibliothek

Die Bibliothek hat neun Feld-Komponenten und keinen Formular-Begriff. Wer heute ein Formular baut,
schreibt für jedes Feld dieselben fünf Zeilen: `Controller`, `render`, Wert rein, Callback raus,
Fehlermeldung von Hand in einen `FormHelperText`. Das ist nicht nur Wiederholung, es ist
Wiederholung mit drei verschiedenen Ausprägungen — die Felder dieser Bibliothek melden Änderungen in
drei unterschiedlichen Formen, und welche es je ist, muss man nachlesen.

Diese Bibliothek soll die Stelle sein, über die künftig jedes Formular läuft. Damit wird
react-hook-form keine Integration am Rand, sondern eine Schicht, die alle Felder gemeinsam tragen.

## Der Zustand, auf dem das aufsetzt

Drei Befunde aus dem Bestand, die das Design bestimmen:

**`Input` ist heute nicht `register()`-fähig.** `Input.tsx` baut aus Base UIs `onValueChange(value)`
ein Ereignis-förmiges Objekt mit ausschließlich `target.value` und `currentTarget.value`. RHFs
`register`-Handler liest aber `event.target.name`, um das Feld überhaupt zuzuordnen — mit diesem
Objekt greift er ins Leere. Das ist ein Fehler unabhängig von dieser Spec und fällt als Vorarbeit an.

**Die Felder melden Änderungen in drei Formen.** Nativ Ereignis-artig (`Input`, `Textarea`),
`onCheckedChange(boolean)` (`Checkbox`, `Switch`, `Radio`) und Wert-Callback `onChange(value)`
(`Select`, `Autocomplete`, `RadioGroup`, `Slider`). Nur die native `Textarea` funktioniert heute mit
`register()` ohne Zutun.

**`FormControl` erreicht das Feld nicht.** Seine eigene Scope-Notiz sagt es: der Context reicht bis
`FormLabel` und `FormHelperText`, das Feld selbst braucht `error`/`disabled` direkt. Und
`FormHelperText` liest den Context überhaupt nicht — es ist immer `text-ink-tertiary`, auch im
Fehlerfall. Beides muss geschlossen werden, damit ein Fehler sichtbar wird.

## Die Zielgestalt

```tsx
const userSchema = z.object({
  email: z.string().email('Bitte eine gültige E-Mail angeben'),
  rolle: z.enum(['admin', 'leser']),
  agb: z.literal(true, { message: 'Zustimmung erforderlich' }),
})

<Form schema={userSchema} defaultValues={user} onSubmit={speichern}>
  {({ formState }) => (
    <>
      <Input name="email" label="E-Mail" />
      <Select name="rolle" label="Rolle">…</Select>
      <Checkbox name="agb" label="AGB akzeptieren" />
      <Button type="submit" loading={formState.isSubmitting}>Speichern</Button>
    </>
  )}
</Form>
```

Kein `Controller`, kein `control`, keine Fehlermeldung von Hand.

## `<Form>`

Rendert ein echtes `<form>`, stellt RHFs `FormProvider` bereit und ruft beim Absenden
`form.handleSubmit(onSubmit, onInvalid)`. `onSubmit` bekommt die validierten Werte, nicht das
Ereignis.

Die Props sind eine diskriminierte Union — entweder besitzt `<Form>` das Formular, oder der Consumer:

```ts
type FormOwnProps<T extends FieldValues> = {
  onSubmit: (values: T, form: UseFormReturn<T>) => void | Promise<void>;
  onInvalid?: (errors: FieldErrors<T>) => void;
  children: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode);
} & React.ComponentPropsWithoutRef<'form'>;

// Variante A — <Form> besitzt das Formular
type OwnedForm<T> = FormOwnProps<T> & {
  schema?: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  mode?: UseFormProps<T>['mode'];
  form?: never;
};

// Variante B — der Consumer besitzt es
type ProvidedForm<T> = FormOwnProps<T> & {
  form: UseFormReturn<T>;
  schema?: never;
  defaultValues?: never;
  mode?: never;
};
```

`schema` und `form` schließen sich TypeScript-seitig aus. Wer sein `useForm` selbst baut, baut auch
seinen Resolver selbst.

Die Begründung ist **nicht**, dass das andere technisch unmöglich wäre — siehe das Addendum unten,
das genau diese Annahme widerlegt. Sie ist: es gäbe zwei Quellen für denselben Resolver. Übergäbe
jemand `form={useForm({ resolver: a })}` **und** `schema={b}`, müsste die Bibliothek entscheiden,
welcher gewinnt, und jede Antwort darauf überrascht die Hälfte der Aufrufer. Der einzige Weg, der
das nicht produziert, ist der, bei dem die Frage nicht auftreten kann.

### Warum `useForm` immer läuft

`<Form>` ruft intern **immer** `useForm` auf und verwirft das Ergebnis, wenn `form` übergeben wurde.
Die naheliegende Alternative — zwei innere Komponenten, ausgewählt nach dem Discriminant — löst bei
einem Consumer, der `form` einmal übergibt und einmal nicht, ein Remount samt vollständigem
Formularverlust aus. Still, selten, und im Betrieb schwer zu finden. Ein ungenutztes `useForm`-Objekt
kostet dagegen nichts.

### Warum `children` auch eine Funktion sein darf

Im Alltagsfall besitzt `<Form>` die Instanz, also kommt der Consumer nicht an `formState` — und
ohne `formState.isSubmitting` lässt sich kein Absende-Knopf sperren. Die Render-Prop gibt die
Instanz heraus, ohne dass die Komponente aufgeteilt werden muss. `useFormContext()` in einem Kind
funktioniert gleichwertig; die Funktion ist der kürzere Weg für den häufigsten Fall.

## Auto-Binding

Ein Feld verbindet sich mit RHF genau dann, wenn **beides** zutrifft: es hat einen `name`, und
`useFormContext()` liefert eine Instanz. Fehlt eines, verhält es sich exakt wie heute. Diese
Bedingung ist die Grundlage dafür, dass die Änderung für bestehende Consumer additiv bleibt: `name`
allein ändert nichts, denn außerhalb eines `<Form>` gibt es keinen Context.

`useController` darf nicht bedingt aufgerufen werden. Jedes Feld spaltet daher in eine reine
Präsentations-Komponente und eine verbundene Hülle:

```tsx
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundInput {...props} ref={ref} />;   // ruft useController
  }
  return <InputBase {...props} ref={ref} />;
});
```

Die Weiche ist an einem gegebenen Aufrufort stabil — ein Feld hat innerhalb eines Formulars entweder
dauerhaft einen `name` oder dauerhaft keinen. Der Komponententyp wechselt also nicht im Betrieb.

### Drei Adapter statt neun Verdrahtungen

Die Bind-Logik lebt zentral in `internal/form/`. Jedes Feld deklariert nur, welcher der drei Formen
es folgt:

| Adapter   | Felder                                    | Mapping von RHFs `field`                                            |
| --------- | ----------------------------------------- | ------------------------------------------------------------------- |
| `text`    | Input, Textarea                           | `value: field.value ?? ''`, `onChange: e => field.onChange(e.target.value)` |
| `checked` | Checkbox, Switch, Radio                   | `checked: !!field.value`, `onCheckedChange: field.onChange`         |
| `value`   | Select, Autocomplete, RadioGroup, Slider  | `value: field.value`, `onChange: field.onChange`                    |

`onBlur` und `ref` reicht der Adapter in allen drei Fällen durch. `value: field.value ?? ''` beim
Text-Adapter ist notwendig, nicht kosmetisch: ein `undefined` an einem kontrollierten `<input>`
macht es unkontrolliert und React warnt beim ersten Tastendruck.

**Eigene Callbacks des Consumers werden verkettet, nicht ersetzt.** Ein gebundenes Feld, das
zusätzlich ein eigenes `onChange`/`onBlur`/`onCheckedChange` mitbekommt, ruft beides: erst RHFs
Handler, dann den des Consumers. Andernfalls würde ein Seiteneffekt am Feld (ein abhängiges Feld
zurücksetzen, ein Telemetrie-Ereignis) beim Binden still verschwinden — ein Fehler, der erst
auffällt, wenn jemand das Formular in ein `<Form>` verschiebt.

### Wohin `ref` zeigt — und die eine Ausnahme

RHF braucht den echten DOM-Knoten, sonst funktionieren `setFocus` und der Fokussprung auf das erste
fehlerhafte Feld nicht. Bei acht der neun Felder zeigt `ref` auf ein fokussierbares Element (Base UIs
Root ist ein `input`, `textarea` oder `button`).

### `Radio` bindet nur ohne Gruppe

`Radio` steht in beiden Adapter-Welten: allein ist es ein `checked`-Feld, in einer `RadioGroup` ist
die Gruppe das Feld und das einzelne `Radio` nur eine Option darin. Die Regel ist deshalb: ein
`Radio` bindet sich **nur**, wenn es keinen `RadioGroupContext` über sich hat. Innerhalb einer
Gruppe bindet ausschließlich die `RadioGroup` — sonst schreiben Gruppe und Option gleichzeitig auf
denselben Pfad, und welcher Wert gewinnt, hängt an der Reihenfolge der Handler.

**Slider ist die Ausnahme.** Sein `ref` zeigt auf `Slider.Control`, ein `div`; fokussierbar ist der
Thumb darunter. Focus-on-Error springt dort nicht. Das bleibt eine dokumentierte Grenze — Base UIs
Struktur dafür zu verbiegen, kostet mehr als es einbringt, und ein Slider ist selten das Feld, an dem
eine Validierung scheitert.

## Label, Fehlertext und Barrierefreiheit

Jedes Feld bekommt drei neue Props: `label`, `helperText`, `error`.

Sind alle drei leer und liegt kein RHF-Fehler an, rendert das Feld **genau das nackte Element wie
heute** — kein zusätzliches Wrapper-Element. Das hält bestehende Layouts und die vorhandenen
Visual-Baselines unverändert. Sobald eines greift, wrappt sich das Feld selbst:

```tsx
<FormControl error={hasError} required={required} disabled={disabled}>
  <FormLabel htmlFor={id}>{label}</FormLabel>
  <InputBase id={id} aria-invalid={hasError} aria-describedby={helperId} … />
  <FormHelperText id={helperId}>{errorMessage ?? helperText}</FormHelperText>
</FormControl>
```

`id` kommt aus `React.useId()`, wenn der Consumer keins übergibt. `helperId` wird nur gesetzt, wenn
es auch einen Helper-Text gibt — ein `aria-describedby`, das auf ein leeres Element zeigt, ist für
einen Screenreader schlechter als keines.

Der RHF-Fehlertext (`fieldState.error.message`) **verdrängt** `helperText`, solange ein Fehler
ansteht, und ersetzt ihn nicht dauerhaft: nach erfolgreicher Neuvalidierung kommt der Hilfetext
zurück. `error` als explizites Prop bleibt für Fälle ohne RHF (Server-Fehler, manuelle Zustände) und
wird mit dem RHF-Zustand ver-ODERt — wer `error` von Hand setzt, kann einen Fehler zeigen, den das
Schema nicht kennt.

### Die zwei Bestandslücken

**`FormControl` kaskadiert nach unten.** Die Felder lesen `FormControlContext` und überschreiben ihr
`color` mit `danger`, wenn ein Fehler ansteht — aber nur, wenn der Consumer keine Farbe explizit
gesetzt hat. Joy macht dasselbe (`color = error ? 'danger' : color`), und es ist dieselbe „nur wenn
nicht explizit"-Regel, die `Checkbox` und `Switch` für ihre Zustandsfarben schon anwenden.
`disabled` folgt demselben Weg.

**`FormHelperText` wird im Fehlerfall rot.** Es liest den Context und wechselt auf die Danger-Farbe.

Beide Komponenten haben bestehende Visual-Tests und fallen damit unter die Abdeckungspflicht.

### Warum `required` nicht aus dem Schema kommt

Kommt das Formular über `schema`, wüsste `<Form>` im Prinzip, welche Felder erforderlich sind. Das
wird **nicht** automatisch verdrahtet. Zod-Optionalität aus einem beliebigen Schema zuverlässig
auszulesen heißt, Unions, Refinements, `.default()`, `.catch()` und verschachtelte Objekte korrekt zu
behandeln — eine Introspektions-Baustelle mit langem Schwanz an Sonderfällen. Ein falsch gesetztes
Pflicht-Sternchen ist schlimmer als ein fehlendes: es behauptet etwas über die Eingabe, das nicht
stimmt. `required` bleibt explizit am Feld.

## `<FormField>`

Die Render-Prop-Variante für alles, was die neun Felder nicht abdecken — eigene Controls,
DataGrid-Zellen, Dritt-Komponenten. Ein dünner Wrapper um `useController`, der dieselbe
FormControl-Komposition mitbringt:

```tsx
<FormField name="farbe" label="Farbe" helperText="Hex oder Name">
  {({ field, fieldState }) => <MeinColorPicker {...field} invalid={fieldState.invalid} />}
</FormField>
```

## Dependencies

`react-hook-form` und `zod` werden **peerDependencies**. Bei RHF ist das keine Stilfrage: Context
funktioniert nur, wenn Bibliothek und Anwendung dieselbe Modul-Instanz benutzen. Eine geschachtelte
Kopie im `node_modules` des Pakets bricht `useFormContext()` — still, ohne Fehlermeldung, das Feld
verhält sich einfach wie außerhalb eines Formulars.

`@hookform/resolvers` kommt als echte `dependency`: klein, und seine Version ist an RHF und zod
gekoppelt, was der Consumer nicht pflegen soll.

Alle drei zusätzlich als `devDependencies`, damit Tests und Docs bauen.

### `external` im Build ist Teil der Peer-Zusage

`vite.config.ts` bündelt jede Abhängigkeit, die nicht ausdrücklich in
`build.rollupOptions.external` steht, und dieses Matching ist exakt auf den Specifier — kein
Präfix. `react-hook-form` als peerDependency zu deklarieren, ohne es dort einzutragen, erzeugt genau
den Fehler, den die Peer-Entscheidung vermeiden soll: eine zweite RHF-Instanz im Bundle, ein
`useFormContext()`, das `null` liefert, und Felder, die sich unauffällig wie außerhalb eines
Formulars verhalten.

Einzutragen sind `react-hook-form` und `zod` (letzteres, weil `@hookform/resolvers/zod` es
importiert — der Resolver selbst darf gebündelt bleiben). Die Kommentare an dieser Stelle
dokumentieren, dass dieselbe Falle im Projekt bei Base UI und `country-flag-icons` schon
zugeschnappt ist; sie ist hier gravierender, weil sie keinen Laufzeitfehler wirft, sondern nur
Verhalten wegnimmt.

## Exports

Neu aus `src/index.ts`: `Form`, `FormField` und ihre Typen. `zodResolver` wird **nicht**
re-exportiert — wer ein eigenes `useForm` baut, holt es sich selbst, statt dass die Bibliothek
Dritt-API-Fläche dupliziert und deren Versionierung mitträgt.

## Was ausdrücklich nicht gebaut wird

**Kein `<SubmitButton>`.** Die Render-Prop plus `useFormContext()` deckt den Fall ab, und `Button`
hat mit `loading` alles, was er braucht. Eine eigene Komponente wäre eine Zeile Ersparnis gegen
dauerhafte API-Fläche.

**Kein `schema`-Prop, das auf eine fremde `useForm`-Instanz wirkt.** Siehe oben — technisch nicht
zuverlässig möglich.

**Keine Feld-Arrays, keine Wizard-Schritte, kein Persistieren von Zwischenständen.** RHF hat
`useFieldArray`; es funktioniert mit diesen Feldern ohne Zutun, sobald sie gebunden sind. Eine
eigene Abstraktion darüber ist eine eigene Aufgabe.

**Keine eigenen Fehlermeldungs-Texte.** Die Meldungen kommen aus dem zod-Schema des Consumers.
Dieselbe Entscheidung wie bei `LocaleSwitcher` und `ConfirmationDialog`, aus demselben Grund: eine
Darstellungsbibliothek legt die Sprache ihrer Konsumenten nicht fest.

## Bruchgefahr

Genau eine Stelle: **`Input.onChange`**. Der Payload wechselt vom Fake-Objekt (nur `target.value`)
zum echten `React.ChangeEvent`. Das ist strikt mehr, nicht anders — Code, der `e.target.value` liest,
läuft unverändert weiter.

Alles andere ist additiv: neue Props an den Feldern, und Auto-Binding greift nur innerhalb der neuen
`<Form>`-Komponente. Changeset **minor**, mit dem `Input`-Fix als eigener Zeile in den Release Notes.

## Visuelle Regressionsabdeckung

Die RHF-Verdrahtung selbst ist unsichtbar. Sichtbar neu sind der **Fehlerzustand** und die
**Label/Helper-Komposition**.

**Die neun bestehenden Feld-Tests** (`Input`, `Textarea`, `Select`, `Autocomplete`, `Checkbox`,
`Switch`, `Radio`, `RadioGroup`, `Slider`) bekommen einen Fehler-Durchgang über die volle
Variante×Farbe-Matrix, die dort schon steht: `<JoyInput error variant color />` gegen
`<Input error variant color />`, mit denselben `getComputedStyle`-Assertions auf `backgroundColor`,
`borderColor`, `borderWidth`, `boxShadow` (via `lastShadowLayer`), `minHeight` und Padding. Das ist
die Stelle, an der sich zeigt, ob die `error → danger`-Kaskade Joy wirklich trifft — bei Feldern
ohne Varianten-Achse (`Switch`, `Slider`) entsprechend nur über die Farben.

**Nicht jedes Joy-Feld hat überhaupt ein `error`-Prop.** `Input`, `Textarea`, `Select` und
`Autocomplete` haben es; bei `Checkbox`, `Switch`, `Radio`, `RadioGroup` und `Slider` ist zuerst am
echten Paket zu prüfen, ob es existiert. Wo es fehlt, hat unser Fehlerzustand kein Joy-Gegenstück,
das man abgleichen könnte — dann ist die Referenz Joys `color="danger"` in derselben Variante, und
die Assertion lautet: unser `error` sieht aus wie Joys `color="danger"`. Das ist die einzige
zulässige Auflegung, weil sie weiter gegen das echte Paket messbar bleibt statt einen Farbwert zu
erfinden.

**`FormControl.visual.test.tsx`** und **`FormHelperText.visual.test.tsx`** werden um den
Fehlerzustand erweitert: Kaskade ins Feld bzw. Danger-Textfarbe, gegen Joys eigene
`FormControl`/`FormHelperText`.

**Neu: `FormField.visual.test.tsx`.** Joy hat kein `<FormField>`, aber genau die Komposition, die
`FormField` rendert — `FormControl` › `FormLabel` › Feld › `FormHelperText` — lässt sich in Joy von
Hand nachbauen. Verglichen wird unser einzeiliges `<FormField>` gegen diesen handkomponierten
Joy-Stack, in den Zuständen resting, helperText, error, disabled und required. Assertions auf
`gap`/`rowGap` des Wrappers, Label-Farbe und -Gewicht, Helper-Farbe und -Größe, sowie die
Feld-Umrandung im Fehlerfall.

`<Form>` rendert nur ein `<form>` ohne eigene Optik und bekommt keinen Visual-Test.

Erster Lauf jeder neuen Assertion legt die Baseline an und schlägt absichtlich fehl. Die PNGs unter
`__screenshots__/` werden angesehen, bevor sie committet werden.

## Tests in jsdom

Pro Feld dieselbe Matrix, damit kein Feld halb verdrahtet durchrutscht:

1. bindet den Startwert aus `defaultValues`
2. schreibt eine Änderung nach `form.getValues()`
3. feuert `onBlur`, sodass `mode: 'onBlur'` auslöst
4. zeigt die zod-Fehlermeldung als Helper-Text
5. setzt `aria-invalid` und `aria-describedby` auf den Helper-Text
6. verhält sich außerhalb eines `<Form>` unverändert — kontrolliert und unkontrolliert

Punkt 6 ist der wichtigste: er ist der Test für die Zusicherung, dass die Änderung additiv ist.

Für `<Form>` selbst:

- `schema` erzeugt eine Instanz, `form` benutzt die übergebene
- `onSubmit` läuft nur bei valider Eingabe, `onInvalid` sonst
- die Render-Prop bekommt `formState`
- `<Input {...register('email')} />` funktioniert — die Fundament-Route soll nicht unbemerkt
  verrotten

Für `<FormField>`: Render-Prop bekommt `field` und `fieldState`, Fehlermeldung erscheint, `label`
ist per `htmlFor` mit dem Control verbunden.

## Docs

Neue Seite `apps/docs/src/pages/FormsPage.tsx` plus Eintrag in `nav.ts` und `App.tsx`. Inhalt: ein
vollständiges, lauffähiges Formular mit allen neun Feldtypen, zod-Schema und Fehleranzeige, plus
je ein kurzes Beispiel für die `form`-Variante, `<FormField>` und `register()`.

## Dateien

**Neu**
- `packages/ui/src/components/Form/` — `Form.tsx`, `types.ts`, `index.ts`, `Form.test.tsx`
- `packages/ui/src/components/FormField/` — dito
- `packages/ui/src/internal/form/` — Bind-Hülle, die drei Adapter, `useFieldId`
- `packages/ui/src/visual/FormField.visual.test.tsx`
- `apps/docs/src/pages/FormsPage.tsx`

**Geändert**
- die neun Feld-Komponenten samt `types.ts`
- `components/FormControl/` (Kaskade ins Feld), `components/FormHelperText/` (Danger-Farbe)
- `components/Input/Input.tsx` (Fake-Ereignis entfernen)
- `src/index.ts`, `packages/ui/package.json`
- die neun bestehenden Feld-Visual-Tests, `FormControl.visual.test.tsx`,
  `FormHelperText.visual.test.tsx`
- `apps/docs/src/nav.ts`, `apps/docs/src/App.tsx`

Die Bind-Logik landet bewusst zentral in `internal/form/` und nicht in jeder Komponente. Jedes Feld
gewinnt dadurch nur die Kontext-Weiche und eine Adapter-Angabe; die Präsentations-Komponenten
bleiben so lesbar, wie sie heute sind.

## Zu verifizieren, bevor darauf gebaut wird

Zwei Annahmen dieser Spec sind gegen die echten Pakete zu prüfen, nicht aus dem Gedächtnis:

1. **Base UIs `Input` lässt ein natives `onChange` durch** — Grundlage dafür, das Fake-Ereignis
   einfach zu entfernen. Falls nicht, muss aus `onValueChange` ein vollständigeres Ereignis gebaut
   werden, das mindestens `target.name`, `target.type` und `target.value` trägt.
2. **`useForm` überschreibt `control._options` bei jedem Render** — die Begründung dafür, dass
   `schema` und `form` sich ausschließen. Sollte das in der installierten RHF-Version anders sein,
   bleibt die Union trotzdem die klarere API, aber die Begründung im Code-Kommentar muss stimmen.

## Abnahme

- `pnpm test` grün, inklusive der Matrix aus sechs Punkten für alle neun Felder
- `pnpm test:visual` grün, neue Baselines angesehen und committet
- `pnpm typecheck` und `pnpm lint` grün
- die Docs-Seite zeigt ein Formular, das absendet und Fehler anzeigt
- `react-hook-form` und `zod` stehen in `build.rollupOptions.external`, und ein Blick in
  `dist/index.js` bestätigt, dass keine RHF-Kopie mitgebündelt wurde
- Changeset (minor) liegt im Branch

## Addendum, 2026-09-07: die zwei Annahmen, überprüft

Beide gegen die tatsächlich installierten Pakete geprüft, bevor Code aus ihnen argumentiert —
Base UI über einen Render, react-hook-form 7.87.0 zusätzlich am Quellcode.

### Base UIs `Input` reicht ein natives `onChange` durch — bestätigt

Ein `onChange` an Base UIs `Input` bekommt ein echtes `ChangeEvent`, dessen `target` das reale
`HTMLInputElement` ist und `target.name` trägt. Stärker noch: `<BaseInput {...register('email')} />`
treibt das Formular schon von sich aus korrekt. Das Fake-Ereignis in `Input.tsx` kann also ersatzlos
entfallen; es war nie nötig, sondern hat die register-Route aktiv kaputt gemacht.

### `useForm` überschreibt `control._options` **nicht** — widerlegt

Die Annahme klang plausibel, weil `useForm` bei jedem Render diese Zeile ausführt:

```js
const control = _formControl.current.control;
control._options = props;
```

`_options` ist aber kein normales Feld, sondern ein Getter/Setter-Paar auf dem Control, und der
Setter **merged**:

```js
set _options(value) {
  _options = { ..._options, ...value };
}
```

Die Zuweisung legt damit ein neues Objekt an — die Identität wechselt bei jedem Render, was die
Annahme oberflächlich zu bestätigen schien —, behält aber jeden Schlüssel, den die neuen Props nicht
mitbringen. Ein von außen auf `control._options` gesetzter Resolver überlebt also beliebig viele
Renders. Nachgemessen mit einem Probe-Render, der die Objektidentität pro Render mitschreibt:

```
render 1: _options#1 resolver=undefined
render 1: assigned resolver onto _options#1
render 2: _options#2 resolver=SET
```

**Was das für das Design heißt:** ein `schema`-Prop, das auf eine fremde `useForm`-Instanz wirkt,
wäre baubar — über `form.control._options = { resolver: zodResolver(schema) }`. Es bleibt trotzdem
draußen, aber aus einem anderen Grund als dem, den diese Spec ursprünglich nannte: `_options` ist
ein unterstrich-präfigiertes Privatfeld, und dass sein Setter merged statt ersetzt, ist
Implementierungsdetail, das jede Minor-Version von react-hook-form ändern darf. Ein API-Versprechen
darauf zu bauen heißt, es an eine Zeile fremden Codes zu hängen, die niemand für uns stabil hält.
Dazu kommt der eigentliche Grund, der auch bei stabiler Semantik gilt: zwei Quellen für denselben
Resolver sind eine Fehlerquelle, keine Bequemlichkeit.

Der `Form`-Kommentar im Code darf die Union deshalb **nicht** mit „technisch nicht möglich"
begründen.

### Nebenfund: `useForm` hat ein `formControl`-Prop

7.87.0 akzeptiert `useForm({ formControl })` und übernimmt dann ein bestehendes Control statt ein
neues zu erzeugen. Für diese Spec nicht gebraucht — `<Form>` nimmt das vollständige
`UseFormReturn`, was einfacher ist —, aber es ist der unterstützte Weg, falls später doch einmal
eine Instanz durchgereicht werden muss.

## Addendum, 2026-09-07: drei Funde aus Task 5

### `FormLabel` musste mit, nicht nur `FormHelperText`

Die Spec nannte nur den Helper-Text. Joys `FormControl` setzt im `disabled`-Fall aber **beide**
Variablen — `--FormLabel-color` und `--FormHelperText-color` — auf die Farbe von
`theme.variants.plainDisabled` (aufgelöst `palette-neutral-400`, identisch mit unserem bestehenden
Token `--color-neutral-plain-disabled-color`). Ohne das Label bliebe die `disabled`-Komposition
sichtbar falsch, und Task 11 prüft genau diese Label-Farbe gegen Joy. Also mit erledigt.

Wichtig dabei, ebenfalls aus der Quelle: Joy färbt das Label im **Fehlerfall nicht** um. Nur der
Helper-Text trägt Danger. Ein rotes Label wäre eine Erfindung gewesen.

### `disabled` schlägt `error`

In Joys Style-Objekt steht `&.error` vor `&.disabled`, beide als Klassenselektoren mit gleicher
Spezifität — die spätere Regel gewinnt. Ein Feld, das gleichzeitig gesperrt und fehlerhaft ist,
zeigt also die gedämpfte, nicht die rote Helper-Farbe. Nachgeprüft und im Visual-Test als eigener
Zustand `error-and-disabled` festgenagelt, weil es aus dem Code sonst niemand ablesen kann.

### `FormControl` spaced anders als Joy — bei `md` folgenlos

Eine neue Assertion auf `rowGap` deckte auf, dass unser `FormControl` ein anderes Layout-Modell
benutzt: wir setzen einen Flex-Gap (`gap-1.5`, 6px), Joy lässt `rowGap: normal` und spaced über
Margins auf den Slots (`--FormLabel-margin`, `--FormHelperText-margin`).

Bei der Standardgröße ist das folgenlos — Joys `md`-Werte sind `0.375rem` unter dem Label und
`0.375rem` über dem Helper, also dieselben 6px, die unser Gap erzeugt. Auseinander laufen würde es
bei `sm` (4px) und `lg` (8px), und dieser Fall kann hier nicht eintreten, weil unser `FormControl`
überhaupt keine `size`-Achse hat. Der Visual-Test vergleicht deshalb nicht den Mechanismus, sondern
den gerenderten Abstand zwischen den Slots.

**Offen bleibt:** `FormControl` fehlt Joys `size`-Prop. Solange das so ist, ist der Gap-Ansatz
korrekt und einfacher. Kommt die Größe dazu, muss auf Joys Margin-Modell umgestellt werden — ein
Gap kann pro Slot keine unterschiedlichen Abstände.

## Addendum, 2026-09-07: was das echte Paket über den Fehlerzustand sagt

Der Plan nahm an, `Select` und `Autocomplete` hätten ein `error`-Prop und die übrigen nicht. Gemessen
gilt: **nur `Input` (und damit `Textarea`) hat eines.** `Select`, `Autocomplete`, `Checkbox`,
`Switch`, `Radio`, `RadioGroup` und `Slider` haben in Joy gar keines — sie lesen `formControl.error`
aus dem Kontext. Alle Visual-Tests vergleichen deshalb gegen `<FormControl error>` und nicht gegen
ein erfundenes `color="danger"`.

### Präzedenz: explizite Farbe schlägt den Fehlerzustand — überall

Bei `Checkbox`, `Switch` und `Select` steht das so in Joys Quelle. Bei `Radio` steht dort das
Gegenteil (`activeColor = formControl.error ? 'danger' : …`), gemessen verhält es sich aber wie die
anderen: ein Joy-`Radio` mit `color="primary"` in `<FormControl error>` rendert `rgb(11, 107, 203)`.
Das gerenderte Paket schlägt die Lesart seines Build-Outputs — so steht es auch als Kommentar im
Code, damit niemand die Zeile „korrigiert".

### `Slider` reagiert überhaupt nicht auf den Fehlerzustand

Joys `Slider` liest keinen `FormControl`-Kontext (null Vorkommen von `formControl` in `Slider.js`).
Ein Joy-Slider sieht im Fehlerzustand exakt aus wie ein gültiger. Unser Slider tut es ihm gleich:
`hasError` setzt nur `aria-invalid`, die Spur bleibt blau. Ein danger-Slider wäre eine Erfindung
gewesen, kein Fix — festgenagelt in `Slider.visual.test.tsx`.

### `Slider`: zwei aria-Attribute, zwei Knoten

`role="slider"` ist bei Base UI ein verstecktes `<input type="range">` im Thumb. Base UI reicht
`aria-describedby` und `aria-labelledby` an dieses Input weiter, **`aria-invalid` aber nicht** — das
bleibt auf dem Thumb-Wrapper. Über Base UIs API ist das nicht umzulenken. Die Testmatrix hat dafür
einen eigenen `invalidTarget`-Haken; das ist die zweite dokumentierte Slider-Grenze neben
Focus-on-Error.

### Offen: `RadioGroup` verdeckt bei Joy den Fehlerzustand

Ein Joy-`Radio` **direkt** in `<FormControl error>` wird danger. Dasselbe `Radio` **innerhalb einer
`JoyRadioGroup`** behält seine primary-Farbe — die Gruppe schattet den Fehlerzustand ab. Unseres
wird in beiden Fällen danger.

Das ist bewusst nicht angeglichen: Joy zu folgen hieße, eine ungültige Radio-Gruppe wieder gültig
aussehen zu lassen. Das ist eine Produktentscheidung über Barrierefreiheit, kein Token zum
Abschreiben. Der Visual-Test der Gruppe vergleicht die Radio-Farbe deshalb nicht und sagt im
Kommentar, warum.
