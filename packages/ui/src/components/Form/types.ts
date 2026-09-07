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
  // `onInvalid` is omitted from the native form props on purpose: a <form>
  // has its own onInvalid DOM event (constraint-validation failure of a
  // control), and ours means "handleSubmit rejected". Keeping both is not
  // possible, and react-hook-form users already know this name from
  // handleSubmit(onValid, onInvalid) — so the DOM one is the one that gives
  // way. Reach it with a ref if you ever need it.
  extends Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onInvalid' | 'children'> {
  /** Receives the validated values, not the submit event. */
  onSubmit: (values: T, form: UseFormReturn<T>) => void | Promise<void>;
  /** Called instead of `onSubmit` when validation rejects the submission. */
  onInvalid?: (errors: FieldErrors<T>) => void;
  /**
   * A function child receives the form instance — the way to reach
   * `formState.isSubmitting` when <Form> owns the instance itself.
   */
  children: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode);
}

/** <Form> owns the instance: pass a schema and defaults. */
export interface OwnedFormProps<T extends FieldValues> extends FormBaseProps<T> {
  // ZodType<T, T> rather than ZodType<T>: zodResolver's zod-4 overload
  // requires the schema's INPUT type to extend FieldValues, and ZodType<T>
  // leaves the input as `unknown`.
  schema?: ZodType<T, T>;
  defaultValues?: DefaultValues<T>;
  mode?: UseFormProps<T>['mode'];
  form?: never;
}

/**
 * The consumer owns the instance. `schema` is deliberately unavailable here so
 * that there is never a second source for the resolver: given both, the
 * library would have to pick a winner and either answer surprises half its
 * callers. (It is not that attaching one is impossible — see the spec's
 * addendum on `control._options` — it is that the question should not arise.)
 */
export interface ProvidedFormProps<T extends FieldValues> extends FormBaseProps<T> {
  form: UseFormReturn<T>;
  schema?: never;
  defaultValues?: never;
  mode?: never;
}

export type FormProps<T extends FieldValues> = OwnedFormProps<T> | ProvidedFormProps<T>;
