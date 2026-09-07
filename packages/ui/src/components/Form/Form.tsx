'use client';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, Resolver, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormProps } from './types';

// useForm runs unconditionally and its result is discarded when `form` was
// passed in. The obvious alternative — two inner components picked by which
// prop is present — remounts the whole subtree if a consumer ever switches
// between the two, taking the entered values with it: silent, rare, and hard
// to trace. An unused useForm object costs nothing by comparison.
//
// `schema` and `form` are mutually exclusive so that there is never a second
// source for the resolver. Note it is NOT impossible to attach one to a
// foreign instance — control._options' setter merges rather than replaces, so
// it would survive — but that is a private field whose merge semantics any
// minor release may change. See the spec's addendum.
function FormComponent<T extends FieldValues>(
  {
    onSubmit,
    onInvalid,
    children,
    schema,
    defaultValues,
    mode,
    form: formProp,
    ...formAttrs
  }: FormProps<T>,
  ref: React.Ref<HTMLFormElement>,
) {
  const resolver = React.useMemo(
    () => (schema ? (zodResolver(schema) as Resolver<T>) : undefined),
    [schema],
  );
  const ownForm = useForm<T>({ defaultValues, mode, resolver });
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
