# Cookie-Einwilligung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `CookieConsentProvider`, `useCookieConsent`, `useConsent`, `ConsentGate`, `parseConsentCookie` und die Komponente `CookieConsent` (Banner plus Einstellungsdialog) in `@hintoric/ui`.

**Architecture:** Eine reine Datei für das Cookie-Format ohne React (später ein eigener Einstieg für Server), ein Provider unter `src/theme/`, der das Cookie über `useSyncExternalStore` liest und schreibt, und eine Komponente unter `src/components/CookieConsent/`, zusammengesetzt aus `Card`, `Button`, `Link`, `Modal`, `ModalDialog`, `ModalClose`, `DialogTitle`, `DialogContent`, `Sheet`, `Divider` und `Switch`.

**Tech Stack:** React 19, TypeScript, Tailwind 4, Base UI (über die vorhandenen Komponenten), Vitest 4 mit jsdom und Testing Library, Vitest Browser Mode mit Playwright für die visuellen Tests, Changesets.

**Spec:** `docs/superpowers/specs/2026-10-27-cookie-einwilligung-design.md`. Entwurf als Bilder: `docs/superpowers/specs/2026-10-27-cookie-einwilligung/` (`banner-desktop.png`, `settings.png`, `banner-phone.png`); die Quelle ist ein privates Artifact in Claude Design: https://claude.ai/artifact/4tFz6YY9GtSxikXmtqCzxd.

Alle Befehle laufen in `packages/ui/`, wenn nicht anders angegeben. Vorher einmal im Repository-Root `pnpm install`.

## Global Constraints

- Cookie: Name `hintoric_consent`, Wert `encodeURIComponent(JSON.stringify({ version, choices, decidedAt }))`, `Path=/`, `SameSite=Lax`, `Secure` nur unter `https:`, kein `HttpOnly`, `Domain` nur mit `cookieDomain`.
- Laufzeit Standard 180 Tage, gezählt ab `decidedAt`; `Max-Age` in Sekunden (180 Tage = `15552000`).
- Eine andere `version` als die des Providers gilt als unentschieden.
- Ablehnen und Erlauben: `Button variant="solid" color="primary" size="lg"`, beide gleich, keine Prop ändert das.
- Nichts ist vorausgewählt außer der notwendigen Art. Das Banner hat kein Kreuz, schließt nicht mit Escape, fängt keinen Fokus und hat keinen Hintergrund.
- Im HTML: Ablehnen, Erlauben, Einzeln auswählen. Unter `sm` stellt CSS Erlauben nach oben.
- Englische Standardtexte, wörtlich: `bannerTitle` „Allow cookies?“, `bannerText` „Some cookies are needed for the site. All others are only set with your consent.“, `reject` „Reject“, `accept` „Allow“, `customize` „Choose individually“, `settingsTitle` „Choose cookies“, `settingsText` „You can change your choice at any time.“, `alwaysOn` „Always on“, `save` „Save selection“, `acceptAll` „Allow all“, `privacy` „Privacy policy“, `close` „Close“.
- Jede React-Datei beginnt mit `'use client';` wie die übrigen Provider. `consentCookie.ts` importiert kein React und trägt kein `'use client'`.
- Code-Kommentare englisch und nur für ein nicht offensichtliches Warum; Commit-Nachrichten englisch.
- Keine Namen fremder Firmen, die als Vorbild dienten, in Code, Kommentaren, Doku, Commits oder PR.
- Test zuerst, dann Code.

## Review Focus

- **`decidedAt` in der Zukunft** (verstellte Uhr, verändertes Cookie): mehr als einen Tag voraus ist ungültig, sonst liefe die Einwilligung nie ab. Test in Task 1.
- **`choices` mit Werten, die keine Booleans sind** (`"true"`, `1`): ungültig, nie „wahr genug“. Test in Task 1.
- **Ähnlich benannte Cookies** (`hintoric_consent_old`, `xhintoric_consent`): `readCookieValue` trifft nur den genauen Namen. Test in Task 1.
- **Eine Art kommt nach der Entscheidung hinzu**, ohne neue `version`: Sie ist aus, und das Banner bleibt weg. Test in Task 2.
- **`onChange` wirft bei einem Widerruf**: Die Wahl bleibt gespeichert, und die Seite lädt trotzdem neu. Test in Task 2.

---

### Task 1: Cookie-Format

**Files:**
- Create: `packages/ui/src/theme/consentCookie.ts`
- Test: `packages/ui/src/theme/consentCookie.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface ConsentState { version: string; choices: Record<string, boolean>; decidedAt: string }
  export interface ParseConsentCookieOptions { version: string; maxAgeDays?: number; now?: Date }
  export interface ConsentCookieOptions { name: string; maxAgeDays: number; domain?: string; secure: boolean }
  export const CONSENT_COOKIE_NAME = 'hintoric_consent';
  export const CONSENT_MAX_AGE_DAYS = 180;
  export function parseConsentCookie(value: string | null | undefined, options: ParseConsentCookieOptions): ConsentState | null;
  export function readCookieValue(cookieHeader: string, name: string): string | undefined;
  export function formatConsentCookie(state: ConsentState, options: ConsentCookieOptions): string;
  ```

- [ ] **Step 1: Write the failing tests** in `consentCookie.test.ts`, with `now = new Date('2026-10-27T12:00:00Z')` and `state = { version: '1', choices: { statistics: true, marketing: false }, decidedAt: '2026-10-01T12:00:00.000Z' }`:
  - `round-trips a formatted cookie`: `parseConsentCookie(readCookieValue(formatConsentCookie(state, opts).split(';')[0], 'hintoric_consent'), { version: '1', now })` equals `state`.
  - `formats the attributes`: the string contains `Max-Age=15552000`, `Path=/`, `SameSite=Lax`; contains `Secure` only with `secure: true`; contains `Domain=.hintoric.com` only with `domain: '.hintoric.com'`; never `HttpOnly`.
  - `returns null for anything that is not a valid choice`, one `it.each` row each: `undefined`, `null`, `''`, `'kein json'`, `encodeURIComponent('[]')`, JSON without `decidedAt`, `version: '2'` against option `'1'`, `choices: { statistics: 'true' }`, `choices: { statistics: 1 }`, `decidedAt: 'gestern'`, `decidedAt` 181 days before `now`, `decidedAt` 2 days after `now`.
  - `accepts a choice inside its lifetime`: `decidedAt` 179 days before `now` is returned.
  - `honours a shorter maxAgeDays for cookies already written`: `maxAgeDays: 30`, `decidedAt` 31 days before → `null`.
  - `keeps choice ids it does not know`: `choices: { gone: true }` is returned unchanged (the provider filters).
  - `reads only the exact cookie name`: `readCookieValue('a=1; hintoric_consent=x; b=2', 'hintoric_consent')` is `'x'`; `'hintoric_consent_old=y; xhintoric_consent=z'` gives `undefined`; a value containing `=` comes back whole.

- [ ] **Step 2: Run them and see them fail**

  Run: `pnpm test consentCookie`
  Expected: FAIL, `Failed to resolve import "./consentCookie"`.

- [ ] **Step 3: Implement `consentCookie.ts`**

  `parseConsentCookie` decodes and parses inside one `try`, checks every field by type, then `version`, then the age: invalid if `decidedAt` is more than one day after `now` or more than `maxAgeDays` (default `CONSENT_MAX_AGE_DAYS`) before it. `now` defaults to `new Date()`.

- [ ] **Step 4: Run them and see them pass**

  Run: `pnpm test consentCookie`
  Expected: PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add src/theme/consentCookie.ts src/theme/consentCookie.test.ts
  git commit -m "feat(consent): read and write the consent cookie"
  ```

### Task 2: Provider, hooks and gate in the browser

**Files:**
- Create: `packages/ui/src/theme/CookieConsentProvider.tsx`
- Create: `packages/ui/src/theme/reloadPage.ts`
- Test: `packages/ui/src/theme/CookieConsentProvider.test.tsx`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces (types as in the spec, sections „Arten“, „Provider“, „Hooks“, „Gate“):
  ```ts
  export interface ConsentCategory { id: string; label: React.ReactNode; description?: React.ReactNode; required?: boolean }
  export interface CookieConsentProviderProps { children: React.ReactNode; categories: readonly ConsentCategory[]; version: string; cookieName?: string; cookieDomain?: string; maxAgeDays?: number; initialCookie?: string | null; onChange?: (next: ConsentState, previous: ConsentState | null) => void; reloadOnWithdraw?: boolean }
  export interface CookieConsentContextValue { consent: ConsentState | null; categories: readonly ConsentCategory[]; allows: (id: string) => boolean; acceptAll: () => void; rejectAll: () => void; save: (choices: Record<string, boolean>) => void; settingsOpen: boolean; openSettings: () => void; closeSettings: () => void }
  export interface ConsentGateProps { category: string; children: React.ReactNode; fallback?: React.ReactNode }
  export function CookieConsentProvider(props: CookieConsentProviderProps): React.JSX.Element;
  export function useCookieConsent(): CookieConsentContextValue;
  export function useConsent(id: string): boolean;
  export function ConsentGate(props: ConsentGateProps): React.JSX.Element;
  /** Not exported from index.ts: `known` is false while a server render did not look at the cookie. */
  export function useCookieConsentState(): CookieConsentContextValue & { known: boolean };
  ```
  `reloadPage.ts`: `export function reloadPage(): void` (calls `window.location.reload()`); a module of its own so tests can `vi.mock('./reloadPage')`, because jsdom does not let `location.reload` be replaced.

Test fixture for this task and Task 4: `categories = [{ id: 'necessary', label: 'Necessary', required: true }, { id: 'statistics', label: 'Statistics' }, { id: 'marketing', label: 'Marketing' }]`, `version = '1'`. Clear `hintoric_consent` in `afterEach` by writing it with `Max-Age=0`.

- [ ] **Step 1: Write the failing tests**
  - `throws without a required category`: message `CookieConsentProvider: one category must be required`.
  - `throws on a duplicate id`: message `CookieConsentProvider: duplicate category id "statistics"`.
  - `useCookieConsent throws outside a provider`: message `useCookieConsent must be used within a CookieConsentProvider`.
  - `starts undecided`: `consent` is `null`, `allows('necessary')` true, `allows('statistics')` false.
  - `acceptAll stores every optional category as allowed`: `document.cookie` contains `hintoric_consent=`; `consent.choices` equals `{ statistics: true, marketing: true }`; `consent.version` is `'1'`; `decidedAt` parses as a date; `onChange` called once with `(next, null)`.
  - `rejectAll stores every optional category as refused`: choices `{ statistics: false, marketing: false }`.
  - `save keeps only known categories and turns missing ones off`: `save({ statistics: true, gone: true })` gives `{ statistics: true, marketing: false }`.
  - `save closes the settings`: after `openSettings()`, `settingsOpen` is true; after `save({})` it is false.
  - `treats a cookie from another version as undecided`: pre-set a cookie with `version: '0'` → `consent` is `null`.
  - `turns a category off that was added after the decision`: pre-set `choices: { statistics: true }` only → `consent` not `null`, `allows('marketing')` false.
  - `reloads after a withdrawal, once onChange has run`: pre-set `statistics: true`, call `save({ statistics: false })` → `reloadPage` called once, after `onChange`.
  - `does not reload when nothing was withdrawn`: from undecided `acceptAll()`, and from all-false `acceptAll()` → `reloadPage` not called; with `reloadOnWithdraw={false}` a withdrawal does not reload.
  - `keeps the choice when onChange throws`: `onChange` throws → cookie written, `console.error` called, and on a withdrawal `reloadPage` is still called.
  - `warns once about an unknown category`: `allows('statistcs')` twice → `false` both times, `console.warn` called once.
  - `passes cookieDomain and maxAgeDays to the cookie`: spy on the `document.cookie` setter; the written string contains `Domain=.hintoric.com` and `Max-Age=2592000` for `maxAgeDays={30}`.
  - `uses cookieName for reading and writing`: with `cookieName="site_consent"`, `acceptAll()` writes `site_consent=`, and a pre-set `site_consent` cookie is read back as a decision.
  - `useConsent and ConsentGate follow the decision`: `<ConsentGate category="statistics" fallback={<p>off</p>}><p>on</p></ConsentGate>` shows „off“, after `acceptAll()` „on“.

- [ ] **Step 2: Run them and see them fail**

  Run: `pnpm test CookieConsentProvider`
  Expected: FAIL, `Failed to resolve import "./CookieConsentProvider"`.

- [ ] **Step 3: Implement the provider, hooks and gate**

  Read the raw cookie with `useSyncExternalStore`; `subscribe` registers on a listener set the provider notifies after it writes. Parse the raw value with the provider's `version` and `maxAgeDays`; never trust a parsed state from outside. `known` is true in the browser; Task 3 adds the server snapshot. Writing order: cookie, notify, close settings, `onChange` inside `try`/`catch` (`console.error`), then `reloadPage()` if any category went from `true` to `false` and `reloadOnWithdraw` (default `true`).

- [ ] **Step 4: Run them and see them pass**

  Run: `pnpm test CookieConsentProvider`
  Expected: PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add src/theme/CookieConsentProvider.tsx src/theme/reloadPage.ts src/theme/CookieConsentProvider.test.tsx
  git commit -m "feat(consent): add CookieConsentProvider, useConsent and ConsentGate"
  ```

### Task 3: Server rendering

**Files:**
- Modify: `packages/ui/src/theme/CookieConsentProvider.tsx`
- Test: `packages/ui/src/theme/CookieConsentProvider.ssr.test.tsx`

**Interfaces:**
- Consumes: `CookieConsentProvider`, `useCookieConsentState` from Task 2, `formatConsentCookie` from Task 1.

A probe component in the test renders `known ? (consent ? 'decided' : 'undecided') : 'unknown'`.

- [ ] **Step 1: Write the failing tests**
  - `renderToString` from `react-dom/server`, one `it.each` row each: `initialCookie` left out → `unknown`; `null` → `undecided`; a valid value → `decided`; a value with `version: '0'` → `undecided`.
  - `hydrates without a mismatch`, for the same rows: set `document.cookie` to what the server saw (nothing for the first two rows), put the server HTML into a container, `hydrateRoot(container, element, { onRecoverableError })` inside `act`; `onRecoverableError` is never called.
  - `shows the undecided state after hydrating when the server did not look`: first row, after hydration the probe reads `undecided`.

- [ ] **Step 2: Run them and see them fail**

  Run: `pnpm test CookieConsentProvider.ssr`
  Expected: FAIL in the `renderToString` rows (`known` is always true).

- [ ] **Step 3: Add the server snapshot**

  `getServerSnapshot` returns a fixed sentinel for a missing `initialCookie` (`known` false) and otherwise `initialCookie`; the sentinel and values must be stable across calls.

- [ ] **Step 4: Run them and see them pass**

  Run: `pnpm test CookieConsentProvider`
  Expected: PASS, Task 2's tests included.

- [ ] **Step 5: Commit**

  ```bash
  git add src/theme/CookieConsentProvider.tsx src/theme/CookieConsentProvider.ssr.test.tsx
  git commit -m "feat(consent): render the right state on the server and hydrate cleanly"
  ```

### Task 4: Banner and settings dialog

**Files:**
- Create: `packages/ui/src/components/CookieConsent/CookieConsent.tsx`
- Create: `packages/ui/src/components/CookieConsent/CookieSettingsDialog.tsx`
- Create: `packages/ui/src/components/CookieConsent/labels.ts`
- Create: `packages/ui/src/components/CookieConsent/types.ts`
- Create: `packages/ui/src/components/CookieConsent/index.ts`
- Test: `packages/ui/src/components/CookieConsent/CookieConsent.test.tsx`

**Interfaces:**
- Consumes: `useCookieConsentState`, `ConsentCategory` from Task 2; `useReducedMotion` from `../../theme/ReducedMotionProvider`.
- Produces:
  ```ts
  export interface CookieConsentLabels { bannerTitle?: React.ReactNode; bannerText?: React.ReactNode; reject?: React.ReactNode; accept?: React.ReactNode; customize?: React.ReactNode; settingsTitle?: React.ReactNode; settingsText?: React.ReactNode; alwaysOn?: React.ReactNode; save?: React.ReactNode; acceptAll?: React.ReactNode; privacy?: React.ReactNode; close?: string }
  export interface CookieConsentProps { labels?: CookieConsentLabels; privacyHref?: string }
  export function CookieConsent(props: CookieConsentProps): React.JSX.Element | null;
  export function resolveCookieConsentLabels(labels?: CookieConsentLabels): Required<CookieConsentLabels>; // labels.ts, defaults from Global Constraints
  ```
  `index.ts` exports `CookieConsent` and the two prop types.

- [ ] **Step 1: Write the failing tests** (same fixture as Task 2, plus `description: 'Measure how the site is used.'` on `statistics`)
  - `shows the banner while undecided`: `getByRole('region', { name: 'Allow cookies?' })` with the default text.
  - `orders the banner buttons reject, allow, customize in the DOM`: `getAllByRole('button')` names inside the region are exactly `['Reject', 'Allow', 'Choose individually']`.
  - `has no way to dismiss the banner without deciding`: no button named `/close/i` in the region; after `user.keyboard('{Escape}')` the region is still there.
  - `does not take focus`: after rendering, `document.activeElement` is `document.body`, and there is no element with `aria-modal` while only the banner shows.
  - `Allow stores everything and hides the banner`; `Reject stores nothing and hides the banner` (read the cookie with `readCookieValue` + `parseConsentCookie`).
  - `links the privacy policy only when given`: without `privacyHref` no link; with `privacyHref="/datenschutz"` a link named `Privacy policy` to `/datenschutz`, in the banner and in the dialog.
  - `overrides single labels and keeps the rest`: `labels={{ reject: 'Ablehnen' }}` shows „Ablehnen“ and „Allow“.
  - `opens the settings instead of the banner`: click „Choose individually“ → dialog named „Choose cookies“, the region is gone.
  - `shows the required category on, locked and always on`: switch named „Necessary“ is checked and disabled, „Always on“ next to it; „Statistics“ and „Marketing“ are unchecked; „Statistics“ has the accessible description „Measure how the site is used.“.
  - `saves exactly the switched selection`: switch „Statistics“ on, click „Save selection“ → choices `{ statistics: true, marketing: false }`, dialog closed.
  - `allows everything from the dialog`: „Allow all“ → all true.
  - `closes the dialog without saving`: Escape, and in a second test the close button named „Close“ → no cookie, banner back.
  - `edits an existing choice`: pre-set `statistics: true`, call `openSettings()` from a test button using `useCookieConsent` → „Statistics“ checked; Escape → no banner, cookie unchanged.
  - `renders the banner on the server only when the server looked`: `renderToString` with `initialCookie={null}` contains „Allow cookies?“; without `initialCookie` it does not.

- [ ] **Step 2: Run them and see them fail**

  Run: `pnpm test CookieConsent.test`
  Expected: FAIL, `Failed to resolve import "./CookieConsent"`.

- [ ] **Step 3: Implement**
  - `CookieConsent` renders nothing unless `known`; the banner only when `consent === null && !settingsOpen`; the dialog component always (it is a `Modal` with `open={settingsOpen}`).
  - Banner: a `<section aria-labelledby>` holding a `Card variant="outlined"` with shadow `lg`. Below `sm`: fixed to the bottom over the full width, top corners 12 px. From `sm`: fixed 24 px from the left and bottom edge, at most 440 px wide, all corners 12 px. Buttons as in Global Constraints; „Choose individually“ is `variant="plain" color="primary" size="lg"`. Layout: a column below `sm` with Allow given `order-first`; from `sm` a two-column grid with reject left, allow right, customize spanning both and centred.
  - Entrance: a short slide up; none when `useReducedMotion()` is true.
  - Dialog: `Modal` (`onClose` → `closeSettings`) with `ModalDialog`, `ModalClose` (`aria-label` = `labels.close`), `DialogTitle`, `DialogContent`. The body mounts only while open, with draft switches seeded from `consent?.choices` (all off without one), so every opening starts from what is stored. Rows inside a `Sheet variant="outlined"`, separated by `Divider`; each `Switch` gets `aria-labelledby` on the name and `aria-describedby` on the description. „Save selection“ `variant="outlined" color="neutral" size="lg"` → `save(draft)`; „Allow all“ `variant="solid" color="primary" size="lg"` → `acceptAll()`; both the same width side by side; the privacy link below.

- [ ] **Step 4: Run them and see them pass**

  Run: `pnpm test CookieConsent`
  Expected: PASS, the provider tests included.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/CookieConsent
  git commit -m "feat(consent): add the CookieConsent banner and settings dialog"
  ```

### Task 5: Visual tests

**Files:**
- Create: `packages/ui/src/visual/CookieConsent.visual.test.tsx`
- Create: its baselines under `packages/ui/src/visual/__screenshots__/`

**Interfaces:**
- Consumes: `CookieConsent`, `CookieConsentProvider`, `ReducedMotionProvider`, `Button`; `COLOR_SCHEMES`, `setColorScheme`, `settleTransitions` from `./helpers`; `page` from `vitest/browser` (`page.viewport(width, height)`).

A comment at the top states the exemption: a composition of parts with full Joy-compared coverage, exempt from parity, not from schemes (`CLAUDE.md`). Every test sets `page.viewport` itself and clears the cookie afterwards.

- [ ] **Step 1: Write the tests**, per scheme:
  - Screenshots: `cookie-consent-banner-desktop-${scheme}` at 1280×800, `cookie-consent-banner-phone-${scheme}` at 375×812, `cookie-consent-settings-${scheme}` (the dialog, „Statistics“ on).
  - `the banner changes with the scheme`: the card's `backgroundColor`, `color` and `borderColor` differ between light and dark (measure both in one test, switching with `setColorScheme`).
  - `reject and allow look the same`: `backgroundColor`, `color`, `borderColor`, `borderRadius`, `minHeight`, `fontSize`, `fontWeight`, `lineHeight` and, at 1280, `width` are equal, and equal to a reference `<Button variant="solid" color="primary" size="lg">`.
  - `the dialog buttons match their references`: „Save selection“ against `<Button variant="outlined" color="neutral" size="lg">`, „Allow all“ against solid/primary/lg, same properties.
  - `desktop layout`: at 1280×800 the banner's left edge is 24, its bottom edge 776, its width at most 440; reject is left of allow with the same top.
  - `phone layout`: at 375×812 the banner is 375 wide with its bottom edge at 812; allow's top < reject's top < customize's top.
  - `reduced motion`: inside `<ReducedMotionProvider reducedMotion>`, the banner's computed `animationName` is `none`.

- [ ] **Step 2: Create the baselines**

  Run: `pnpm test:visual CookieConsent` three times (each test takes one screenshot per scheme; the first run fails on purpose for every missing baseline).
  Expected: the third run PASSES. Open every new PNG and compare it with the design; fix the component, not the test, if they differ.

- [ ] **Step 3: Commit**

  ```bash
  git add src/visual/CookieConsent.visual.test.tsx src/visual/__screenshots__
  git commit -m "test(consent): cover the banner and dialog in both colour schemes"
  ```

### Task 6: Exports, docs, changeset and pull request

**Files:**
- Modify: `packages/ui/src/index.ts` (after the `ReducedMotionProvider` block for the provider, next to `ConfirmationDialog` for the component)
- Modify: `packages/ui/src/index.test.ts`
- Create: `apps/docs/src/pages/CookieConsentPage.tsx`
- Modify: `apps/docs/src/App.tsx` (route `/cookie-consent`), `apps/docs/src/nav.ts` (`{ to: '/cookie-consent', label: 'CookieConsent' }` in „Blocks“, alphabetical)
- Create: `.changeset/cookie-consent.md`
- Read: `docs/superpowers/specs/2026-10-27-cookie-einwilligung/banner-desktop.png`, `settings.png`, `banner-phone.png` (the design, already committed)

**Interfaces:**
- Consumes: everything above.
- Produces from `src/index.ts`: `CookieConsentProvider`, `useCookieConsent`, `useConsent`, `ConsentGate`, `parseConsentCookie`, `CookieConsent`, and the types `ConsentCategory`, `ConsentState`, `ParseConsentCookieOptions`, `CookieConsentProviderProps`, `CookieConsentContextValue`, `ConsentGateProps`, `CookieConsentProps`, `CookieConsentLabels`. Not `useCookieConsentState`, `readCookieValue`, `formatConsentCookie`.

- [ ] **Step 1: Write the failing export test** in `index.test.ts`: `it('exports the cookie consent parts')` checks the six runtime names above and that `useCookieConsentState` is **not** exported.

- [ ] **Step 2: Run it and see it fail**

  Run: `pnpm test index`
  Expected: FAIL on `CookieConsentProvider`.

- [ ] **Step 3: Add the exports**, run `pnpm test index` → PASS.

- [ ] **Step 4: Write the docs page** in English, following `ColorSchemeProviderPage.tsx` (`Code`, `PropsTable`), with these sections: Usage (provider at the root, `<CookieConsent />` early in the tree, a footer link calling `openSettings()`); German setup with the `labels` and `categories` from the spec's tables, verbatim; Loading a script with `ConsentGate` and `useConsent`; Google Consent Mode via `onChange` (`gtag('consent', 'update', …)`); Reporting to your server with `fetch(url, { method: 'POST', keepalive: true, body })`; Next.js App Router (`(await cookies()).get('hintoric_consent')?.value ?? null` in a server component, passed to an app-side `'use client'` wrapper as `initialCookie`); Asking again (raise `version`). A live demo on the page.

- [ ] **Step 5: Write the changeset** `.changeset/cookie-consent.md`, exactly:

  ```markdown
  ---
  '@hintoric/ui': minor
  ---

  New: cookie consent. `CookieConsentProvider` keeps the visitor's choice in a first-party cookie (`hintoric_consent`) the server can read too, `useConsent` and `ConsentGate` load a script only after consent, and `CookieConsent` shows the banner and the settings dialog. Reject and allow carry equal weight, nothing is preselected, a withdrawal reloads the page, and raising `version` asks again. `parseConsentCookie` reads the cookie on the server.
  ```

- [ ] **Step 6: Verify everything** (from the repository root)

  Run: `pnpm --filter @hintoric/ui test && pnpm --filter @hintoric/ui test:visual CookieConsent && pnpm typecheck && pnpm lint`
  Expected: all green. The names of reference companies are deliberately not in this plan; whoever opens the pull request checks the branch's diff and the PR text for them.

- [ ] **Step 7: Commit and open a draft pull request**

  ```bash
  git add packages/ui/src/index.ts packages/ui/src/index.test.ts apps/docs .changeset/cookie-consent.md
  git commit -m "feat(consent): export cookie consent and document it"
  git push -u origin claude/cookie-consent
  gh pr create --draft --title "Add cookie consent banner, settings and hooks"
  ```

  The body says why (tracking comes later, the banner should be ready before), what ships, and shows the three design PNGs and the light and dark visual baselines as images (links to the files on the branch). No names of reference companies.
