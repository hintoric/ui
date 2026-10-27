# Cookie-Einwilligung

Datum: 2026-10-27 · Status: Entwurf

Ein Banner, ein Einstellungsdialog und die Hooks dazu, damit eine Anwendung von hintoric
Statistik oder Werbung erst lädt, wenn jemand zugestimmt hat. Heute braucht es niemand: weder
core/web noch die Marketing-Seite laden Tracking, und für die Sitzung von Kratos ist keine
Einwilligung nötig (§ 25 Abs. 2 TDDDG). Die Bausteine sollen fertig sein, bevor das erste Tool
kommt, damit es dann nicht unter Zeitdruck an einen eingekauften Dienst geht.

Entwurf (Claude Design, privat): https://claude.ai/artifact/4tFz6YY9GtSxikXmtqCzxd — Banner am
Desktop, Einstellungen, Banner am Handy. Die Texte sind mit dem Skill `ux-writing-de` geprüft.

## Grundentscheidungen

- **Eigene Komponente** statt einer eingekauften Plattform (OneTrust, Cookiebot, Usercentrics) und
  ohne IAB TCF. Für die Arten, die hintoric braucht, ist das ein kleines Stück Code, und es sieht
  aus wie der Rest der Bibliothek.
- **Die Wahl liegt in einem eigenen Cookie.** Das Banner schickt keine Anfrage; der Server sieht
  die Wahl trotzdem, weil das Cookie jede Anfrage begleitet.
- **Wer Tracking lädt, hört auf die Wahl** (`onChange`, `useConsent`) und übersetzt sie selbst,
  etwa in Googles Consent Mode.
- **Ein Widerruf lädt die Seite neu.** Ein geladenes Skript lässt sich nicht entladen.
- **Eine neue Fassung fragt neu.**
- **Jede Art ist ein eigener Schalter**, keine Stufen, die aufeinander aufbauen: Die Einwilligung
  wird je Zweck erteilt, und Werbung zu erlauben darf nicht Statistik voraussetzen.

## Ziele

- Wer zum ersten Mal kommt, entscheidet mit einem Klick: **Ablehnen** und **Erlauben** stehen
  gleichrangig auf der ersten Ebene.
- Wer genauer wählen will, schaltet jede Art einzeln.
- Eine Anwendung fragt an einer Stelle, ob eine Art erlaubt ist, und lädt ein Skript erst dann.
- Die Wahl lässt sich jederzeit ändern, über einen Link, den die Anwendung selbst setzt.
- Der Server kann die Wahl lesen, ohne dass die Bibliothek ihn kennt.
- Server-Rendering (Next.js auf der Marketing-Seite) zeigt das Banner nicht kurz an, wenn schon
  entschieden ist.

## Nicht-Ziele

- **Keine Liste von Anbietern** und kein IAB TCF. Wer Werbung über Netzwerke ausspielt, die TCF
  verlangen, braucht eine zertifizierte Plattform; das ist eine andere Entscheidung.
- **Kein Nachweis auf dem Server.** Wer belegen muss, wer wann zugestimmt hat, schreibt das in
  `onChange` an seinen eigenen Endpunkt.
- **Kein Adapter für Google, Relay42 oder andere.** Die Bibliothek kennt kein Tracking-Tool;
  `onChange` und `useConsent` reichen, ein Beispiel für Consent Mode steht in der Doku.
- **Keine Übersetzungen.** Wie überall in der Bibliothek: englische Standardtexte, einzeln
  überschreibbar (`labels`), keine i18n-Bibliothek.
- **Keine Abgleichung zwischen offenen Tabs** während sie laufen. Ein anderer Tab liest die neue
  Wahl beim nächsten Laden.

## Anti-Ziele

Es wäre ein Fehlschlag, auch wenn alles technisch funktioniert, wenn:

- **Ablehnen schwächer aussieht als Erlauben** oder erst in den Einstellungen zu finden ist. Die
  beiden Knöpfe haben dieselbe Variante, Farbe und Größe, und keine Prop ändert das.
- **Etwas vorausgewählt ist.** Jede Art außer der notwendigen beginnt aus.
- **Das Banner sich wegklicken lässt**, ohne dass jemand entschieden hat. Es hat kein Kreuz und
  schließt nicht mit Escape.
- **Ein Skript lädt, bevor entschieden ist.** Unentschieden heißt: nichts außer dem Notwendigen.
- **Das Banner die Seite sperrt.** Kein Hintergrund, kein Fokusfang; wer es ignoriert, kann die
  Seite weiter lesen, nur ohne das, was Zustimmung braucht.

## Aufbau

Ein Provider hält den Zustand, eine Komponente zeigt Banner und Dialog, zwei Hooks und ein Gate
lesen ihn.

```
CookieConsentProvider          Zustand, Cookie, onChange
├── CookieConsent              Banner (unentschieden) + Einstellungsdialog
├── useCookieConsent()         Wahl lesen und ändern, Dialog öffnen
├── useConsent('statistics')   ist diese Art erlaubt?
└── <ConsentGate>              Inhalt erst nach Zustimmung
```

Der Provider liegt unter `src/theme/` neben `ColorSchemeProvider` und `LocaleProvider`, weil er
keine Optik hat. `CookieConsent` liegt unter `src/components/CookieConsent/`. Alles wird aus
`src/index.ts` exportiert.

### Arten

Die Anwendung nennt sie. Eine davon muss `required` sein; sie steht im Dialog immer oben, ist an
und lässt sich nicht ausschalten.

```ts
export interface ConsentCategory {
  /** Stabil: steht im Cookie und in jedem Aufruf von useConsent. */
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
}
```

Ohne `required`-Art oder mit zwei gleichen `id` wirft der Provider beim Rendern, denn das wäre ein
Programmierfehler, kein Zustand.

### Gespeicherte Wahl

```ts
export interface ConsentState {
  /** Die `version` des Providers, unter der entschieden wurde. */
  version: string;
  /** Jede nicht notwendige Art, true heißt erlaubt. Notwendige stehen nicht darin. */
  choices: Record<string, boolean>;
  /** Zeitpunkt der Entscheidung, ISO 8601. */
  decidedAt: string;
}
```

- **Ein Cookie**, Name `hintoric_consent` (Prop `cookieName`), Wert `encodeURIComponent` von JSON
  mit genau diesen drei Feldern. `path=/`, `SameSite=Lax`, `Secure` unter HTTPS, kein `HttpOnly`,
  weil der Browser es lesen muss. `domain` nur, wenn die Prop `cookieDomain` gesetzt ist.
- **Laufzeit 180 Tage** (Prop `maxAgeDays`). Danach fragt das Banner wieder. Gezählt wird ab
  `decidedAt`, nicht nur über das `Max-Age` des Cookies: so gilt eine verkürzte Laufzeit auch für
  Cookies, die schon geschrieben sind.
- **Eine andere `version`** als die gespeicherte gilt als unentschieden. So fragt eine Anwendung neu,
  wenn sie eine Art hinzunimmt oder einen Zweck ändert.
- **Eine Art, die im Cookie fehlt**, ist aus. Eine Art im Cookie, die der Provider nicht mehr kennt,
  wird beim nächsten Speichern weggelassen.
- **Ein Cookie, das sich nicht lesen lässt** (kein JSON, falsche Felder), gilt als unentschieden.

```ts
export function parseConsentCookie(
  value: string | undefined,
  options: { version: string; maxAgeDays?: number; now?: Date },
): ConsentState | null;
```

Eine reine Funktion, exportiert, und die einzige Stelle, die prüft: Sie gibt `null` zurück für ein
fehlendes, kaputtes, abgelaufenes Cookie oder eines aus einer anderen `version`. Der Provider nutzt
sie selbst, und wer die Wahl außerhalb des Providers liest, bekommt dieselbe Antwort. Eine
Einwilligung aus einer alten Fassung kann so nirgends als gültig durchrutschen.

### Provider

```ts
export interface CookieConsentProviderProps {
  children: React.ReactNode;
  categories: readonly ConsentCategory[];
  /** Erhöhen, um neu zu fragen. */
  version: string;
  cookieName?: string;     // 'hintoric_consent'
  cookieDomain?: string;
  maxAgeDays?: number;     // 180
  /**
   * Beim Server-Rendering: der rohe Wert des Cookies aus dem Request-Header.
   * Fehlt die Prop, hat der Server nicht nachgesehen.
   */
  initialCookie?: string | null;
  /** Nach jeder gespeicherten Entscheidung, auch der ersten. Synchron. */
  onChange?: (next: ConsentState, previous: ConsentState | null) => void;
  /** Lädt die Seite neu, wenn eine Art von erlaubt auf aus wechselt. */
  reloadOnWithdraw?: boolean; // true
}
```

- Der Provider bekommt den **rohen** Cookie-Wert, nicht eine fertige `ConsentState`, und prüft ihn
  selbst mit `parseConsentCookie` und seinen eigenen `version` und `maxAgeDays`. So kann keine
  Anwendung ihm eine Wahl unterschieben, die er nicht selbst als gültig erkennt.
- Auf dem Server und beim ersten Rendern im Browser gilt `initialCookie`; danach liest der
  Provider `document.cookie`. Drei Fälle:
  - `initialCookie` fehlt (`undefined`): Der Server weiß nichts und rendert kein Banner. Der
    Browser zeigt es nach dem Hydrieren, wenn nichts entschieden ist. So arbeitet eine SPA wie
    core/web.
  - `initialCookie` ist `null` oder ergibt keine gültige Wahl: Der Server hat nachgesehen, und das
    Banner steht schon im HTML.
  - `initialCookie` ergibt eine gültige Wahl: kein Banner, auch nicht kurz.
- `onChange` läuft nach dem Schreiben des Cookies. Wirft es, bleibt die Wahl gespeichert, und der
  Fehler geht an die Konsole; ein kaputter Handler der Anwendung darf die Entscheidung nicht
  zurücknehmen.
- Mit `reloadOnWithdraw` lädt der Provider neu, sobald `onChange` zurückkehrt, wenn mindestens eine
  Art von `true` auf `false` gegangen ist. Ein Skript, das schon läuft, lässt sich nicht anders
  stoppen. `onChange` bleibt deshalb synchron, und der Provider wartet auf nichts: Wer einen
  Widerruf an den Server meldet, nimmt `fetch(…, { keepalive: true })` oder
  `navigator.sendBeacon`, die ein Neuladen überleben. Die Doku zeigt das.

### Hooks

```ts
export interface CookieConsentContextValue {
  /** null heißt: noch nicht entschieden (oder abgelaufen, oder alte Fassung). */
  consent: ConsentState | null;
  categories: readonly ConsentCategory[];
  /** Notwendige Arten sind immer erlaubt, alle anderen erst nach Zustimmung. */
  allows: (id: string) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Speichert genau diese Auswahl; fehlende Arten sind aus. */
  save: (choices: Record<string, boolean>) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

/** Wirft außerhalb eines CookieConsentProvider, wie useColorScheme. */
export function useCookieConsent(): CookieConsentContextValue;

/** Kurzform für useCookieConsent().allows(id). */
export function useConsent(id: string): boolean;
```

`allows` mit einer unbekannten `id` gibt `false` zurück und warnt einmal je `id` in der Konsole,
damit ein Tippfehler nicht still Tracking verhindert, aber auch keines erlaubt. Die Warnung kommt in
jedem Build: Die Bibliothek hat keinen Schalter für die Entwicklung, und ein Tippfehler ist auch in
Produktion ein Fehler.

### Gate

```tsx
<ConsentGate category="statistics" fallback={null}>
  <AnalyticsScript />
</ConsentGate>
```

Rendert `children` nur, wenn `allows(category)`, sonst `fallback`. Für ein Video oder eine Karte,
die ohne Zustimmung nicht laden darf, kann `fallback` einen Hinweis mit Link auf die Einstellungen
zeigen.

### Komponente `CookieConsent`

Eine Komponente für beides, Banner und Dialog, weil sie denselben Zustand teilen und eine
Anwendung sonst zwei Teile richtig verdrahten müsste.

```ts
export interface CookieConsentProps {
  labels?: CookieConsentLabels;
  /** Der Link auf die Datenschutzerklärung, im Banner und im Dialog. */
  privacyHref?: string;
}

export interface CookieConsentLabels {
  bannerTitle?: React.ReactNode;     // 'Allow cookies?'
  bannerText?: React.ReactNode;      // 'Some cookies are needed for the site. All others are only set with your consent.'
  reject?: React.ReactNode;          // 'Reject'
  accept?: React.ReactNode;          // 'Allow'
  customize?: React.ReactNode;       // 'Choose individually'
  settingsTitle?: React.ReactNode;   // 'Choose cookies'
  settingsText?: React.ReactNode;    // 'You can change your choice at any time.'
  alwaysOn?: React.ReactNode;        // 'Always on'
  save?: React.ReactNode;            // 'Save selection'
  acceptAll?: React.ReactNode;       // 'Allow all'
  privacy?: React.ReactNode;         // 'Privacy policy'
  close?: string;                    // 'Close' (aria-label)
}
```

Die deutschen Texte aus dem Entwurf stehen in der Doku als Beispiel für `labels`:

| Schlüssel | Deutsch |
|---|---|
| `bannerTitle` | Cookies erlauben? |
| `bannerText` | Einige Cookies sind für die Seite nötig. Alle anderen werden nur mit deiner Zustimmung gesetzt. |
| `reject` / `accept` | Ablehnen / Erlauben |
| `customize` | Einzeln auswählen |
| `settingsTitle` | Cookies auswählen |
| `settingsText` | Deine Auswahl kannst du jederzeit ändern. |
| `alwaysOn` | Immer an |
| `save` / `acceptAll` | Auswahl speichern / Alle erlauben |
| `privacy` | Datenschutzerklärung |
| `close` | Schließen |

Und die Arten aus dem Entwurf als Beispiel für `categories`: Notwendig („Halten dich angemeldet und
die Seite sicher.“), Statistik („Messen, wie die Seite genutzt wird.“), Werbung („Zeigen dir auf
anderen Seiten passende Anzeigen.“).

**Banner** (nur, wenn `consent === null`):

- Ab `sm` eine `Card` unten links, 24 px vom Rand, höchstens 440 px breit, Schatten `lg`. Darunter
  eine Leiste unten über die ganze Breite, oben gerundet.
- Titel, Text, Link auf die Datenschutzerklärung (nur mit `privacyHref`), dann **Ablehnen** und
  **Erlauben** als zwei gleiche `Button` (`solid`, `primary`, `lg`) nebeneinander, darunter
  **Einzeln auswählen** als `plain`. Auf dem Handy untereinander: Erlauben, Ablehnen, Einzeln
  auswählen.
- Im HTML steht **Ablehnen vor Erlauben**, wie am Desktop; auf dem Handy stellt CSS (`order`)
  Erlauben nach oben. Die Reihenfolge für Tastatur und Screenreader weicht dort von der sichtbaren
  ab (WCAG 1.3.2, 2.4.3). Das ist so entschieden (27.10.2026), weil der Entwurf am Handy Erlauben
  oben zeigt. Wer liest oder tabbt, trifft auf beiden Breiten zuerst auf Ablehnen.
- Ein `<section>` mit `aria-labelledby` auf den Titel. Er nimmt keinen Fokus und fängt keinen. Die
  Doku sagt, `<CookieConsent />` früh in den Baum zu setzen, damit es in der Tab-Reihenfolge vor
  dem Inhalt steht.
- Erscheint mit einer kurzen Bewegung von unten, ohne sie, wenn `useReducedMotion` es sagt.

**Dialog** (`settingsOpen`):

- `Modal` mit `ModalDialog`, `ModalClose`, Titel und Text.
- Je Art eine Zeile mit Name, Beschreibung und `Switch`; die notwendige zuerst, an, gesperrt, mit
  „Immer an“ daneben. Die Schalter zeigen die gespeicherte Wahl, ohne eine: alle aus.
- **Auswahl speichern** (`outlined`, `neutral`) und **Alle erlauben** (`solid`, `primary`), gleich
  groß nebeneinander, darunter der Link auf die Datenschutzerklärung.
- Kreuz und Escape schließen ohne zu speichern. War noch nicht entschieden, steht danach wieder das
  Banner da.

Öffnen lässt sich der Dialog über `openSettings()`, etwa aus einem Link „Cookie-Einstellungen“ im
Fuß der Seite. Den Link setzt die Anwendung; die Bibliothek legt keinen an.

### Next.js

`@hintoric/ui` ist ein einziges Bundle ohne `'use client'` und legt beim Laden Kontexte an. Ein
Server Component, eine Middleware oder ein Route Handler kann deshalb nichts daraus importieren,
auch nicht `parseConsentCookie`. Daran ändert diese Spec nichts, denn heute liest kein Server die
Wahl.

Der Weg in Next.js (App Router): Das Server Component liest den rohen Wert
(`(await cookies()).get('hintoric_consent')?.value ?? null`) und gibt ihn an eine eigene
`'use client'`-Hülle der Anwendung, die den Provider mit `initialCookie` rendert. Diese Hülle
rendert auch auf dem Server, also steht das Banner schon im HTML, wenn es gebraucht wird.

Braucht später ein Server die Wahl außerhalb einer Client-Komponente, etwa um ein Skript gar nicht
erst auszuliefern, bekommt `parseConsentCookie` einen eigenen Einstieg ohne React
(`@hintoric/ui/consent`). Das ist ein eigener Schnitt am Build.

## Tests

- **Unit (jsdom):** `parseConsentCookie` mit gültigen, kaputten, fremden und alten Werten, mit
  abgelaufenem `decidedAt` und anderer `version`; `acceptAll`, `rejectAll`, `save` schreiben das Cookie und rufen `onChange` mit
  vorher und nachher; `reloadOnWithdraw` nur bei einem Widerruf; `allows` für notwendige, erlaubte,
  unbekannte Arten; `ConsentGate`; der Provider wirft ohne `required`-Art und bei doppelter `id`;
  das Banner hat kein Kreuz und schließt nicht mit Escape; Escape im Dialog speichert nichts.
- **Server-Rendering:** `renderToString` in allen drei Fällen von `initialCookie` (fehlt, `null`,
  gültig); Banner nur bei `null`, kein Hydrierungsfehler.
- **Visuell:** `CookieConsent` ist eine Zusammensetzung aus `Card`, `Button`, `Modal` und `Switch`,
  die je eine volle Vergleichsabdeckung gegen `@mui/joy` haben, und damit nach `CLAUDE.md` von der
  Parität ausgenommen, nicht von den Farbschemata. Je Schema ein eigenes Bild von Banner (Desktop
  und Handy) und Dialog, dazu die Prüfung, dass sich `backgroundColor`, `color` und `borderColor`
  zwischen hell und dunkel ändern. Dazu die Prüfung, dass Ablehnen und Erlauben dieselben
  berechneten Stile haben.

## Lieferung

- Changeset `minor` für `@hintoric/ui`.
- Eine Seite in `apps/docs` mit den deutschen `labels` und `categories` von oben und einem Beispiel
  für Googles Consent Mode über `onChange`, für eine Meldung an den Server mit `keepalive` und für
  Next.js mit `initialCookie`.

## Dem Bauenden überlassen

- Wie der Provider `document.cookie` beobachtet (`useSyncExternalStore` wie beim Farbschema bietet
  sich an).
- Die Bewegung des Banners, solange sie kurz ist und `useReducedMotion` folgt.
- Die genaue Aufteilung in Dateien unter `components/CookieConsent/`.
