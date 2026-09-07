# react-hook-form Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every field component in `@hintoric/ui` binds itself to react-hook-form when it carries a `name` inside a `<Form>`, and behaves exactly as it does today outside one.

**Architecture:** A `<Form>` component owns (or accepts) a `useForm` instance and publishes it through RHF's own `FormProvider`. Each field splits into a pure presentational component and a bound wrapper; the wrapper is chosen by a stable context branch so `useController` is never called conditionally. The binding logic lives once in `src/internal/form/`, where three adapters cover the three callback shapes the nine fields have today.

**Tech Stack:** React 19, react-hook-form 7 (peer), zod 4 (peer), `@hookform/resolvers` (dependency), Base UI, Tailwind 4, Vitest (jsdom + browser/playwright), Changesets.

**Spec:** `docs/superpowers/specs/2026-09-07-react-hook-form-integration-design.md`

## Global Constraints

- **Additive by default.** A field with no `label`, no `helperText`, no `error` and no RHF error must render the exact same DOM as today — no wrapper element. Existing visual baselines must not move.
- **Binding condition.** A field binds if and only if it has a `name` **and** `useFormContext()` returns non-null. Never one alone.
- **`useController` is never conditional.** Always branch to a separate component, never `if (…) useController()`.
- **Consumer callbacks are chained, never replaced.** RHF's handler runs first, the consumer's second.
- **`Radio` binds only when it has no `RadioGroupContext` above it.** Inside a group, only the `RadioGroup` binds.
- **Peer deps must be external in the build.** `react-hook-form` and `zod` go into `build.rollupOptions.external` in `packages/ui/vite.config.ts`. Exact-specifier matching — no prefixes.
- **Do not re-export `zodResolver`** from `src/index.ts`.
- **Every touched component in `components/*` needs its visual test extended** — full variant×color matrix for the new error state, per `CLAUDE.md`.
- **One changeset, `minor`**, mentioning the `Input.onChange` payload change as its own line.
- Commands run from `packages/ui/`: `pnpm test`, `pnpm test:visual`, `pnpm typecheck`. `pnpm lint` from repo root.

---

### Task 1: Dependencies, build externals, and the two open assumptions

The spec names two assumptions it explicitly refuses to treat as fact. Settle both before any code depends on them.

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts:44-50`
- Modify: `docs/superpowers/specs/2026-09-07-react-hook-form-integration-design.md` (addendum)
- Test: `packages/ui/src/internal/form/probe.test.tsx` (throwaway, deleted in Step 7)

**Interfaces:**
- Consumes: nothing.
- Produces: `react-hook-form`, `zod`, `@hookform/resolvers` installed and importable; a recorded answer to both assumptions.

- [ ] **Step 1: Install the dependencies**

```bash
cd packages/ui
pnpm add -D react-hook-form zod @hookform/resolvers
pnpm add @hookform/resolvers
```

Then hand-edit `packages/ui/package.json` so the final state is:

```jsonc
"peerDependencies": {
  "react": "^18.3.0 || ^19.0.0",
  "react-dom": "^18.3.0 || ^19.0.0",
  "react-hook-form": "^7.54.0",
  "zod": "^4.0.0"
},
"dependencies": {
  // …existing entries unchanged…
  "@hookform/resolvers": "^5.0.0"
}
```

Keep `react-hook-form` and `zod` in `devDependencies` too — tests and the docs app need them installed locally.

- [ ] **Step 2: Add the build externals**

In `packages/ui/vite.config.ts`, extend the `external` array. Add a comment in the style of the ones already there:

```ts
      // react-hook-form and zod are peerDependencies and MUST be external.
      // This list is exact-specifier matched, so an omission silently bundles
      // a second copy — and a second RHF module instance makes
      // useFormContext() return null in the consumer's app, which takes
      // behaviour away without throwing. zod is here because
      // @hookform/resolvers/zod imports it; the resolver itself stays bundled.
      external: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        'country-flag-icons/react/1x1',
        'react-hook-form',
        'zod',
      ],
```

- [ ] **Step 3: Write the probe for assumption 1 — does Base UI's Input pass a native onChange through?**

Create `packages/ui/src/internal/form/probe.test.tsx`:

```tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input as BaseInput } from '@base-ui/react/input';

describe('ASSUMPTION 1: Base UI Input forwards a native onChange', () => {
  it('delivers a real ChangeEvent carrying target.name and target.value', async () => {
    const onChange = vi.fn();
    render(<BaseInput aria-label="probe" name="email" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'probe' }), 'a');

    expect(onChange).toHaveBeenCalled();
    const event = onChange.mock.calls.at(-1)?.[0];
    expect(event.target.name).toBe('email');
    expect(event.target.value).toBe('a');
    expect(event.target).toBeInstanceOf(HTMLInputElement);
  });
});
```

- [ ] **Step 4: Write the probe for assumption 2 — does useForm overwrite control._options each render?**

Append to the same file:

```tsx
import { useForm } from 'react-hook-form';

describe('ASSUMPTION 2: useForm reassigns control._options on every render', () => {
  it('discards a resolver assigned from outside the useForm call', async () => {
    const externalResolver = vi.fn(async () => ({ values: {}, errors: {} }));
    let renderCount = 0;
    let seenResolver: unknown = 'unset';

    function Probe() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
      renderCount += 1;
      if (renderCount === 1) {
        // Simulate what a <Form schema> prop would have to do to a
        // consumer-owned instance.
        (form.control as unknown as { _options: Record<string, unknown> })._options.resolver =
          externalResolver;
      } else {
        seenResolver = (form.control as unknown as { _options: Record<string, unknown> })._options
          .resolver;
      }
      return <button onClick={() => form.setValue('email', String(renderCount))}>bump</button>;
    }

    render(<Probe />);
    await userEvent.click(screen.getByRole('button', { name: 'bump' }));

    expect(renderCount).toBeGreaterThan(1);
    // Documented outcome either way — see Step 6.
    console.log('ASSUMPTION 2 result — resolver after re-render:', seenResolver);
  });
});
```

- [ ] **Step 5: Run both probes**

Run: `cd packages/ui && pnpm test src/internal/form/probe.test.tsx`

Expected: assumption 1 either PASSES (then the `Input` fix in Task 2 is a plain deletion) or FAILS (then Task 2 must build a fuller synthetic event — see Task 2 Step 3b). Assumption 2 prints the resolver state; `undefined` confirms the spec's reasoning, a retained `externalResolver` refutes it.

**Do not proceed past this step without reading the actual output.** Both branches are handled by later tasks, but the wrong branch silently produces broken code.

- [ ] **Step 6: Record what the probes found as a spec addendum**

Append to `docs/superpowers/specs/2026-09-07-react-hook-form-integration-design.md`, following the addendum style of `2026-09-07-confirmation-dialog-design.md`:

```markdown
## Addendum, 2026-09-07: die zwei Annahmen, überprüft

### Base UIs `Input` und das native `onChange`

<Ergebnis von Schritt 5 in einem Satz, plus die Folge für Task 2: entweder
"das Fake-Ereignis kann ersatzlos entfallen" oder "onValueChange muss ein
Ereignis mit target.name/type/value bauen, weil Base UI onChange schluckt".>

### `control._options` bei jedem Render

<Ergebnis von Schritt 5. Wenn der Resolver überschrieben wird: die Union aus
`schema` und `form` ist damit belegt. Wenn nicht: die Union bleibt trotzdem die
klarere API, aber der Code-Kommentar darf sie nicht mit dieser Begründung
versehen — dann lautet der Grund "zwei Quellen für denselben Resolver sind eine
Fehlerquelle, keine Bequemlichkeit".>
```

Replace both angle-bracketed blocks with the real findings. Leaving them is a plan failure.

- [ ] **Step 7: Delete the probe and commit**

```bash
cd /Users/johanneswaigel/git/hintoric/ui
rm packages/ui/src/internal/form/probe.test.tsx
git add packages/ui/package.json packages/ui/vite.config.ts pnpm-lock.yaml docs/superpowers/specs/2026-09-07-react-hook-form-integration-design.md
git commit -m "Add react-hook-form as a peer dependency and settle two assumptions

Records what Base UI's Input actually does with a native onChange and
whether useForm reassigns control._options each render, since the whole
<Form> prop union argues from the second. react-hook-form and zod go into
vite's external list in the same commit: as peerDependencies that are not
external, they would ship a bundled second copy and quietly break
useFormContext() for consumers."
```

---

### Task 2: Remove Input's fake ChangeEvent

Independent of RHF and valuable alone: this is what makes `<Input {...register('email')} />` work at all.

**Files:**
- Modify: `packages/ui/src/components/Input/Input.tsx:16-40`
- Test: `packages/ui/src/components/Input/Input.test.tsx`

**Interfaces:**
- Consumes: Task 1's answer to assumption 1.
- Produces: `Input`'s `onChange` receives a real `React.ChangeEvent<HTMLInputElement>` whose `target` is the actual `<input>`.

- [ ] **Step 1: Write the failing test**

Add to `packages/ui/src/components/Input/Input.test.tsx`:

```tsx
  it('calls onChange with a real ChangeEvent whose target is the input element', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="name" name="email" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'name' });
    await userEvent.type(input, 'x');

    const event = onChange.mock.calls.at(-1)?.[0];
    // The fake event this replaces carried only target.value, which is why
    // react-hook-form's register() could never resolve the field.
    expect(event.target).toBe(input);
    expect(event.target.name).toBe('email');
    expect(event.target.value).toBe('x');
    expect(typeof event.preventDefault).toBe('function');
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd packages/ui && pnpm test src/components/Input/Input.test.tsx`
Expected: FAIL — `event.target` is the synthetic `{ value }` object, not the input element; `event.target.name` is `undefined`.

- [ ] **Step 3a: Implement — if assumption 1 PASSED in Task 1**

Delete the `onValueChange` block entirely and let `onChange` reach Base UI through the existing spread. `Input.tsx` becomes:

```tsx
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = 'outlined', color = 'neutral', size = 'md', startDecorator, endDecorator, className, ...props },
  ref,
) {
  return (
    <span className={cx(inputVariants({ variant, color, size }), className)}>
      {startDecorator && (
        <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>
      )}
      {/* onChange rides along in `props`: Base UI's Input forwards unknown
          props to the real <input>, so callers get the genuine ChangeEvent
          rather than the hand-built stand-in that used to live here. That
          stand-in carried only target.value, which made react-hook-form's
          register() unable to resolve the field by name. */}
      <BaseInput
        ref={ref}
        className="w-full min-w-0 border-none bg-transparent p-0 outline-none"
        {...props}
      />
      {endDecorator && (
        <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>
      )}
    </span>
  );
});
```

Also drop the now-unneeded `onChange` extraction from the destructuring (shown above) — `InputProps` keeps its `onChange?: React.ChangeEventHandler<HTMLInputElement>` declaration, which now matches reality.

- [ ] **Step 3b: Implement — only if assumption 1 FAILED in Task 1**

Keep `onValueChange`, but resolve the real element from the ref instead of fabricating a target. Replace the callback body with:

```tsx
        onValueChange={
          onChange
            ? (value: string, event: Event) => {
                const target = (event?.target as HTMLInputElement | undefined) ?? innerRef.current;
                if (!target) return;
                onChange({
                  ...(event as unknown as React.ChangeEvent<HTMLInputElement>),
                  target,
                  currentTarget: target,
                } as React.ChangeEvent<HTMLInputElement>);
              }
            : undefined
        }
```

with `const innerRef = React.useRef<HTMLInputElement>(null);` and the ref forked into both `ref` and `innerRef` via the `useForkRef` helper built in Task 4 Step 5. If this branch is taken, move Task 2 to run **after** Task 4.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `cd packages/ui && pnpm test src/components/Input/Input.test.tsx`
Expected: PASS, including the pre-existing `calls onChange with the new value while typing` test, which asserts only `lastEvent.target.value` and therefore still holds.

- [ ] **Step 5: Add the register() regression test**

Append to the same file:

```tsx
  it('works with react-hook-form register()', async () => {
    const seen: Record<string, unknown>[] = [];
    function Probe() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
      seen.push(form.watch());
      return <Input aria-label="email" {...form.register('email')} />;
    }
    render(<Probe />);
    await userEvent.type(screen.getByRole('textbox', { name: 'email' }), 'a@b.de');
    expect(seen.at(-1)).toEqual({ email: 'a@b.de' });
  });
```

Add `import { useForm } from 'react-hook-form';` at the top of the file.

- [ ] **Step 6: Run the full unit suite and commit**

Run: `cd packages/ui && pnpm test`
Expected: PASS — no other test asserted on the fake event's shape.

```bash
git add packages/ui/src/components/Input/Input.tsx packages/ui/src/components/Input/Input.test.tsx
git commit -m "Give Input's onChange a real ChangeEvent

The hand-built stand-in carried only target.value, so react-hook-form's
register() had no target.name to resolve the field by and silently never
recorded the input. Callers reading e.target.value are unaffected — the
payload is strictly more than before, not different."
```

---

### Task 3: `<Form>`

**Files:**
- Create: `packages/ui/src/components/Form/Form.tsx`
- Create: `packages/ui/src/components/Form/types.ts`
- Create: `packages/ui/src/components/Form/index.ts`
- Test: `packages/ui/src/components/Form/Form.test.tsx`

**Interfaces:**
- Consumes: `react-hook-form`, `@hookform/resolvers/zod` from Task 1.
- Produces:
  - `Form` — a component; `<Form<T> {...props} />`
  - `FormProps<T extends FieldValues>` — union of `OwnedFormProps<T> | ProvidedFormProps<T>`
  - Both exported from `./components/Form`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/components/Form/Form.test.tsx`:

```tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form } from './Form';

const schema = z.object({ email: z.string().min(3, 'zu kurz') });

function NativeField() {
  const { register } = useFormContext<{ email: string }>();
  return <input aria-label="email" {...register('email')} />;
}

describe('Form', () => {
  it('builds its own useForm instance from schema and defaultValues', async () => {
    const onSubmit = vi.fn();
    render(
      <Form schema={schema} defaultValues={{ email: 'a@b.de' }} onSubmit={onSubmit}>
        <NativeField />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.de' });
  });

  it('does not call onSubmit when the schema rejects, and calls onInvalid instead', async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    render(
      <Form schema={schema} defaultValues={{ email: 'x' }} onSubmit={onSubmit} onInvalid={onInvalid}>
        <NativeField />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(onInvalid.mock.calls[0][0].email?.message).toBe('zu kurz');
  });

  it('uses a consumer-provided instance instead of its own', async () => {
    const onSubmit = vi.fn();
    let external: ReturnType<typeof useForm<{ email: string }>> | undefined;
    function Host() {
      external = useForm<{ email: string }>({ defaultValues: { email: 'c@d.de' } });
      return (
        <Form form={external} onSubmit={onSubmit}>
          <NativeField />
          <button type="submit">ok</button>
        </Form>
      );
    }
    render(<Host />);
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'c@d.de' });
    expect(onSubmit.mock.calls[0][1]).toBe(external);
  });

  it('passes the form instance to a render-prop child', async () => {
    render(
      <Form schema={schema} defaultValues={{ email: 'a@b.de' }} onSubmit={async () => {}}>
        {({ formState }) => (
          <button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'läuft' : 'ok'}
          </button>
        )}
      </Form>,
    );
    expect(screen.getByRole('button', { name: 'ok' })).toBeInTheDocument();
  });

  it('renders a native form element and forwards form attributes', () => {
    const { container } = render(
      <Form schema={schema} defaultValues={{ email: 'a' }} onSubmit={vi.fn()} noValidate id="f1">
        <span />
      </Form>,
    );
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('id', 'f1');
    expect(form).toHaveAttribute('novalidate');
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/Form/Form.test.tsx`
Expected: FAIL — cannot resolve `./Form`.

- [ ] **Step 3: Write the types**

Create `packages/ui/src/components/Form/types.ts`:

```ts
import type * as React from 'react';
import type {
  DefaultValues,
  FieldErrors,
  FieldValues,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import type { ZodType } from 'zod';

interface FormBaseProps<T extends FieldValues>
  extends Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'children'> {
  /** Receives the validated values, not the submit event. */
  onSubmit: (values: T, form: UseFormReturn<T>) => void | Promise<void>;
  onInvalid?: (errors: FieldErrors<T>) => void;
  /**
   * A function child receives the form instance — the way to reach
   * `formState.isSubmitting` when <Form> owns the instance itself.
   */
  children: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode);
}

/** <Form> owns the instance: pass a schema and defaults. */
export interface OwnedFormProps<T extends FieldValues> extends FormBaseProps<T> {
  schema?: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  mode?: UseFormProps<T>['mode'];
  form?: never;
}

/**
 * The consumer owns the instance. `schema` is deliberately unavailable here:
 * a resolver must be handed to useForm at call time, so a schema prop could
 * not be attached to an instance built elsewhere.
 */
export interface ProvidedFormProps<T extends FieldValues> extends FormBaseProps<T> {
  form: UseFormReturn<T>;
  schema?: never;
  defaultValues?: never;
  mode?: never;
}

export type FormProps<T extends FieldValues> = OwnedFormProps<T> | ProvidedFormProps<T>;
```

- [ ] **Step 4: Write the component**

Create `packages/ui/src/components/Form/Form.tsx`:

```tsx
'use client';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormProps } from './types';

// useForm runs unconditionally and its result is discarded when `form` was
// passed in. The obvious alternative — two inner components picked by which
// prop is present — remounts the whole subtree if a consumer ever switches
// between the two, taking the entered values with it: silent, rare, and hard
// to trace. An unused useForm object costs nothing by comparison.
function FormComponent<T extends FieldValues>(
  { onSubmit, onInvalid, children, schema, defaultValues, mode, form: formProp, ...formAttrs }: FormProps<T>,
  ref: React.Ref<HTMLFormElement>,
) {
  const ownForm = useForm<T>({
    defaultValues,
    mode,
    resolver: schema ? zodResolver(schema) : undefined,
  });
  const form = (formProp ?? ownForm) as UseFormReturn<T>;

  const handleSubmit = form.handleSubmit(
    (values) => onSubmit(values, form),
    onInvalid ? (errors) => onInvalid(errors) : undefined,
  );

  return (
    <FormProvider {...form}>
      <form ref={ref} onSubmit={handleSubmit} {...formAttrs}>
        {typeof children === 'function' ? children(form) : children}
      </form>
    </FormProvider>
  );
}

export const Form = React.forwardRef(FormComponent) as <T extends FieldValues>(
  props: FormProps<T> & { ref?: React.Ref<HTMLFormElement> },
) => React.ReactElement;
```

Create `packages/ui/src/components/Form/index.ts`:

```ts
export { Form } from './Form';
export type { FormProps, OwnedFormProps, ProvidedFormProps } from './types';
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `cd packages/ui && pnpm test src/components/Form/Form.test.tsx`
Expected: PASS, all five.

- [ ] **Step 6: Confirm the union rejects the illegal combination**

Add a type-level check at the bottom of `Form.test.tsx`:

```tsx
it('rejects schema together with form at the type level', () => {
  // @ts-expect-error schema and form are mutually exclusive
  const illegal = <Form schema={schema} form={{} as never} onSubmit={vi.fn()}><span /></Form>;
  expect(illegal).toBeTruthy();
});
```

Run: `cd packages/ui && pnpm typecheck`
Expected: PASS. If `@ts-expect-error` reports itself as unused, the union is not actually exclusive — fix `types.ts` before continuing.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/Form
git commit -m "Add <Form>, which owns or accepts a react-hook-form instance

Props are a discriminated union: either a schema plus defaults, and <Form>
builds the instance, or a ready-made instance from the consumer. The two
cannot be combined, because a resolver has to reach useForm at call time and
so cannot be attached to an instance built elsewhere. A function child hands
the instance back out, which is how a submit button reaches isSubmitting when
<Form> is the owner."
```

---

### Task 4: The binding core in `src/internal/form/`

**Files:**
- Create: `packages/ui/src/internal/form/adapters.ts`
- Create: `packages/ui/src/internal/form/useBoundField.ts`
- Create: `packages/ui/src/internal/form/FieldShell.tsx`
- Create: `packages/ui/src/internal/form/useFieldIds.ts`
- Create: `packages/ui/src/internal/form/useForkRef.ts`
- Create: `packages/ui/src/internal/form/index.ts`
- Test: `packages/ui/src/internal/form/useBoundField.test.tsx`

**Interfaces:**
- Consumes: `Form` from Task 3.
- Produces:
  - `textAdapter`, `checkedAdapter`, `valueAdapter` — all of type `FieldAdapter`
  - `type FieldAdapter = (field: ControllerRenderProps<FieldValues, string>) => Record<string, unknown>`
  - `useBoundField(name: string, adapter: FieldAdapter, own: OwnHandlers): { fieldProps: Record<string, unknown>; errorMessage?: string }`
  - `type OwnHandlers = { onChange?: unknown; onBlur?: unknown; onCheckedChange?: unknown }`
  - `FieldShell` — component, props `FieldShellProps { label?, helperText?, error?, required?, disabled?, id, helperId?, children }`
  - `useFieldIds(idProp: string | undefined, hasHelper: boolean): { id: string; helperId?: string }`
  - `useForkRef<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T>`
  - All re-exported from `./internal/form`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/internal/form/useBoundField.test.tsx`:

```tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from '../../components/Form';
import { textAdapter, checkedAdapter, valueAdapter } from './adapters';
import { useBoundField } from './useBoundField';

// A minimal probe field per adapter shape — the real components are wired in
// later tasks, but the binding core has to be provable on its own.
function TextProbe({ onChange }: { onChange?: React.ChangeEventHandler<HTMLInputElement> }) {
  const { fieldProps, errorMessage } = useBoundField('email', textAdapter, { onChange });
  return (
    <>
      <input aria-label="email" {...(fieldProps as React.ComponentProps<'input'>)} />
      <span data-testid="err">{errorMessage ?? ''}</span>
    </>
  );
}

function CheckedProbe() {
  const { fieldProps } = useBoundField('agb', checkedAdapter, {});
  const p = fieldProps as { checked: boolean; onCheckedChange: (v: boolean) => void };
  return (
    <button aria-label="agb" aria-pressed={p.checked} onClick={() => p.onCheckedChange(!p.checked)}>
      agb
    </button>
  );
}

function ValueProbe() {
  const { fieldProps } = useBoundField('rolle', valueAdapter, {});
  const p = fieldProps as { value: unknown; onChange: (v: unknown) => void };
  return (
    <button aria-label="rolle" onClick={() => p.onChange('admin')}>
      {String(p.value)}
    </button>
  );
}

describe('useBoundField', () => {
  it('binds the initial value from defaultValues through the text adapter', () => {
    render(
      <Form defaultValues={{ email: 'a@b.de' }} onSubmit={vi.fn()}>
        <TextProbe />
      </Form>,
    );
    expect(screen.getByLabelText('email')).toHaveValue('a@b.de');
  });

  it('writes typed input back into the form values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ email: '' }} onSubmit={onSubmit}>
        <TextProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('email'), 'x@y.de');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'x@y.de' });
  });

  it('substitutes an empty string for an undefined value so the input stays controlled', () => {
    render(
      <Form defaultValues={{}} onSubmit={vi.fn()}>
        <TextProbe />
      </Form>,
    );
    expect(screen.getByLabelText('email')).toHaveValue('');
  });

  it("chains the consumer's own onChange after RHF's", async () => {
    const own = vi.fn();
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ email: '' }} onSubmit={onSubmit}>
        <TextProbe onChange={own} />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('email'), 'q');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(own).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'q' });
  });

  it('exposes the zod error message for the bound field', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().min(3, 'zu kurz') })}
        defaultValues={{ email: 'a' }}
        onSubmit={vi.fn()}
      >
        <TextProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByTestId('err')).toHaveTextContent('zu kurz');
  });

  it('maps a boolean through the checked adapter', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ agb: false }} onSubmit={onSubmit}>
        <CheckedProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByLabelText('agb'));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ agb: true });
  });

  it('passes an arbitrary value straight through the value adapter', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ rolle: 'leser' }} onSubmit={onSubmit}>
        <ValueProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    expect(screen.getByLabelText('rolle')).toHaveTextContent('leser');
    await userEvent.click(screen.getByLabelText('rolle'));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ rolle: 'admin' });
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/internal/form/useBoundField.test.tsx`
Expected: FAIL — cannot resolve `./adapters`.

- [ ] **Step 3: Write the adapters**

Create `packages/ui/src/internal/form/adapters.ts`:

```ts
import type * as React from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

export type FieldAdapter = (
  field: ControllerRenderProps<FieldValues, string>,
) => Record<string, unknown>;

// The nine field components report changes in exactly three shapes, so the
// binding needs exactly three adapters rather than nine hand-wirings.

/** Input, Textarea — a native change event carrying the new string. */
export const textAdapter: FieldAdapter = (field) => ({
  name: field.name,
  // An undefined value turns a controlled <input> uncontrolled and React
  // warns on the first keystroke, so the empty string is load-bearing.
  value: field.value ?? '',
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    field.onChange(event.target.value),
  onBlur: field.onBlur,
  ref: field.ref,
});

/** Checkbox, Switch, Radio — onCheckedChange(boolean). */
export const checkedAdapter: FieldAdapter = (field) => ({
  name: field.name,
  checked: Boolean(field.value),
  onCheckedChange: (next: boolean) => field.onChange(next),
  onBlur: field.onBlur,
  ref: field.ref,
});

/** Select, Autocomplete, RadioGroup, Slider — onChange(value). */
export const valueAdapter: FieldAdapter = (field) => ({
  name: field.name,
  // Passed through untouched: these fields carry strings, numbers, arrays and
  // null, and coercing here would corrupt Slider's numbers into "".
  value: field.value,
  onChange: (next: unknown) => field.onChange(next),
  onBlur: field.onBlur,
  ref: field.ref,
});
```

- [ ] **Step 4: Write the hook**

Create `packages/ui/src/internal/form/useBoundField.ts`:

```ts
import { useController, useFormContext } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import type { FieldAdapter } from './adapters';

export interface OwnHandlers {
  onChange?: unknown;
  onBlur?: unknown;
  onCheckedChange?: unknown;
}

const CHAINED = ['onChange', 'onBlur', 'onCheckedChange'] as const;

/**
 * Only ever called from a component that has already established there IS a
 * form context and a name — the caller does the branching, so this hook can
 * call useController unconditionally.
 */
export function useBoundField(
  name: string,
  adapter: FieldAdapter,
  own: OwnHandlers,
): { fieldProps: Record<string, unknown>; errorMessage?: string } {
  const { control } = useFormContext<FieldValues>();
  const { field, fieldState } = useController({ name, control });
  const bound = adapter(field);

  // The consumer's handler runs after RHF's rather than replacing it: a side
  // effect attached to a field (resetting a dependent field, a telemetry
  // event) must not disappear the moment the field is dropped into a <Form>.
  const fieldProps: Record<string, unknown> = { ...bound };
  for (const key of CHAINED) {
    const ownHandler = own[key];
    const boundHandler = bound[key];
    if (typeof ownHandler !== 'function') continue;
    fieldProps[key] =
      typeof boundHandler === 'function'
        ? (...args: unknown[]) => {
            (boundHandler as (...a: unknown[]) => void)(...args);
            (ownHandler as (...a: unknown[]) => void)(...args);
          }
        : ownHandler;
  }

  return { fieldProps, errorMessage: fieldState.error?.message };
}
```

- [ ] **Step 5: Write `useForkRef`, `useFieldIds` and `FieldShell`**

Create `packages/ui/src/internal/form/useForkRef.ts`:

```ts
import * as React from 'react';

/**
 * RHF needs the real DOM node for setFocus and focus-on-error, and the
 * consumer may want the same node — so both refs get it.
 */
export function useForkRef<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}
```

Create `packages/ui/src/internal/form/useFieldIds.ts`:

```ts
import * as React from 'react';

/**
 * An aria-describedby pointing at an element that renders nothing is worse
 * for a screen reader than none at all, so helperId only exists when there
 * is actually helper text to describe.
 */
export function useFieldIds(
  idProp: string | undefined,
  hasHelper: boolean,
): { id: string; helperId?: string } {
  const generated = React.useId();
  const id = idProp ?? generated;
  return { id, helperId: hasHelper ? `${id}-helper-text` : undefined };
}
```

Create `packages/ui/src/internal/form/FieldShell.tsx`:

```tsx
'use client';
import * as React from 'react';
import { FormControl } from '../../components/FormControl';
import { FormLabel } from '../../components/FormLabel';
import { FormHelperText } from '../../components/FormHelperText';

export interface FieldShellProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  id: string;
  helperId?: string;
  children: React.ReactNode;
}

/**
 * Renders the bare field when there is nothing to wrap it in. That keeps the
 * DOM — and every committed visual baseline — identical for callers who never
 * pass label or helperText.
 */
export function FieldShell({
  label,
  helperText,
  error,
  required,
  disabled,
  id,
  helperId,
  children,
}: FieldShellProps): React.ReactElement {
  if (label == null && helperText == null) {
    return <>{children}</>;
  }
  return (
    <FormControl error={error} required={required} disabled={disabled}>
      {label != null && <FormLabel htmlFor={id}>{label}</FormLabel>}
      {children}
      {helperText != null && <FormHelperText id={helperId}>{helperText}</FormHelperText>}
    </FormControl>
  );
}
```

Create `packages/ui/src/internal/form/index.ts`:

```ts
export { textAdapter, checkedAdapter, valueAdapter } from './adapters';
export type { FieldAdapter } from './adapters';
export { useBoundField } from './useBoundField';
export type { OwnHandlers } from './useBoundField';
export { FieldShell } from './FieldShell';
export type { FieldShellProps } from './FieldShell';
export { useFieldIds } from './useFieldIds';
export { useForkRef } from './useForkRef';
```

- [ ] **Step 6: Run the tests to confirm they pass**

Run: `cd packages/ui && pnpm test src/internal/form/`
Expected: PASS, all seven.

- [ ] **Step 7: Add FieldShell's own tests**

Create `packages/ui/src/internal/form/FieldShell.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldShell } from './FieldShell';

describe('FieldShell', () => {
  it('renders the bare child when there is no label and no helper text', () => {
    const { container } = render(
      <FieldShell id="x">
        <input aria-label="bare" />
      </FieldShell>,
    );
    // No wrapper: the input is the container's only child.
    expect(container.firstElementChild?.tagName).toBe('INPUT');
  });

  it('wraps in a FormControl with a label bound by htmlFor', () => {
    render(
      <FieldShell id="x" label="E-Mail">
        <input id="x" />
      </FieldShell>,
    );
    expect(screen.getByLabelText('E-Mail')).toHaveAttribute('id', 'x');
  });

  it('renders helper text with the given id', () => {
    render(
      <FieldShell id="x" helperId="x-helper-text" helperText="Hinweis">
        <input id="x" />
      </FieldShell>,
    );
    expect(screen.getByText('Hinweis')).toHaveAttribute('id', 'x-helper-text');
  });
});
```

Run: `cd packages/ui && pnpm test src/internal/form/`
Expected: PASS, all ten.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/internal/form
git commit -m "Add the field-binding core: three adapters, one hook, one shell

The nine field components report changes in three shapes, so the binding
needs three adapters rather than nine hand-wirings. useBoundField chains the
consumer's own handler after RHF's instead of replacing it, so a side effect
on a field does not vanish when the field moves into a <Form>. FieldShell
renders the bare child when there is no label and no helper text, which keeps
the DOM and every committed visual baseline unchanged for existing callers."
```

---

### Task 5: FormControl cascades into the field, FormHelperText turns red

**Files:**
- Modify: `packages/ui/src/components/FormControl/FormControl.tsx:7-14` (drop the scope note, extend the context)
- Modify: `packages/ui/src/components/FormControl/FormControlContext.ts`
- Modify: `packages/ui/src/components/FormHelperText/FormHelperText.tsx`
- Test: `packages/ui/src/components/FormControl/FormControl.test.tsx`
- Test: `packages/ui/src/components/FormHelperText/FormHelperText.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `FormControlContextValue` unchanged in shape (`{ disabled?, error?, required? }`) but now consumed by fields; a `useFieldStateFromContext()` helper is **not** added — fields read the context directly with `React.useContext(FormControlContext)`.

- [ ] **Step 1: Write the failing test for FormHelperText**

Add to `packages/ui/src/components/FormHelperText/FormHelperText.test.tsx`:

```tsx
import { FormControl } from '../FormControl';

  it('uses the danger colour inside a FormControl in error state', () => {
    render(
      <FormControl error>
        <FormHelperText>kaputt</FormHelperText>
      </FormControl>,
    );
    expect(screen.getByText('kaputt')).toHaveClass('text-danger-500');
  });

  it('keeps the tertiary colour when there is no error', () => {
    render(
      <FormControl>
        <FormHelperText>hinweis</FormHelperText>
      </FormControl>,
    );
    expect(screen.getByText('hinweis')).toHaveClass('text-ink-tertiary');
  });
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd packages/ui && pnpm test src/components/FormHelperText/`
Expected: FAIL — the element is always `text-ink-tertiary`; it never reads the context.

- [ ] **Step 3: Implement FormHelperText**

Replace the body of `packages/ui/src/components/FormHelperText/FormHelperText.tsx`:

```tsx
'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { FormControlContext } from '../FormControl/FormControlContext';
import type { FormHelperTextProps } from './types';

export const FormHelperText = React.forwardRef<HTMLDivElement, FormHelperTextProps>(
  function FormHelperText({ className, ...props }, ref) {
    const formControl = React.useContext(FormControlContext);
    return (
      <div
        ref={ref}
        className={cx(
          'flex items-center gap-0.5 font-body text-sm',
          // Joy UI's FormHelperText takes the danger colour from its
          // FormControl's error state; without this an error message reads as
          // an ordinary hint.
          formControl?.error ? 'text-danger-500' : 'text-ink-tertiary',
          className,
        )}
        {...props}
      />
    );
  },
);
```

Verify `text-danger-500` is the token Joy actually uses by checking `INPUT_COLOR_CLASSES.outlined.danger` and Joy's own rendered `FormHelperText` colour in the visual test of Step 7 — if it differs, take Joy's value, per `CLAUDE.md`'s rule against re-deriving tokens.

- [ ] **Step 4: Run to confirm it passes**

Run: `cd packages/ui && pnpm test src/components/FormHelperText/`
Expected: PASS.

- [ ] **Step 5: Write the failing test for the cascade into a field**

Add to `packages/ui/src/components/FormControl/FormControl.test.tsx`:

```tsx
import { Input } from '../Input';

  it('cascades its error state into the field colour', () => {
    render(
      <FormControl error>
        <Input aria-label="feld" />
      </FormControl>,
    );
    const wrapper = screen.getByRole('textbox', { name: 'feld' }).parentElement!;
    expect(wrapper).toHaveClass('border-danger-outlined-border');
  });

  it('does not override a colour the caller set explicitly', () => {
    render(
      <FormControl error>
        <Input aria-label="feld" color="success" />
      </FormControl>,
    );
    const wrapper = screen.getByRole('textbox', { name: 'feld' }).parentElement!;
    expect(wrapper).toHaveClass('border-success-outlined-border');
  });

  it('cascades disabled into the field', () => {
    render(
      <FormControl disabled>
        <Input aria-label="feld" />
      </FormControl>,
    );
    expect(screen.getByRole('textbox', { name: 'feld' })).toBeDisabled();
  });
```

- [ ] **Step 6: Run to confirm it fails**

Run: `cd packages/ui && pnpm test src/components/FormControl/`
Expected: FAIL on all three — `Input` does not read `FormControlContext` yet. **These three tests stay red until Task 6 lands `Input`'s context read.** Note that in the commit message rather than weakening the tests.

- [ ] **Step 7: Extend the two visual tests**

In `packages/ui/src/visual/FormHelperText.visual.test.tsx`, add an error-state case following the file's existing structure — render Joy's `FormControl error > FormHelperText` against ours, and assert `color` equality via `getComputedStyle`, plus `toMatchScreenshot()` on both.

In `packages/ui/src/visual/FormControl.visual.test.tsx`, add the same for the composed error state (`FormControl error` wrapping a label, an input and a helper text), asserting `rowGap`, the label's `color`, and the input wrapper's `borderColor`.

Run: `cd packages/ui && pnpm test:visual src/visual/FormHelperText.visual.test.tsx src/visual/FormControl.visual.test.tsx`
Expected: first run FAILS with "no existing reference screenshot found". Rerun; then open the new PNGs under `src/visual/__screenshots__/` and look at them before trusting them.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/FormHelperText packages/ui/src/components/FormControl packages/ui/src/visual/FormHelperText.visual.test.tsx packages/ui/src/visual/FormControl.visual.test.tsx packages/ui/src/visual/__screenshots__
git commit -m "Make FormControl's error state visible: red helper text, red field

FormHelperText never read FormControlContext and was always tertiary, so an
error message looked like an ordinary hint. The three cascade tests in
FormControl.test.tsx are deliberately left failing: they assert that Input
picks up the context, which the next commit gives it."
```

---

### Task 6: Bind `Input`

The template every remaining field follows.

**Files:**
- Modify: `packages/ui/src/components/Input/Input.tsx`
- Modify: `packages/ui/src/components/Input/types.ts`
- Test: `packages/ui/src/components/Input/Input.test.tsx`
- Test: `packages/ui/src/visual/Input.visual.test.tsx`

**Interfaces:**
- Consumes: `textAdapter`, `useBoundField`, `FieldShell`, `useFieldIds`, `useForkRef` from Task 4; `FormControlContext` from Task 5.
- Produces: the shape every later field task copies — `InputBase` (presentational), `InputField` (shell + context read), `BoundInput` (RHF), `Input` (the branch).

- [ ] **Step 1: Write the failing tests**

Add to `packages/ui/src/components/Input/Input.test.tsx`:

```tsx
import { z } from 'zod';
import { Form } from '../Form';

describe('Input inside a Form', () => {
  it('binds its initial value from defaultValues', () => {
    render(
      <Form defaultValues={{ email: 'a@b.de' }} onSubmit={vi.fn()}>
        <Input name="email" label="E-Mail" />
      </Form>,
    );
    expect(screen.getByLabelText('E-Mail')).toHaveValue('a@b.de');
  });

  it('writes changes back into the form values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ email: '' }} onSubmit={onSubmit}>
        <Input name="email" label="E-Mail" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('E-Mail'), 'x@y.de');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'x@y.de' });
  });

  it('shows the zod message as helper text and marks the field invalid', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().email('keine E-Mail') })}
        defaultValues={{ email: 'nope' }}
        onSubmit={vi.fn()}
      >
        <Input name="email" label="E-Mail" helperText="wird nicht veröffentlicht" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));

    const input = screen.getByLabelText('E-Mail');
    expect(await screen.findByText('keine E-Mail')).toBeInTheDocument();
    expect(screen.queryByText('wird nicht veröffentlicht')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('keine E-Mail').id);
  });

  it('validates on blur when the form asks for it', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().email('keine E-Mail') })}
        defaultValues={{ email: '' }}
        mode="onBlur"
        onSubmit={vi.fn()}
      >
        <Input name="email" label="E-Mail" />
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('E-Mail'), 'nope');
    await userEvent.tab();
    expect(await screen.findByText('keine E-Mail')).toBeInTheDocument();
  });

  it('turns danger when the bound field has an error', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().email('keine E-Mail') })}
        defaultValues={{ email: 'nope' }}
        onSubmit={vi.fn()}
      >
        <Input name="email" label="E-Mail" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    await screen.findByText('keine E-Mail');
    expect(screen.getByLabelText('E-Mail').parentElement).toHaveClass('border-danger-outlined-border');
  });
});

describe('Input outside a Form', () => {
  it('stays uncontrolled and unwrapped with a name but no form', () => {
    const { container } = render(<Input aria-label="frei" name="email" />);
    // No FormControl wrapper appears: the <span> input wrapper is the root.
    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(screen.getByRole('textbox', { name: 'frei' })).toHaveAttribute('name', 'email');
  });

  it('still honours a controlled value prop', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="frei" value="fest" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'frei' }), 'x');
    expect(screen.getByRole('textbox', { name: 'frei' })).toHaveValue('fest');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders label and helper text without a form', () => {
    render(<Input name="x" label="Titel" helperText="Hinweis" />);
    expect(screen.getByLabelText('Titel')).toBeInTheDocument();
    expect(screen.getByText('Hinweis')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/Input/`
Expected: FAIL — `label`, `helperText` are not props; nothing binds.

- [ ] **Step 3: Extend the types**

Replace `packages/ui/src/components/Input/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'color' | 'size' | 'onChange'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /**
   * Forces the error look. OR-ed with the bound field's own error state, so a
   * server-side error can be shown for a field the schema considers valid.
   */
  error?: boolean;
}
```

- [ ] **Step 4: Implement the four-part split**

Replace `packages/ui/src/components/Input/Input.tsx`:

```tsx
'use client';
import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { useFormContext } from 'react-hook-form';
import { cx } from '../../utils/cx';
import { inputVariants } from './inputVariants';
import { FormControlContext } from '../FormControl/FormControlContext';
import { FieldShell, textAdapter, useBoundField, useFieldIds, useForkRef } from '../../internal/form';
import type { InputProps } from './types';

/** The unconnected input: variant/colour/decorators and nothing else. */
const InputBase = React.forwardRef<HTMLInputElement, InputProps>(function InputBase(
  // label/helperText are stripped by InputField above, so they never reach
  // here and are deliberately not destructured (an unused binding would trip
  // no-unused-vars).
  { variant = 'outlined', color, size = 'md', startDecorator, endDecorator, className, error, ...props },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  // Joy resolves `color = error ? 'danger' : color` — an explicit colour from
  // the caller always wins, the same "only when not explicit" rule Checkbox
  // and Switch already use for their state colours.
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  const disabled = props.disabled ?? formControl?.disabled;

  return (
    <span className={cx(inputVariants({ variant, color: effectiveColor, size }), className)}>
      {startDecorator && <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>}
      <BaseInput
        ref={ref}
        className="w-full min-w-0 border-none bg-transparent p-0 outline-none"
        aria-invalid={hasError || undefined}
        {...props}
        disabled={disabled}
      />
      {endDecorator && <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>}
    </span>
  );
});

/** InputBase plus its optional FormControl/FormLabel/FormHelperText shell. */
const InputField = React.forwardRef<HTMLInputElement, InputProps>(function InputField(
  { label, helperText, error, required, id: idProp, ...props },
  ref,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={props.disabled}
      id={id}
      helperId={helperId}
    >
      <InputBase
        ref={ref}
        id={id}
        required={required}
        error={error}
        aria-describedby={helperId}
        {...props}
      />
    </FieldShell>
  );
});

/** The react-hook-form-connected form of InputField. */
const BoundInput = React.forwardRef<HTMLInputElement, InputProps>(function BoundInput(
  { name, onChange, onBlur, value: _ignoredValue, defaultValue: _ignoredDefault, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, textAdapter, { onChange, onBlur });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLInputElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <InputField
      {...rest}
      {...(boundProps as InputProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

// The branch is stable per call site — a field inside a form either has a
// name for its whole life or never does — so the component type does not
// change at runtime and nothing remounts. `name` alone changes nothing:
// outside a <Form> there is no context to read.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundInput {...props} ref={ref} />;
  }
  return <InputField {...props} ref={ref} />;
});
```

- [ ] **Step 5: Run the Input and FormControl tests**

Run: `cd packages/ui && pnpm test src/components/Input/ src/components/FormControl/`
Expected: PASS — including the three cascade tests Task 5 left red.

- [ ] **Step 6: Extend Input's visual test with the error matrix**

In `packages/ui/src/visual/Input.visual.test.tsx`, add an error-state pass over all four variants ×
five colours. Write it out inline here — Task 6b turns exactly this block into the shared helper the
other eight fields use, and it can only be shown to be equivalent if this one exists first:

```tsx
describe('Input error-state parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} in error state matches Joy UI`, async () => {
        const { container: joyContainer } = render(
          <div data-testid={`joy-err-${variant}-${color}`}>
            <JoyCssVarsProvider>
              <JoyInput error variant={variant} color={color} placeholder={color} />
            </JoyCssVarsProvider>
          </div>,
        );
        const { container: hintoricContainer } = render(
          <div data-testid={`hintoric-err-${variant}-${color}`}>
            <ColorSchemeProvider>
              <HintoricInput error variant={variant} color={color} placeholder={color} />
            </ColorSchemeProvider>
          </div>,
        );
        await settleTransitions();

        const joyWrapper = joyContainer.querySelector('input')!.parentElement as HTMLElement;
        const hintoricWrapper = hintoricContainer.querySelector('input')!.parentElement as HTMLElement;
        const joyStyle = getComputedStyle(joyWrapper);
        const hintoricStyle = getComputedStyle(hintoricWrapper);

        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
        expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
        expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));

        await expect(page.getByTestId(`joy-err-${variant}-${color}`)).toMatchScreenshot(
          `input-error-${variant}-${color}-joy`,
        );
        await expect(page.getByTestId(`hintoric-err-${variant}-${color}`)).toMatchScreenshot(
          `input-error-${variant}-${color}-hintoric`,
        );
      });
    }
  }
});
```

Add `settleTransitions` to the file's existing import from `./helpers` if it is not already there.

**If these fail with a colour mismatch on the non-danger colours, Joy is the reference.** Joy's
`error` sets `color="danger"` internally and therefore beats an explicit colour; if so, change
`InputBase` so `hasError` wins over an explicit `color`, and record the finding as a spec addendum.
Do not adjust the expectation.

- [ ] **Step 7: Run the visual test twice and look at the screenshots**

Run: `cd packages/ui && pnpm test:visual src/visual/Input.visual.test.tsx`
Expected: first run FAILS ("no existing reference screenshot found"); rerun to PASS. Then open several of the 40 new PNGs under `src/visual/__screenshots__/Input.visual.test.tsx/` and confirm the error state actually looks like Joy's.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Input packages/ui/src/visual/Input.visual.test.tsx packages/ui/src/visual/__screenshots__/Input.visual.test.tsx
git commit -m "Bind Input to react-hook-form and give it label/helperText/error

Splits into InputBase (presentational), InputField (optional FormControl
shell), BoundInput (useController) and Input (the context branch). Without a
form context or without a name, the rendered DOM is byte-for-byte what it was
— which is what keeps the existing visual baselines valid."
```

---

### Task 6b: Two shared test helpers

The spec requires the same six-point matrix for every one of the nine fields, and the same
error-state visual pass over each field's existing variant×colour axes. Written out nine times that
is copy-paste that rots independently; written once it is a single thing to keep correct.

**Files:**
- Create: `packages/ui/src/test/fieldMatrix.tsx`
- Create: `packages/ui/src/visual/helpers/errorParity.tsx`

**Interfaces:**
- Consumes: `Form` (Task 3) and the finished `Input` (Task 6), whose hand-written tests these helpers must reproduce exactly before eight other fields lean on them.
- Produces:
  - `runFieldMatrix(config: FieldMatrixConfig): void` — declares the six required `it()` blocks for one field. Call it from inside a `describe` in that field's test file.
  - `FieldMatrixConfig` — `{ name, render, schema, message, validDefaults, invalidDefaults, edit, expectedAfterEdit, control, standaloneRootTag, renderStandalone }`
  - `describeErrorParity(config: ErrorParityConfig): void` — declares the error-state visual matrix for one field.
  - `ErrorParityConfig` — `{ slug, variants, colors, renderJoy, renderHintoric, element, assertStyles? }`

- [ ] **Step 1: Write the jsdom matrix helper**

Create `packages/ui/src/test/fieldMatrix.tsx`:

```tsx
import * as React from 'react';
import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ZodType } from 'zod';
import { Form } from '../components/Form';

export interface FieldMatrixConfig {
  /** The form field path, e.g. 'email'. */
  name: string;
  /** Renders the field under test. `props` must be spread onto it. */
  render: (props: { name: string; label: string; helperText?: string }) => React.ReactElement;
  /** A schema that REJECTS invalidDefaults with exactly `message`. */
  schema: ZodType<Record<string, unknown>>;
  message: string;
  validDefaults: Record<string, unknown>;
  invalidDefaults: Record<string, unknown>;
  /** Performs one user edit on the rendered field. */
  edit: () => Promise<void>;
  /** The form value expected after `edit` ran once against validDefaults. */
  expectedAfterEdit: Record<string, unknown>;
  /** Returns the element that should carry aria-invalid / aria-describedby. */
  control: () => HTMLElement;
  /** Root tag name the field renders with no label and no helper text. */
  standaloneRootTag: string;
  /** Renders the field with a name but no <Form> around it. */
  renderStandalone: () => React.ReactElement;
}

/**
 * The six checks the spec requires of every bound field. Point 6 is the
 * important one: it is the test for the promise that this whole change is
 * additive, i.e. that a `name` alone does nothing outside a <Form>.
 */
export function runFieldMatrix(config: FieldMatrixConfig): void {
  const label = 'Feld';

  it('1. binds its initial value from defaultValues', () => {
    render(
      <Form defaultValues={config.validDefaults} onSubmit={vi.fn()}>
        {config.render({ name: config.name, label })}
      </Form>,
    );
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it('2. writes a change back into the form values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={config.validDefaults} onSubmit={onSubmit}>
        {config.render({ name: config.name, label })}
        <button type="submit">ok</button>
      </Form>,
    );
    await config.edit();
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual(config.expectedAfterEdit);
  });

  it('3. validates on blur when the form asks for it', async () => {
    render(
      <Form schema={config.schema} defaultValues={config.invalidDefaults} mode="onBlur" onSubmit={vi.fn()}>
        {config.render({ name: config.name, label })}
      </Form>,
    );
    config.control().focus();
    await userEvent.tab();
    expect(await screen.findByText(config.message)).toBeInTheDocument();
  });

  it('4. shows the zod message as helper text, replacing its own', async () => {
    render(
      <Form schema={config.schema} defaultValues={config.invalidDefaults} onSubmit={vi.fn()}>
        {config.render({ name: config.name, label, helperText: 'eigener Hinweis' })}
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText(config.message)).toBeInTheDocument();
    expect(screen.queryByText('eigener Hinweis')).not.toBeInTheDocument();
  });

  it('5. marks the control invalid and points aria-describedby at the message', async () => {
    render(
      <Form schema={config.schema} defaultValues={config.invalidDefaults} onSubmit={vi.fn()}>
        {config.render({ name: config.name, label })}
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    const message = await screen.findByText(config.message);
    const control = config.control();
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('aria-describedby', message.id);
  });

  it('6. is unchanged outside a Form, even with a name', () => {
    const { container } = render(config.renderStandalone());
    expect(container.firstElementChild?.tagName).toBe(config.standaloneRootTag);
  });
}
```

- [ ] **Step 2: Prove the helper against Input, which already has hand-written equivalents**

Add to `packages/ui/src/components/Input/Input.test.tsx`:

```tsx
import { z } from 'zod';
import { runFieldMatrix } from '../../test/fieldMatrix';

describe('Input field matrix', () => {
  runFieldMatrix({
    name: 'email',
    render: (props) => <Input {...props} />,
    schema: z.object({ email: z.string().email('keine E-Mail') }),
    message: 'keine E-Mail',
    validDefaults: { email: '' },
    invalidDefaults: { email: 'nope' },
    edit: async () => {
      await userEvent.type(screen.getByLabelText('Feld'), 'x@y.de');
    },
    expectedAfterEdit: { email: 'x@y.de' },
    control: () => screen.getByLabelText('Feld'),
    standaloneRootTag: 'SPAN',
    renderStandalone: () => <Input aria-label="frei" name="email" />,
  });
});
```

Run: `cd packages/ui && pnpm test src/components/Input/`
Expected: PASS, all six — they duplicate Task 6's hand-written tests on purpose, which is how the helper is shown to be equivalent before the other eight fields depend on it.

- [ ] **Step 3: Write the visual error-parity helper**

Create `packages/ui/src/visual/helpers/errorParity.tsx`:

```tsx
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy';
import { ColorSchemeProvider } from '../../theme/ColorSchemeProvider';
import { settleTransitions, lastShadowLayer } from '../helpers';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ErrorParityConfig {
  /** Screenshot name prefix, e.g. 'checkbox'. */
  slug: string;
  /** Omit for components with no variant axis (Switch, Slider). */
  variants?: readonly JoyVariant[];
  colors: readonly JoyColor[];
  /**
   * Renders the Joy reference in its error state. When Joy's component has no
   * `error` prop, render it with color="danger" instead and say so in a
   * comment at the call site — that is the documented fallback.
   */
  renderJoy: (args: { variant?: JoyVariant; color: JoyColor }) => React.ReactElement;
  renderHintoric: (args: { variant?: JoyVariant; color: JoyColor }) => React.ReactElement;
  /** Picks the element whose computed styles carry the look, out of the rendered container. */
  element: (container: HTMLElement) => HTMLElement;
  /** Extra property comparisons beyond the shared four. */
  assertStyles?: (hintoric: CSSStyleDeclaration, joy: CSSStyleDeclaration) => void;
}

/**
 * The error-state half of a field's visual coverage: the full variant×colour
 * matrix CLAUDE.md requires, against the real @mui/joy package. Pass/fail is
 * the computed-style equality; the screenshots are for a human to look at.
 */
export function describeErrorParity(config: ErrorParityConfig): void {
  const variants: Array<JoyVariant | undefined> = config.variants ? [...config.variants] : [undefined];

  describe(`${config.slug} error-state parity with @mui/joy`, () => {
    for (const variant of variants) {
      for (const color of config.colors) {
        const key = variant ? `${variant}-${color}` : color;
        it(`${key} in error state matches Joy UI`, async () => {
          const { container: joyContainer } = render(
            <div data-testid={`joy-err-${key}`}>
              <JoyCssVarsProvider>{config.renderJoy({ variant, color })}</JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-err-${key}`}>
              <ColorSchemeProvider>{config.renderHintoric({ variant, color })}</ColorSchemeProvider>
            </div>,
          );
          await settleTransitions();

          const joyStyle = getComputedStyle(config.element(joyContainer));
          const hintoricStyle = getComputedStyle(config.element(hintoricContainer));

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));
          config.assertStyles?.(hintoricStyle, joyStyle);

          await expect(page.getByTestId(`joy-err-${key}`)).toMatchScreenshot(
            `${config.slug}-error-${key}-joy`,
          );
          await expect(page.getByTestId(`hintoric-err-${key}`)).toMatchScreenshot(
            `${config.slug}-error-${key}-hintoric`,
          );
        });
      }
    }
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/test/fieldMatrix.tsx packages/ui/src/visual/helpers/errorParity.tsx packages/ui/src/components/Input/Input.test.tsx
git commit -m "Add the two shared field-test helpers

The spec asks the same six checks of all nine fields and the same error-state
visual matrix of each. Written out nine times that is copy-paste that rots
independently. Both helpers are first proved against Input, whose hand-written
equivalents they duplicate on purpose."
```

---

### Task 7: Bind `Textarea`

**Files:**
- Modify: `packages/ui/src/components/Textarea/Textarea.tsx`
- Modify: `packages/ui/src/components/Textarea/types.ts`
- Test: `packages/ui/src/components/Textarea/Textarea.test.tsx`
- Test: `packages/ui/src/visual/Textarea.visual.test.tsx`

**Interfaces:**
- Consumes: Task 4's core; Task 6's four-part shape.
- Produces: `TextareaBase`, `TextareaField`, `BoundTextarea`, `Textarea`.

- [ ] **Step 1: Write the failing tests**

Add to `packages/ui/src/components/Textarea/Textarea.test.tsx`:

```tsx
import * as React from 'react';
import { z } from 'zod';
import userEvent from '@testing-library/user-event';
import { Form } from '../Form';

describe('Textarea inside a Form', () => {
  it('binds its initial value and writes changes back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ notiz: 'alt' }} onSubmit={onSubmit}>
        <Textarea name="notiz" label="Notiz" />
        <button type="submit">ok</button>
      </Form>,
    );
    const field = screen.getByLabelText('Notiz');
    expect(field).toHaveValue('alt');
    await userEvent.clear(field);
    await userEvent.type(field, 'neu');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ notiz: 'neu' });
  });

  it('shows the zod message as helper text and marks the field invalid', async () => {
    render(
      <Form
        schema={z.object({ notiz: z.string().min(5, 'zu kurz') })}
        defaultValues={{ notiz: 'ab' }}
        onSubmit={vi.fn()}
      >
        <Textarea name="notiz" label="Notiz" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText('zu kurz')).toBeInTheDocument();
    expect(screen.getByLabelText('Notiz')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Textarea outside a Form', () => {
  it('renders a bare textarea with a name and no wrapper', () => {
    const { container } = render(<Textarea aria-label="frei" name="notiz" />);
    expect(container.firstElementChild?.tagName).toBe('TEXTAREA');
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/Textarea/`
Expected: FAIL — no `label` prop, no binding.

- [ ] **Step 3: Extend the types**

Replace `packages/ui/src/components/Textarea/types.ts`:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TextareaProps
  extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'color' | 'size'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
}
```

- [ ] **Step 4: Implement**

Replace `packages/ui/src/components/Textarea/Textarea.tsx`:

```tsx
'use client';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { cx } from '../../utils/cx';
import { inputVariants } from '../Input/inputVariants';
import { FormControlContext } from '../FormControl/FormControlContext';
import { FieldShell, textAdapter, useBoundField, useFieldIds, useForkRef } from '../../internal/form';
import type { TextareaProps } from './types';

const TextareaBase = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaBase(
  // As in InputBase: TextareaField strips label/helperText before this point.
  { variant = 'outlined', color, size = 'md', className, error, ...props },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  return (
    <textarea
      ref={ref}
      // resize-none matches Joy UI's real Textarea: the browser's native
      // resize handle isn't clipped by border-radius, so leaving resize on
      // shows a square poking out of the rounded corner.
      className={cx(inputVariants({ variant, color: effectiveColor, size }), 'items-start py-1.5 resize-none', className)}
      aria-invalid={hasError || undefined}
      {...props}
      disabled={props.disabled ?? formControl?.disabled}
    />
  );
});

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaField(
  { label, helperText, error, required, id: idProp, ...props },
  ref,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={props.disabled}
      id={id}
      helperId={helperId}
    >
      <TextareaBase ref={ref} id={id} required={required} error={error} aria-describedby={helperId} {...props} />
    </FieldShell>
  );
});

const BoundTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function BoundTextarea(
  { name, onChange, onBlur, value: _v, defaultValue: _d, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, textAdapter, { onChange, onBlur });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLTextAreaElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <TextareaField
      {...rest}
      {...(boundProps as TextareaProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundTextarea {...props} ref={ref} />;
  }
  return <TextareaField {...props} ref={ref} />;
});
```

- [ ] **Step 5: Run to confirm they pass**

Run: `cd packages/ui && pnpm test src/components/Textarea/`
Expected: PASS.

- [ ] **Step 6: Declare the six-point matrix**

Add to `packages/ui/src/components/Textarea/Textarea.test.tsx`:

```tsx
import { runFieldMatrix } from '../../test/fieldMatrix';

describe('Textarea field matrix', () => {
  runFieldMatrix({
    name: 'notiz',
    render: (props) => <Textarea {...props} />,
    schema: z.object({ notiz: z.string().min(5, 'zu kurz') }),
    message: 'zu kurz',
    validDefaults: { notiz: '' },
    invalidDefaults: { notiz: 'ab' },
    edit: async () => {
      await userEvent.type(screen.getByLabelText('Feld'), 'neu');
    },
    expectedAfterEdit: { notiz: 'neu' },
    control: () => screen.getByLabelText('Feld'),
    standaloneRootTag: 'TEXTAREA',
    renderStandalone: () => <Textarea aria-label="frei" name="notiz" />,
  });
});
```

Run: `cd packages/ui && pnpm test src/components/Textarea/`
Expected: PASS, all six.

- [ ] **Step 7: Extend the visual test with the error matrix**

Add to `packages/ui/src/visual/Textarea.visual.test.tsx`:

```tsx
import { describeErrorParity } from './helpers/errorParity';
import { Textarea as JoyTextarea } from '@mui/joy';
import { Textarea as HintoricTextarea } from '../components/Textarea';

describeErrorParity({
  slug: 'textarea',
  variants: VARIANTS,
  colors: COLORS,
  renderJoy: ({ variant, color }) => (
    <JoyTextarea error variant={variant} color={color} placeholder={color} />
  ),
  renderHintoric: ({ variant, color }) => (
    <HintoricTextarea error variant={variant} color={color} placeholder={color} />
  ),
  element: (container) => container.querySelector('textarea') as HTMLElement,
  assertStyles: (hintoric, joy) => {
    expect(hintoric.minHeight).toBe(joy.minHeight);
  },
});
```

Run: `cd packages/ui && pnpm test:visual src/visual/Textarea.visual.test.tsx` (twice — the first run writes baselines), then open the PNGs.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Textarea packages/ui/src/visual/Textarea.visual.test.tsx packages/ui/src/visual/__screenshots__/Textarea.visual.test.tsx
git commit -m "Bind Textarea to react-hook-form"
```

---

### Task 8: Bind `Checkbox`, `Switch` and `Radio` (checked adapter)

**Files:**
- Modify: `packages/ui/src/components/Checkbox/Checkbox.tsx`, `Checkbox/types.ts`
- Modify: `packages/ui/src/components/Switch/Switch.tsx`, `Switch/types.ts`
- Modify: `packages/ui/src/components/Radio/Radio.tsx`, `Radio/types.ts`
- Test: the three matching `*.test.tsx`
- Test: `packages/ui/src/visual/Checkbox.visual.test.tsx`, `Switch.visual.test.tsx`, `Radio.visual.test.tsx`

**Interfaces:**
- Consumes: `checkedAdapter`, `useBoundField`, `FieldShell`, `useFieldIds`, `useForkRef`; `RadioGroupContext` from `../RadioGroup/RadioGroupContext`.
- Produces: `Checkbox`, `Switch`, `Radio` each with `label` (already present on Checkbox and Radio), `helperText`, `error`, and RHF binding.

- [ ] **Step 1: Write the failing tests for Checkbox**

Add to `packages/ui/src/components/Checkbox/Checkbox.test.tsx`:

```tsx
import { z } from 'zod';
import { Form } from '../Form';

describe('Checkbox inside a Form', () => {
  it('binds a boolean and writes the toggle back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ agb: false }} onSubmit={onSubmit}>
        <Checkbox name="agb" label="AGB" />
        <button type="submit">ok</button>
      </Form>,
    );
    expect(screen.getByRole('checkbox', { name: 'AGB' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'AGB' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ agb: true });
  });

  it('shows the zod message as helper text', async () => {
    render(
      <Form
        schema={z.object({ agb: z.literal(true, { message: 'Zustimmung erforderlich' }) })}
        defaultValues={{ agb: false }}
        onSubmit={vi.fn()}
      >
        <Checkbox name="agb" label="AGB" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText('Zustimmung erforderlich')).toBeInTheDocument();
  });
});

describe('Checkbox outside a Form', () => {
  it('keeps working uncontrolled with a name', async () => {
    render(<Checkbox name="agb" label="AGB" defaultChecked />);
    expect(screen.getByRole('checkbox', { name: 'AGB' })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'AGB' }));
    expect(screen.getByRole('checkbox', { name: 'AGB' })).not.toBeChecked();
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/Checkbox/`
Expected: FAIL — nothing binds.

- [ ] **Step 3: Implement Checkbox**

Add `helperText?: React.ReactNode` and `error?: boolean` to `CheckboxProps` in `Checkbox/types.ts` with the same doc comments as `InputProps`.

In `Checkbox.tsx`, rename the current component to `CheckboxBase` (unchanged body, plus a `FormControlContext` read for `disabled`), then add:

```tsx
const CheckboxField = React.forwardRef<HTMLElement, CheckboxProps>(function CheckboxField(
  { helperText, error, required, id: idProp, label, ...props },
  ref,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  // Checkbox carries its own inline <label>, so only helperText needs the
  // shell — passing `label` into FieldShell too would render it twice.
  return (
    <FieldShell helperText={helperText} error={error} required={required} disabled={props.disabled} id={id} helperId={helperId}>
      <CheckboxBase ref={ref} id={id} required={required} label={label} aria-describedby={helperId} aria-invalid={error || undefined} {...props} />
    </FieldShell>
  );
});

const BoundCheckbox = React.forwardRef<HTMLElement, CheckboxProps>(function BoundCheckbox(
  { name, onCheckedChange, checked: _c, defaultChecked: _d, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, checkedAdapter, { onCheckedChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <CheckboxField
      {...rest}
      {...(boundProps as CheckboxProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(function Checkbox(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundCheckbox {...props} ref={ref} />;
  }
  return <CheckboxField {...props} ref={ref} />;
});
```

Keep `CheckboxBase`'s existing `variant`/`color` state-switching logic exactly as it is — the checked/unchecked variant flip is verified Joy behaviour and must not be touched here.

- [ ] **Step 4: Run to confirm Checkbox passes**

Run: `cd packages/ui && pnpm test src/components/Checkbox/`
Expected: PASS.

- [ ] **Step 5: Repeat for Switch**

Add the same tests to `Switch.test.tsx`, substituting `role: 'switch'` and `name="benachrichtigungen"`:

```tsx
describe('Switch inside a Form', () => {
  it('binds a boolean and writes the toggle back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ push: false }} onSubmit={onSubmit}>
        <Switch name="push" aria-label="push" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('switch', { name: 'push' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ push: true });
  });
});

describe('Switch outside a Form', () => {
  it('keeps working uncontrolled with a name', async () => {
    render(<Switch name="push" aria-label="push" defaultChecked />);
    expect(screen.getByRole('switch', { name: 'push' })).toBeChecked();
  });
});
```

Add `name?: string`, `helperText?`, `error?`, `label?` to `SwitchProps` (it has no `name` today), then apply the identical `SwitchBase` / `SwitchField` / `BoundSwitch` / `Switch` split, passing `name` through to `BaseSwitch.Root`.

Run: `cd packages/ui && pnpm test src/components/Switch/`
Expected: PASS.

- [ ] **Step 6: Repeat for Radio, with the group rule**

Add to `Radio.test.tsx`:

```tsx
describe('Radio inside a Form', () => {
  it('binds standalone as a boolean', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ einzeln: false }} onSubmit={onSubmit}>
        <Radio name="einzeln" label="einzeln" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'einzeln' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ einzeln: true });
  });

  it('does not bind when it sits inside a RadioGroup', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ rolle: 'leser' }} onSubmit={onSubmit}>
        <RadioGroup name="rolle">
          {/* A name here must be ignored: the group owns the field, and two
              writers on one path make the winner depend on handler order. */}
          <Radio name="rolle" value="admin" label="Admin" />
          <Radio name="rolle" value="leser" label="Leser" />
        </RadioGroup>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ rolle: 'admin' });
  });
});
```

Add `import { RadioGroup } from '../RadioGroup';` to the test file. Then in `Radio.tsx`, the branch gains the group check:

```tsx
export const Radio = React.forwardRef<HTMLElement, RadioProps>(function Radio(props, ref) {
  const form = useFormContext();
  const group = React.useContext(RadioGroupContext);
  // Inside a group the group is the field and this Radio is only an option
  // in it — binding both writes to the same path from two places.
  if (form && props.name && group === undefined) {
    return <BoundRadio {...props} ref={ref} />;
  }
  return <RadioField {...props} ref={ref} />;
});
```

Run: `cd packages/ui && pnpm test src/components/Radio/`
Expected: PASS. The second test will not fully pass until Task 10 binds `RadioGroup`; if so, mark it `it.todo` **only** with a comment naming Task 10, and flip it back there.

- [ ] **Step 7: Declare the six-point matrix for all three**

Add to each of the three test files. Checkbox:

```tsx
import { runFieldMatrix } from '../../test/fieldMatrix';

describe('Checkbox field matrix', () => {
  runFieldMatrix({
    name: 'agb',
    render: (props) => <Checkbox {...props} />,
    schema: z.object({ agb: z.literal(true, { message: 'Zustimmung erforderlich' }) }),
    message: 'Zustimmung erforderlich',
    validDefaults: { agb: false },
    invalidDefaults: { agb: false },
    edit: async () => {
      await userEvent.click(screen.getByRole('checkbox', { name: 'Feld' }));
    },
    expectedAfterEdit: { agb: true },
    control: () => screen.getByRole('checkbox', { name: 'Feld' }),
    standaloneRootTag: 'LABEL',
    renderStandalone: () => <Checkbox name="agb" label="AGB" />,
  });
});
```

Switch — identical shape with `role: 'switch'`, `name: 'push'`, schema
`z.object({ push: z.literal(true, { message: 'muss an sein' }) })`, and `standaloneRootTag: 'SPAN'`
(Switch wraps itself in a decorator span). Radio — `role: 'radio'`, `name: 'einzeln'`, schema
`z.object({ einzeln: z.literal(true, { message: 'bitte wählen' }) })`, `standaloneRootTag: 'LABEL'`,
and `renderStandalone: () => <Radio name="einzeln" label="einzeln" />`.

If a `standaloneRootTag` guess is wrong, take the tag the test reports — it is describing the DOM
that exists, and point 6 exists to pin that DOM down, not to assert a preference about it.

Run: `cd packages/ui && pnpm test src/components/Checkbox/ src/components/Switch/ src/components/Radio/`
Expected: PASS, eighteen matrix tests plus the hand-written ones.

- [ ] **Step 8: Extend the three visual tests**

**Check first whether Joy's component has an `error` prop at all.** Joy's `Checkbox`, `Switch` and
`Radio` may not. Where it does not, render the Joy side with `color="danger"` instead and put a
comment at the call site saying which fallback applied — then record all three outcomes as a spec
addendum. Never invent a colour value.

`Checkbox.visual.test.tsx`:

```tsx
import { describeErrorParity } from './helpers/errorParity';

describeErrorParity({
  slug: 'checkbox',
  variants: VARIANTS,
  colors: COLORS,
  // Joy's Checkbox has no `error` prop, so color="danger" is the reference.
  // Confirmed by reading @mui/joy's Checkbox.js props before writing this.
  renderJoy: ({ variant, color }) => <JoyCheckbox variant={variant} color={color} label="x" />,
  renderHintoric: ({ variant, color }) => (
    <HintoricCheckbox error variant={variant} color={color} label="x" />
  ),
  element: (container) => container.querySelector('[role="checkbox"]') as HTMLElement,
});
```

`Switch.visual.test.tsx` — same call with `slug: 'switch'`, **no `variants` key** (its variant is
fixed at solid), `colors: COLORS`, and `element: (c) => c.querySelector('[role="switch"]')`.
`Radio.visual.test.tsx` — same with `slug: 'radio'`, `variants: VARIANTS`, and
`element: (c) => c.querySelector('[role="radio"]')`.

Run each twice, then look at the PNGs.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/components/Checkbox packages/ui/src/components/Switch packages/ui/src/components/Radio packages/ui/src/visual/Checkbox.visual.test.tsx packages/ui/src/visual/Switch.visual.test.tsx packages/ui/src/visual/Radio.visual.test.tsx packages/ui/src/visual/__screenshots__
git commit -m "Bind Checkbox, Switch and Radio to react-hook-form

All three share the checked adapter. Radio additionally refuses to bind when
it sits inside a RadioGroup: there the group is the field and the Radio is
only an option in it, so binding both would put two writers on one path and
make the winner depend on handler order."
```

---

### Task 9: Bind `Select` and `Autocomplete` (value adapter)

**Files:**
- Modify: `packages/ui/src/components/Select/Select.tsx`, `Select/types.ts`
- Modify: `packages/ui/src/components/Autocomplete/Autocomplete.tsx`, `Autocomplete/types.ts`
- Test: `Select.test.tsx`, `Autocomplete.test.tsx`
- Test: `packages/ui/src/visual/Select.visual.test.tsx`, `Autocomplete.visual.test.tsx`

**Interfaces:**
- Consumes: `valueAdapter` and the rest of Task 4's core.
- Produces: `Select` and `Autocomplete` with `label`, `helperText`, `error` and RHF binding. Both are generic components (`SelectProps<Value>`), so the bound wrapper must preserve the generic — cast through `as` at the `forwardRef` boundary the same way `Select.tsx` already does today.

- [ ] **Step 1: Write the failing tests for Select**

Add to `packages/ui/src/components/Select/Select.test.tsx`:

```tsx
import { z } from 'zod';
import { Form } from '../Form';
import { Option } from '../Option';

describe('Select inside a Form', () => {
  it('binds its value and writes the choice back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ rolle: 'leser' }} onSubmit={onSubmit}>
        <Select name="rolle" label="Rolle">
          <Option value="admin">Admin</Option>
          <Option value="leser">Leser</Option>
        </Select>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Rolle' }));
    await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ rolle: 'admin' });
  });

  it('shows the zod message as helper text', async () => {
    render(
      <Form
        schema={z.object({ rolle: z.enum(['admin', 'leser'], { message: 'Rolle wählen' }) })}
        defaultValues={{}}
        onSubmit={vi.fn()}
      >
        <Select name="rolle" label="Rolle" placeholder="—">
          <Option value="admin">Admin</Option>
        </Select>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText('Rolle wählen')).toBeInTheDocument();
  });
});

describe('Select outside a Form', () => {
  it('stays controlled by its own props', async () => {
    const onChange = vi.fn();
    render(
      <Select name="rolle" value="leser" onChange={onChange} aria-label="rolle">
        <Option value="admin">Admin</Option>
        <Option value="leser">Leser</Option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'rolle' })).toHaveTextContent('Leser');
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/Select/`
Expected: FAIL — no `label`/`helperText` props, no binding.

- [ ] **Step 3: Implement Select**

Add `label?: React.ReactNode`, `helperText?: React.ReactNode`, `error?: boolean` to `SelectProps<Value>`.

Rename the existing `SelectComponent` to `SelectBaseComponent`, have it read `FormControlContext` for `error`/`disabled` and resolve `effectiveColor = color ?? (hasError ? 'danger' : 'neutral')`. Then add, keeping the generic through the same `as` cast the file already uses for its `forwardRef` export:

```tsx
function SelectFieldComponent<Value>(
  { label, helperText, error, required, id: idProp, ...props }: SelectProps<Value>,
  ref: React.Ref<HTMLButtonElement>,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  return (
    <FieldShell label={label} helperText={helperText} error={error} required={required} disabled={props.disabled} id={id} helperId={helperId}>
      <SelectBase ref={ref} id={id} required={required} error={error} aria-describedby={helperId} {...(props as SelectProps<Value>)} />
    </FieldShell>
  );
}

function BoundSelectComponent<Value>(
  { name, onChange, value: _v, defaultValue: _d, error, helperText, ...rest }: SelectProps<Value>,
  ref: React.Ref<HTMLButtonElement>,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, valueAdapter, { onChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLButtonElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <SelectField
      {...(rest as SelectProps<Value>)}
      {...(boundProps as Partial<SelectProps<Value>>)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
}

function SelectRoot<Value>(props: SelectProps<Value>, ref: React.Ref<HTMLButtonElement>) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundSelect {...props} ref={ref} />;
  }
  return <SelectField {...props} ref={ref} />;
}

const SelectBase = React.forwardRef(SelectBaseComponent) as <Value = string>(
  props: SelectProps<Value> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
const SelectField = React.forwardRef(SelectFieldComponent) as <Value = string>(
  props: SelectProps<Value> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
const BoundSelect = React.forwardRef(BoundSelectComponent) as <Value = string>(
  props: SelectProps<Value> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
export const Select = React.forwardRef(SelectRoot) as <Value = string>(
  props: SelectProps<Value> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
```

- [ ] **Step 4: Run to confirm Select passes**

Run: `cd packages/ui && pnpm test src/components/Select/`
Expected: PASS.

- [ ] **Step 5: Repeat for Autocomplete**

Add to `Autocomplete.test.tsx`:

```tsx
describe('Autocomplete inside a Form', () => {
  it('binds its value and writes the choice back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ stadt: 'Berlin' }} onSubmit={onSubmit}>
        <Autocomplete name="stadt" label="Stadt" options={['Berlin', 'Hamburg']} />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByLabelText('Stadt'));
    await userEvent.click(screen.getByRole('option', { name: 'Hamburg' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ stadt: 'Hamburg' });
  });
});

describe('Autocomplete outside a Form', () => {
  it('stays controlled by its own props', () => {
    render(<Autocomplete name="stadt" aria-label="stadt" value="Berlin" options={['Berlin']} />);
    expect(screen.getByLabelText('stadt')).toHaveValue('Berlin');
  });
});
```

Apply the identical four-part split with `valueAdapter`, preserving the `<Value>` generic through `as` casts exactly as for Select. `Autocomplete` also has `inputValue`/`onInputChange`; leave those unbound — the bound path owns `value`/`onChange` only, and the raw text stays the component's own concern. Add a comment saying so.

Run: `cd packages/ui && pnpm test src/components/Autocomplete/`
Expected: PASS.

- [ ] **Step 6: Declare the six-point matrix for both**

Add to `Select.test.tsx`:

```tsx
import { runFieldMatrix } from '../../test/fieldMatrix';

describe('Select field matrix', () => {
  runFieldMatrix({
    name: 'rolle',
    render: (props) => (
      <Select {...props} placeholder="—">
        <Option value="admin">Admin</Option>
        <Option value="leser">Leser</Option>
      </Select>
    ),
    schema: z.object({ rolle: z.enum(['admin', 'leser'], { message: 'Rolle wählen' }) }),
    message: 'Rolle wählen',
    validDefaults: { rolle: 'leser' },
    invalidDefaults: {},
    edit: async () => {
      await userEvent.click(screen.getByLabelText('Feld'));
      await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    },
    expectedAfterEdit: { rolle: 'admin' },
    control: () => screen.getByLabelText('Feld'),
    standaloneRootTag: 'BUTTON',
    renderStandalone: () => (
      <Select aria-label="frei" name="rolle">
        <Option value="admin">Admin</Option>
      </Select>
    ),
  });
});
```

Autocomplete — same shape with `name: 'stadt'`, `render: (props) => <Autocomplete {...props} options={['Berlin', 'Hamburg']} />`,
schema `z.object({ stadt: z.enum(['Berlin', 'Hamburg'], { message: 'Stadt wählen' }) })`,
`validDefaults: { stadt: 'Berlin' }`, `invalidDefaults: {}`, an `edit` that clicks the input then the
`Hamburg` option, `expectedAfterEdit: { stadt: 'Hamburg' }` and `standaloneRootTag: 'SPAN'`.

Run: `cd packages/ui && pnpm test src/components/Select/ src/components/Autocomplete/`
Expected: PASS, twelve matrix tests plus the hand-written ones.

- [ ] **Step 7: Extend both visual tests with the error matrix**

Both Joy components do have an `error` prop, so no fallback is needed.
`Select.visual.test.tsx`:

```tsx
import { describeErrorParity } from './helpers/errorParity';

describeErrorParity({
  slug: 'select',
  variants: VARIANTS,
  colors: COLORS,
  renderJoy: ({ variant, color }) => <JoySelect error variant={variant} color={color} placeholder="—" />,
  renderHintoric: ({ variant, color }) => (
    <HintoricSelect error variant={variant} color={color} placeholder="—" />
  ),
  element: (container) => container.querySelector('button') as HTMLElement,
  assertStyles: (hintoric, joy) => {
    expect(hintoric.minHeight).toBe(joy.minHeight);
    expect(hintoric.paddingLeft).toBe(joy.paddingLeft);
  },
});
```

`Autocomplete.visual.test.tsx` — same with `slug: 'autocomplete'`, Joy's and our `Autocomplete`
given `options={['Berlin']}`, and `element: (c) => c.querySelector('input')!.parentElement`.

Run each twice, then look at the PNGs.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Select packages/ui/src/components/Autocomplete packages/ui/src/visual/Select.visual.test.tsx packages/ui/src/visual/Autocomplete.visual.test.tsx packages/ui/src/visual/__screenshots__
git commit -m "Bind Select and Autocomplete to react-hook-form

Both are generic in their value type, so each of the four parts keeps the
<Value> parameter through the same forwardRef cast the file already used.
Autocomplete's inputValue/onInputChange stay unbound — the bound path owns
value/onChange, the raw text remains the component's own business."
```

---

### Task 10: Bind `RadioGroup` and `Slider` (value adapter)

**Files:**
- Modify: `packages/ui/src/components/RadioGroup/RadioGroup.tsx`, `RadioGroup/types.ts`
- Modify: `packages/ui/src/components/Slider/Slider.tsx`, `Slider/types.ts`
- Test: `RadioGroup.test.tsx`, `Slider.test.tsx`, and flip Task 8 Step 6's second test back on if it was marked todo
- Test: `packages/ui/src/visual/RadioGroup.visual.test.tsx`, `Slider.visual.test.tsx`

**Interfaces:**
- Consumes: `valueAdapter` and Task 4's core.
- Produces: `RadioGroup` and `Slider` with `label`, `helperText`, `error` and RHF binding.

- [ ] **Step 1: Write the failing tests**

Add to `packages/ui/src/components/RadioGroup/RadioGroup.test.tsx`:

```tsx
import { z } from 'zod';
import { Form } from '../Form';
import { Radio } from '../Radio';

describe('RadioGroup inside a Form', () => {
  it('binds the selected value and writes the choice back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ rolle: 'leser' }} onSubmit={onSubmit}>
        <RadioGroup name="rolle" label="Rolle">
          <Radio value="admin" label="Admin" />
          <Radio value="leser" label="Leser" />
        </RadioGroup>
        <button type="submit">ok</button>
      </Form>,
    );
    expect(screen.getByRole('radio', { name: 'Leser' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ rolle: 'admin' });
  });

  it('shows the zod message as helper text', async () => {
    render(
      <Form
        schema={z.object({ rolle: z.enum(['admin', 'leser'], { message: 'Rolle wählen' }) })}
        defaultValues={{}}
        onSubmit={vi.fn()}
      >
        <RadioGroup name="rolle" label="Rolle">
          <Radio value="admin" label="Admin" />
        </RadioGroup>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText('Rolle wählen')).toBeInTheDocument();
  });
});
```

Add to `packages/ui/src/components/Slider/Slider.test.tsx`:

```tsx
import { Form } from '../Form';

describe('Slider inside a Form', () => {
  it('binds a number and writes keyboard changes back', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ menge: 20 }} onSubmit={onSubmit}>
        <Slider name="menge" label="Menge" />
        <button type="submit">ok</button>
      </Form>,
    );
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '20');
    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ menge: 21 });
  });
});

describe('Slider outside a Form', () => {
  it('stays controlled by its own props', () => {
    render(<Slider name="menge" value={40} aria-label="menge" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/RadioGroup/ src/components/Slider/`
Expected: FAIL — no `label`/`helperText`, no binding.

- [ ] **Step 3: Implement RadioGroup**

Add `label?`, `helperText?`, `error?` to `RadioGroupProps`. Rename the current component to `RadioGroupBase`, and add `RadioGroupField` / `BoundRadioGroup` / `RadioGroup` following Task 6's shape with `valueAdapter`. `RadioGroupBase` keeps its own controlled/uncontrolled mirror state and its `RadioGroupContext.Provider` untouched — the bound wrapper simply feeds it `value` and `onChange`.

The shell uses `FormLabel` as the group's label, so give the group `role="radiogroup"` and `aria-labelledby={labelId}` rather than `htmlFor` — a `<label>` cannot label a group. Extend `FieldShell` with an optional `labelledBy` mode if needed, or set `aria-labelledby` on `RadioGroupBase` from `` `${id}-label` `` and pass `id={`${id}-label`}` to the `FormLabel`. Pick one and write a comment saying why.

Run: `cd packages/ui && pnpm test src/components/RadioGroup/ src/components/Radio/`
Expected: PASS, including Task 8 Step 6's group test.

- [ ] **Step 4: Implement Slider**

Add `label?`, `helperText?`, `error?` to `SliderProps`. Same four-part split with `valueAdapter`.

Add this comment above `BoundSlider`:

```tsx
// RHF's setFocus and its focus-on-first-error jump both need the real
// focusable node, and Slider's ref points at Slider.Control (a div) while the
// focusable element is the thumb inside it. Focus-on-error therefore does not
// reach a Slider — a documented limit rather than a reason to bend Base UI's
// structure, since a slider is rarely the field a validation fails on.
```

Run: `cd packages/ui && pnpm test src/components/Slider/`
Expected: PASS.

- [ ] **Step 5: Declare the six-point matrix for both**

Add to `RadioGroup.test.tsx`:

```tsx
import { runFieldMatrix } from '../../test/fieldMatrix';

describe('RadioGroup field matrix', () => {
  runFieldMatrix({
    name: 'rolle',
    render: (props) => (
      <RadioGroup {...props}>
        <Radio value="admin" label="Admin" />
        <Radio value="leser" label="Leser" />
      </RadioGroup>
    ),
    schema: z.object({ rolle: z.enum(['admin', 'leser'], { message: 'Rolle wählen' }) }),
    message: 'Rolle wählen',
    validDefaults: { rolle: 'leser' },
    invalidDefaults: {},
    edit: async () => {
      await userEvent.click(screen.getByRole('radio', { name: 'Admin' }));
    },
    expectedAfterEdit: { rolle: 'admin' },
    // The group is labelled by aria-labelledby, so the labelled element IS
    // the radiogroup — see Step 3.
    control: () => screen.getByRole('radiogroup', { name: 'Feld' }),
    standaloneRootTag: 'DIV',
    renderStandalone: () => (
      <RadioGroup name="rolle">
        <Radio value="admin" label="Admin" />
      </RadioGroup>
    ),
  });
});
```

Slider — same shape with `name: 'menge'`, `render: (props) => <Slider {...props} />`, schema
`z.object({ menge: z.number().min(30, 'zu klein') })`, `validDefaults: { menge: 20 }`,
`invalidDefaults: { menge: 5 }`, an `edit` that focuses the thumb and presses `{ArrowRight}`,
`expectedAfterEdit: { menge: 21 }`, `control: () => screen.getByRole('slider')` and
`standaloneRootTag: 'DIV'`.

**Slider's point 5 is expected to need an exception.** `aria-invalid` and `aria-describedby` go on
the element the shell wraps, and for Slider that is `Slider.Control` rather than the focusable thumb.
If point 5 fails because the attributes are on the control div, move them onto the thumb — and if
Base UI does not allow that, mark point 5 `it.skip` for Slider with a comment naming the same
structural reason the focus-on-error limit already has, and add it to the spec's known limits.

Run: `cd packages/ui && pnpm test src/components/RadioGroup/ src/components/Slider/`
Expected: PASS (or Slider's point 5 documented as skipped, per the above).

- [ ] **Step 6: Extend both visual tests**

Neither Joy component is likely to have an `error` prop — check `@mui/joy`'s source and use
`color="danger"` as the reference where it is absent, with a comment at the call site.

`RadioGroup.visual.test.tsx`:

```tsx
import { describeErrorParity } from './helpers/errorParity';

describeErrorParity({
  slug: 'radiogroup',
  colors: COLORS,
  // Joy's RadioGroup takes variant/color but no error — color="danger" is the
  // reference. Confirmed against @mui/joy's RadioGroup.js props.
  renderJoy: ({ color }) => (
    <JoyRadioGroup color={color} defaultValue="a">
      <JoyRadio value="a" label="A" />
    </JoyRadioGroup>
  ),
  renderHintoric: ({ color }) => (
    <HintoricRadioGroup error color={color} defaultValue="a">
      <HintoricRadio value="a" label="A" />
    </HintoricRadioGroup>
  ),
  element: (container) => container.querySelector('[role="radiogroup"]') as HTMLElement,
});
```

`Slider.visual.test.tsx` — same with `slug: 'slider'`, `variants: VARIANTS` (Slider does have a
variant axis), `colors: COLORS`, and `element: (c) => c.querySelector('[role="slider"]')`.

Run each twice, then look at the PNGs.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/RadioGroup packages/ui/src/components/Slider packages/ui/src/visual/RadioGroup.visual.test.tsx packages/ui/src/visual/Slider.visual.test.tsx packages/ui/src/visual/__screenshots__
git commit -m "Bind RadioGroup and Slider to react-hook-form

RadioGroup is labelled by aria-labelledby rather than htmlFor, because a
<label> cannot label a group. Slider records a known limit: RHF's
focus-on-error needs the focusable node, and Slider's ref points at the
control div while the thumb inside it is what takes focus."
```

---

### Task 11: `<FormField>`

**Files:**
- Create: `packages/ui/src/components/FormField/FormField.tsx`
- Create: `packages/ui/src/components/FormField/types.ts`
- Create: `packages/ui/src/components/FormField/index.ts`
- Test: `packages/ui/src/components/FormField/FormField.test.tsx`
- Test: `packages/ui/src/visual/FormField.visual.test.tsx`

**Interfaces:**
- Consumes: `FieldShell`, `useFieldIds` from Task 4.
- Produces: `FormField`, `FormFieldProps<T, N>` — a render-prop wrapper over `useController`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/components/FormField/FormField.test.tsx`:

```tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from '../Form';
import { FormField } from './FormField';

describe('FormField', () => {
  it('hands field and fieldState to its render prop', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ farbe: '#fff' }} onSubmit={onSubmit}>
        <FormField name="farbe" label="Farbe">
          {({ field }) => (
            <input
              aria-label="farbe"
              value={String(field.value)}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        </FormField>
        <button type="submit">ok</button>
      </Form>,
    );
    const input = screen.getByLabelText('farbe');
    expect(input).toHaveValue('#fff');
    await userEvent.clear(input);
    await userEvent.type(input, '#000');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ farbe: '#000' });
  });

  it('renders the zod message as helper text and reports invalid to the render prop', async () => {
    render(
      <Form
        schema={z.object({ farbe: z.string().startsWith('#', 'muss mit # beginnen') })}
        defaultValues={{ farbe: 'rot' }}
        onSubmit={vi.fn()}
      >
        <FormField name="farbe" label="Farbe" helperText="Hex oder Name">
          {({ field, fieldState }) => (
            <input aria-label="farbe" data-invalid={fieldState.invalid} value={String(field.value)} onChange={() => {}} />
          )}
        </FormField>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText('muss mit # beginnen')).toBeInTheDocument();
    expect(screen.queryByText('Hex oder Name')).not.toBeInTheDocument();
    expect(screen.getByLabelText('farbe')).toHaveAttribute('data-invalid', 'true');
  });

  it('binds its label to the control by htmlFor', () => {
    render(
      <Form defaultValues={{ farbe: '' }} onSubmit={vi.fn()}>
        <FormField name="farbe" label="Farbe">
          {({ field, id }) => <input id={id} value={String(field.value)} onChange={() => {}} />}
        </FormField>
      </Form>,
    );
    expect(screen.getByLabelText('Farbe')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd packages/ui && pnpm test src/components/FormField/`
Expected: FAIL — cannot resolve `./FormField`.

- [ ] **Step 3: Write the types**

Create `packages/ui/src/components/FormField/types.ts`:

```ts
import type * as React from 'react';
import type {
  ControllerRenderProps,
  ControllerFieldState,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

export interface FormFieldRenderArgs<T extends FieldValues, N extends FieldPath<T>> {
  field: ControllerRenderProps<T, N>;
  fieldState: ControllerFieldState;
  /** Put this on the control so the rendered FormLabel actually labels it. */
  id: string;
}

export interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  name: N;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the field's own error state. */
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  children: (args: FormFieldRenderArgs<T, N>) => React.ReactNode;
}
```

- [ ] **Step 4: Write the component**

Create `packages/ui/src/components/FormField/FormField.tsx`:

```tsx
'use client';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { FieldShell, useFieldIds } from '../../internal/form';
import type { FormFieldProps } from './types';

/**
 * The render-prop route for controls the nine bound fields do not cover —
 * a custom picker, a DataGrid cell, a third-party widget. It brings the same
 * FormControl/FormLabel/FormHelperText shell those fields use.
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  name,
  label,
  helperText,
  error,
  required,
  disabled,
  id: idProp,
  children,
}: FormFieldProps<T, N>): React.ReactElement {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController<T, N>({ name, control });
  const errorMessage = fieldState.error?.message;
  const shownHelper = errorMessage ?? helperText;
  const { id, helperId } = useFieldIds(idProp, shownHelper != null);

  return (
    <FieldShell
      label={label}
      helperText={shownHelper}
      error={error || errorMessage != null}
      required={required}
      disabled={disabled}
      id={id}
      helperId={helperId}
    >
      {children({ field, fieldState, id })}
    </FieldShell>
  );
}
```

Create `packages/ui/src/components/FormField/index.ts`:

```ts
export { FormField } from './FormField';
export type { FormFieldProps, FormFieldRenderArgs } from './types';
```

- [ ] **Step 5: Run to confirm they pass**

Run: `cd packages/ui && pnpm test src/components/FormField/`
Expected: PASS, all three.

- [ ] **Step 6: Write the visual test**

Create `packages/ui/src/visual/FormField.visual.test.tsx`. Joy has no `FormField`, so the reference is the hand-composed Joy stack that `FormField` renders — follow `Input.visual.test.tsx`'s structure:

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  CssVarsProvider as JoyCssVarsProvider,
  FormControl as JoyFormControl,
  FormLabel as JoyFormLabel,
  FormHelperText as JoyFormHelperText,
  Input as JoyInput,
} from '@mui/joy';
import { useForm } from 'react-hook-form';
import { Form } from '../components/Form';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { settleTransitions } from './helpers';

// FormField has no variant/color axis of its own — it composes. So the states
// it actually has are the ones tested: resting, with helper text, in error,
// disabled, required.
const STATES = [
  { key: 'resting', label: 'E-Mail', helperText: undefined, error: false, disabled: false, required: false },
  { key: 'helper', label: 'E-Mail', helperText: 'wird nicht veröffentlicht', error: false, disabled: false, required: false },
  { key: 'error', label: 'E-Mail', helperText: 'keine E-Mail', error: true, disabled: false, required: false },
  { key: 'disabled', label: 'E-Mail', helperText: undefined, error: false, disabled: true, required: false },
  { key: 'required', label: 'E-Mail', helperText: undefined, error: false, disabled: false, required: true },
] as const;

describe('FormField visual parity with a hand-composed Joy stack', () => {
  for (const state of STATES) {
    it(`${state.key} matches Joy UI's computed styles`, async () => {
      const { container: joyContainer } = render(
        <div data-testid={`joy-${state.key}`} style={{ width: 320 }}>
          <JoyCssVarsProvider>
            <JoyFormControl error={state.error} disabled={state.disabled} required={state.required}>
              <JoyFormLabel>{state.label}</JoyFormLabel>
              <JoyInput placeholder="a@b.de" />
              {state.helperText && <JoyFormHelperText>{state.helperText}</JoyFormHelperText>}
            </JoyFormControl>
          </JoyCssVarsProvider>
        </div>,
      );

      const { container: hintoricContainer } = render(
        <div data-testid={`hintoric-${state.key}`} style={{ width: 320 }}>
          <ColorSchemeProvider>
            <Form defaultValues={{ email: '' }} onSubmit={() => {}}>
              <Input
                name="email"
                label={state.label}
                helperText={state.helperText}
                error={state.error}
                disabled={state.disabled}
                required={state.required}
                placeholder="a@b.de"
              />
            </Form>
          </ColorSchemeProvider>
        </div>,
      );
      await settleTransitions();

      const joyRoot = joyContainer.querySelector('[data-testid] > *')! as HTMLElement;
      const hintoricRoot = hintoricContainer.querySelector('form > *')! as HTMLElement;
      const joyStyle = getComputedStyle(joyRoot);
      const hintoricStyle = getComputedStyle(hintoricRoot);

      expect(hintoricStyle.display).toBe(joyStyle.display);
      expect(hintoricStyle.flexDirection).toBe(joyStyle.flexDirection);
      expect(hintoricStyle.rowGap).toBe(joyStyle.rowGap);

      const joyLabel = joyContainer.querySelector('label')!;
      const hintoricLabel = hintoricContainer.querySelector('label')!;
      expect(getComputedStyle(hintoricLabel).color).toBe(getComputedStyle(joyLabel).color);
      expect(getComputedStyle(hintoricLabel).fontSize).toBe(getComputedStyle(joyLabel).fontSize);
      expect(getComputedStyle(hintoricLabel).fontWeight).toBe(getComputedStyle(joyLabel).fontWeight);

      const joyInputWrapper = joyContainer.querySelector('input')!.parentElement as HTMLElement;
      const hintoricInputWrapper = hintoricContainer.querySelector('input')!.parentElement as HTMLElement;
      expect(getComputedStyle(hintoricInputWrapper).borderColor).toBe(
        getComputedStyle(joyInputWrapper).borderColor,
      );

      await expect(page.getByTestId(`joy-${state.key}`)).toMatchScreenshot(`formfield-${state.key}-joy`);
      await expect(page.getByTestId(`hintoric-${state.key}`)).toMatchScreenshot(
        `formfield-${state.key}-hintoric`,
      );
    });
  }
});
```

Note the deliberate asymmetry: the Hintoric side goes through `Input`'s own shell rather than `FormField`, because that is the composition consumers will actually see. Add a second, smaller `describe` doing the same for `FormField` with a plain `<input>` child, so the escape hatch is covered too. `useForm` is imported for that second block.

- [ ] **Step 7: Run twice and look at the screenshots**

Run: `cd packages/ui && pnpm test:visual src/visual/FormField.visual.test.tsx`
Expected: first run FAILS (no baselines); rerun to PASS. Open all ten PNGs — this is the composition consumers see most, so it is worth actually looking at each.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/FormField packages/ui/src/visual/FormField.visual.test.tsx packages/ui/src/visual/__screenshots__/FormField.visual.test.tsx
git commit -m "Add <FormField>, the render-prop route for custom controls

Joy has no FormField, so the visual baseline compares against the Joy stack
our shell composes by hand — FormControl, FormLabel, the field, FormHelperText
— across resting, helper, error, disabled and required."
```

---

### Task 12: Exports, docs page, changeset and the full-suite gate

**Files:**
- Modify: `packages/ui/src/index.ts`
- Create: `apps/docs/src/pages/FormsPage.tsx`
- Modify: `apps/docs/src/nav.ts`, `apps/docs/src/App.tsx`
- Create: `.changeset/react-hook-form-fields.md`

**Interfaces:**
- Consumes: everything from Tasks 3–11.
- Produces: `Form`, `FormField` and their types on the public API; a docs page at the route the nav entry names.

- [ ] **Step 1: Add the exports**

In `packages/ui/src/index.ts`, next to the existing `FormControl`/`FormHelperText` block (around line 93):

```ts
export { Form } from './components/Form';
export type { FormProps, OwnedFormProps, ProvidedFormProps } from './components/Form';

export { FormField } from './components/FormField';
export type { FormFieldProps, FormFieldRenderArgs } from './components/FormField';
```

Do **not** re-export `zodResolver`: a consumer building their own `useForm` imports it from `@hookform/resolvers/zod` themselves, rather than having this package duplicate third-party API surface and carry its versioning.

- [ ] **Step 2: Typecheck and build**

Run from the repo root: `pnpm typecheck`
Expected: PASS — this builds `dist/` first, so it also proves the new exports emit types.

- [ ] **Step 3: Verify no RHF copy was bundled**

```bash
cd packages/ui
pnpm build
grep -c "useFormContext" dist/index.js || echo "0 occurrences — RHF is external, as intended"
grep -n "from \"react-hook-form\"" dist/index.js | head -3
```

Expected: `react-hook-form` appears only as an *import specifier*, never as inlined implementation. If `grep -c "useFormContext"` returns a large number, the external entry from Task 1 Step 2 is not taking effect — fix it before continuing, since this is the silent failure the peer-dependency choice exists to avoid.

- [ ] **Step 4: Write the docs page**

Create `apps/docs/src/pages/FormsPage.tsx`, following the structure of a sibling page (read `apps/docs/src/pages/ConfirmationDialogPage.tsx` first for the house layout). It must contain, as working code:

1. A complete form using all nine field types with a zod schema, `<Form schema defaultValues onSubmit>`, and a submit button reading `formState.isSubmitting` from the render prop.
2. The `form={useForm(...)}` variant, with `zodResolver` imported by the consumer.
3. A `<FormField>` example wrapping a plain `<input type="color">`.
4. A `register()` example, noted as the low-level route.

- [ ] **Step 5: Wire the nav and route**

Add the entry to `apps/docs/src/nav.ts` and the route to `apps/docs/src/App.tsx`, matching the surrounding entries exactly.

- [ ] **Step 6: Run the docs app and check it in the browser**

Start the dev server for `apps/docs` and open the Forms page. Confirm: submitting with invalid values shows red helper text under the offending fields and does not call `onSubmit`; fixing them and resubmitting does. Take a screenshot of the error state.

- [ ] **Step 7: Write the changeset**

Create `.changeset/react-hook-form-fields.md`:

```markdown
---
'@hintoric/ui': minor
---

Every field component now binds itself to react-hook-form. Put a `name` on a field inside the new
`<Form>` and it reads its value, writes changes back, shows its validation message as helper text and
marks itself invalid for assistive technology — no `Controller` and no `control` prop. `<Form>` either
builds the form itself from a zod `schema` and `defaultValues`, or takes a `useForm()` instance you
built yourself. `<FormField>` covers controls outside this set via a render prop.

Fields gain `label`, `helperText` and `error` props, and wrap themselves in a `FormControl` with a
`FormLabel` and `FormHelperText` when you use them. A field with none of them renders exactly the
markup it did before, so existing layouts are untouched. Outside a `<Form>`, every field behaves
exactly as it did — a `name` alone changes nothing.

`react-hook-form` and `zod` are new peer dependencies.

Fixed: `Input`'s `onChange` handed out a hand-built stand-in event carrying only `target.value`, which
meant `react-hook-form`'s `register()` could never resolve the field and silently recorded nothing.
It now receives the real `ChangeEvent`. Code reading `event.target.value` is unaffected.

Fixed: `FormHelperText` ignored its `FormControl`'s error state and always rendered in the muted
tertiary colour, so an error message looked like an ordinary hint.
```

- [ ] **Step 8: Run everything and commit**

```bash
cd /Users/johanneswaigel/git/hintoric/ui
pnpm --filter @hintoric/ui test
pnpm --filter @hintoric/ui test:visual
pnpm typecheck
pnpm lint
```

Expected: all four PASS. Only then:

```bash
git add packages/ui/src/index.ts apps/docs/src/pages/FormsPage.tsx apps/docs/src/nav.ts apps/docs/src/App.tsx .changeset/react-hook-form-fields.md
git commit -m "Export Form and FormField, document them, add the changeset

Also verifies the build actually treats react-hook-form as external: a
bundled copy would give consumers a second module instance and a
useFormContext() that returns null, which takes behaviour away without
throwing anything."
```

---

## Notes for the executor

- **Tasks 6 through 11 all follow Task 6's four-part shape** (`XBase` / `XField` / `BoundX` / `X`). Read Task 6 before starting any of them, even out of order.
- **Task 6b builds the two helpers that Tasks 7 to 10 depend on.** It sits after Task 6 on purpose: the helpers must first reproduce Input's hand-written tests exactly, or eight fields would inherit a helper nobody checked. Do not reorder it before Task 6.
- **`runFieldMatrix` covers the spec's six required checks per field.** Point 6 — unchanged behaviour outside a `<Form>` — is the one that actually guards the promise this change is additive. If it fails, the branch condition is wrong, not the test.
- **Task 5 deliberately ends with three failing tests.** They assert `Input` reads `FormControlContext`, which Task 6 provides. Do not weaken them to get a green commit.
- **When a Joy component turns out to have no `error` prop** (likely for `Checkbox`, `Switch`, `Radio`, `RadioGroup`, `Slider`), the reference becomes Joy's `color="danger"` in the same variant. Record which components fell into which case as a spec addendum, the way `2026-09-07-confirmation-dialog-design.md` records its implementation findings. Never invent a colour value — `CLAUDE.md` is explicit that every token was measured against the real package.
- **First run of any new visual assertion fails on purpose** ("no existing reference screenshot found"). Rerun once, then open the PNG and look at it before committing it.
