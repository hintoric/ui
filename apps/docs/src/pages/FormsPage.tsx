import { z } from 'zod';
import {
  Autocomplete,
  Button,
  Checkbox,
  Form,
  FormField,
  Input,
  Option,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Textarea,
} from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const CITIES = ['Berlin', 'Hamburg', 'München', 'Köln'];

const profileSchema = z.object({
  email: z.string().email('Bitte eine gültige E-Mail angeben'),
  bio: z.string().min(10, 'Mindestens 10 Zeichen'),
  role: z.enum(['admin', 'editor', 'reader'], { message: 'Bitte eine Rolle wählen' }),
  city: z.enum(['Berlin', 'Hamburg', 'München', 'Köln'], { message: 'Bitte eine Stadt wählen' }),
  plan: z.enum(['free', 'pro'], { message: 'Bitte einen Tarif wählen' }),
  seats: z.number().min(5, 'Mindestens 5 Plätze'),
  newsletter: z.boolean(),
  notifications: z.boolean(),
  // A refine, not z.literal(true): a literal would type the field as `true`,
  // and then `false` — what an unticked box actually holds — could not even be
  // a default value.
  terms: z.boolean().refine((accepted) => accepted, {
    message: 'Zustimmung erforderlich',
  }),
});

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function FormsPage() {
  return (
    <>
      <h1>Forms</h1>
      <p className="docs-lede">
        Every field binds itself to react-hook-form when it carries a <code>name</code> inside a{' '}
        <code>Form</code>. Outside one, it behaves exactly as it always did.
      </p>

      <h2>The whole thing at once</h2>
      <p>
        No <code>Controller</code>, no <code>control</code> prop, no error message wired up by
        hand. Submit it empty to see every field report itself.
      </p>
      <Demo>
        <Form
          schema={profileSchema}
          defaultValues={{
            email: '',
            bio: '',
            seats: 3,
            newsletter: false,
            notifications: true,
            terms: false,
          }}
          onSubmit={async (values) => {
            await wait(600);
            window.alert(JSON.stringify(values, null, 2));
          }}
        >
          {({ formState }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
              <Input name="email" label="E-Mail" placeholder="a@b.de" />
              <Textarea name="bio" label="Über mich" rows={3} helperText="Mindestens 10 Zeichen" />
              <Select name="role" label="Rolle" placeholder="—">
                <Option value="admin">Admin</Option>
                <Option value="editor">Editor</Option>
                <Option value="reader">Leser</Option>
              </Select>
              <Autocomplete name="city" label="Stadt" options={CITIES} placeholder="Suchen…" />
              <RadioGroup name="plan" label="Tarif" orientation="horizontal">
                <Radio value="free" label="Free" />
                <Radio value="pro" label="Pro" />
              </RadioGroup>
              <Slider name="seats" label="Plätze" min={1} max={20} helperText="Mindestens 5" />
              <Switch name="notifications" label="Benachrichtigungen" />
              <Checkbox name="newsletter" label="Newsletter abonnieren" />
              <Checkbox name="terms" label="Ich akzeptiere die AGB" />
              <Button type="submit" loading={formState.isSubmitting}>
                Speichern
              </Button>
            </div>
          )}
        </Form>
      </Demo>
      <Code>{`const profileSchema = z.object({
  email: z.string().email('Bitte eine gültige E-Mail angeben'),
  role: z.enum(['admin', 'editor', 'reader'], { message: 'Bitte eine Rolle wählen' }),
  // Not z.literal(true): that types the field as \`true\`, so \`false\` — what an
  // unticked box holds — could not even be its default.
  terms: z.boolean().refine((accepted) => accepted, {
    message: 'Zustimmung erforderlich',
  }),
})

<Form schema={profileSchema} defaultValues={{ email: '', terms: false }} onSubmit={save}>
  {({ formState }) => (
    <>
      <Input name="email" label="E-Mail" />
      <Select name="role" label="Rolle">…</Select>
      <Checkbox name="terms" label="Ich akzeptiere die AGB" />
      <Button type="submit" loading={formState.isSubmitting}>Speichern</Button>
    </>
  )}
</Form>`}</Code>

      <h2>Who owns the form</h2>
      <p>
        Pass <code>schema</code> and <code>defaultValues</code> and <code>Form</code> builds the{' '}
        <code>useForm</code> instance itself. Need the instance outside the form&rsquo;s subtree —
        for <code>watch</code>, <code>setValue</code> or a reset button elsewhere on the page —
        build it yourself and pass it as <code>form</code>.
      </p>
      <p>
        The two are mutually exclusive, and that is deliberate rather than a limitation: with both,
        the library would have to pick which resolver wins, and either answer surprises half its
        callers. Bring your own instance, bring your own resolver.
      </p>
      <Code>{`const form = useForm({
  resolver: zodResolver(profileSchema),
  defaultValues: { email: '' },
})

// form.watch('email') works out here
<Form form={form} onSubmit={save}>
  <Input name="email" label="E-Mail" />
</Form>`}</Code>

      <h2>A control this library does not have</h2>
      <p>
        <code>FormField</code> is the render-prop route for anything the nine bound fields do not
        cover. It brings the same label, helper text and error handling, so a custom control sits in
        a form looking like everything around it.
      </p>
      <Demo>
        <Form
          schema={z.object({ colour: z.string().startsWith('#', 'Muss mit # beginnen') })}
          defaultValues={{ colour: '#0b6bcb' }}
          onSubmit={(values) => {
            window.alert(JSON.stringify(values));
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
            <FormField name="colour" label="Farbe" helperText="Hex, mit # davor">
              {({ field, id, describedBy }) => (
                <input
                  type="color"
                  id={id}
                  aria-describedby={describedBy}
                  value={String(field.value)}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  style={{ width: 64, height: 36 }}
                />
              )}
            </FormField>
            <Button type="submit">Speichern</Button>
          </div>
        </Form>
      </Demo>
      <Code>{`<FormField name="colour" label="Farbe" helperText="Hex, mit # davor">
  {({ field, id, describedBy }) => (
    <input
      type="color"
      id={id}
      aria-describedby={describedBy}
      value={field.value}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
    />
  )}
</FormField>`}</Code>

      <h2>The low-level route</h2>
      <p>
        <code>register</code> still works and always will — the binding above is built on top of it,
        not instead of it. Reach for it when you want react-hook-form&rsquo;s uncontrolled path and
        do not need the label, helper text or error wiring.
      </p>
      <Code>{`const { register, handleSubmit } = useForm({ defaultValues: { email: '' } })

<form onSubmit={handleSubmit(save)}>
  <Input {...register('email')} />
</form>`}</Code>

      <h2>Form props</h2>
      <PropsTable
        rows={[
          {
            name: 'onSubmit',
            type: '(values, form) => void | Promise<void>',
            description:
              'Receives the validated values, not the submit event. Only called when validation passes.',
          },
          {
            name: 'onInvalid',
            type: '(errors) => void',
            description:
              "Called instead of onSubmit when validation rejects. Shadows the form element's own onInvalid DOM event.",
          },
          {
            name: 'schema',
            type: 'ZodType',
            description: 'Form builds its own useForm with this resolver. Not allowed with form.',
          },
          {
            name: 'defaultValues',
            type: 'DefaultValues<T>',
            description: 'Passed to the internally created useForm. Not allowed with form.',
          },
          {
            name: 'mode',
            type: "'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'",
            description: 'When validation runs. Not allowed with form.',
          },
          {
            name: 'form',
            type: 'UseFormReturn<T>',
            description:
              'Your own useForm instance, resolver included. Not allowed with schema, defaultValues or mode.',
          },
          {
            name: 'children',
            type: 'ReactNode | (form) => ReactNode',
            description:
              'A function child receives the instance — the way to reach formState.isSubmitting when Form is the owner.',
          },
        ]}
      />

      <h2>What every field gains</h2>
      <PropsTable
        rows={[
          {
            name: 'name',
            type: 'string',
            description:
              'The form path. Inside a Form it binds the field; outside one it is just the native name attribute.',
          },
          {
            name: 'label',
            type: 'ReactNode',
            description:
              'Renders a FormLabel. Omit it, and no wrapper element is added at all — the markup stays what it was.',
          },
          {
            name: 'helperText',
            type: 'ReactNode',
            description:
              'Renders a FormHelperText. A validation message replaces it while one is pending, and it comes back afterwards.',
          },
          {
            name: 'error',
            type: 'boolean',
            description:
              "Forces the error look, OR-ed with the bound field's own state — for a server-side error the schema knows nothing about.",
          },
        ]}
      />

      <h2>Known limits</h2>
      <ul>
        <li>
          <strong>Slider and focus-on-error.</strong> react-hook-form&rsquo;s{' '}
          <code>setFocus</code> and its jump to the first invalid field need the focusable node, and
          Base UI&rsquo;s Slider exposes its control wrapper. A Slider will not receive that focus.
        </li>
        <li>
          <strong>Slider looks the same when invalid.</strong> Joy UI&rsquo;s Slider reads no
          form-control state at all, so an invalid slider is not recoloured here either. The error
          shows in the helper text and in <code>aria-invalid</code>.
        </li>
        <li>
          <strong>A Radio inside a RadioGroup does not bind on its own.</strong> The group owns the
          path; a <code>name</code> on the individual Radio is ignored.
        </li>
      </ul>
    </>
  );
}
