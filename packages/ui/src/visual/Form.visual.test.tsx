import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { z } from 'zod';
import { Form } from '../components/Form';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// Form is exempt from this suite's "compare against real @mui/joy" rule for
// the same reason Dropdown is: it renders a bare <form> with no class of its
// own and Joy has no counterpart. There is nothing to compare and nothing to
// photograph — a self-baseline screenshot of an unstyled form is a blank
// rectangle, which is why this file takes none.
//
// What it can get wrong is its actual job: providing the form context,
// forwarding attributes to the element, and staying invisible. Those are
// checked in both schemes, because a wrapper that quietly painted something
// would break every layout built on it — and would only show on one page.

const schema = z.object({ name: z.string().min(1, 'Required') });

describe('Form visual (renders no styling of its own)', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`adds no box of its own in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <Form schema={schema} onSubmit={() => {}} data-testid="form">
            <FormField name="name" label="Name">
              {({ field, id }) => (
                <Input id={id} value={String(field.value ?? '')} onChange={field.onChange} />
              )}
            </FormField>
          </Form>
        </ColorSchemeProvider>,
      );

      const el = screen.getByTestId('form');
      const style = getComputedStyle(el);

      expect(el.tagName).toBe('FORM');
      expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(style.borderTopWidth).toBe('0px');
      expect(style.padding).toBe('0px');
      expect(style.margin).toBe('0px');
    });

    /**
     * A `<form>` inherits its text colour, so it must not fix one — a fixed
     * colour here would override every field's own scheme-aware ink.
     */
    it(`lets its children keep their own scheme colours in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <Form schema={schema} onSubmit={() => {}} data-testid="form-colour">
            <FormField name="name" label="Name">
              {({ field, id }) => (
                <Input id={id} value={String(field.value ?? '')} onChange={field.onChange} />
              )}
            </FormField>
          </Form>
        </ColorSchemeProvider>,
      );

      const label = screen.getByText('Name');
      expect(getComputedStyle(label).color).not.toBe('rgba(0, 0, 0, 0)');
    });

    /**
     * Attribute forwarding is the half a consumer notices immediately if it
     * breaks — `noValidate` in particular, since without it the browser's own
     * validation bubbles fight the schema's messages.
     */
    it(`forwards form attributes to the element in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <Form
            schema={schema}
            onSubmit={() => {}}
            data-testid="form-attrs"
            noValidate
            className="ring-2"
            aria-label="Profile"
          >
            <FormField name="name" label="Name">
              {({ field, id }) => (
                <Input id={id} value={String(field.value ?? '')} onChange={field.onChange} />
              )}
            </FormField>
          </Form>
        </ColorSchemeProvider>,
      );

      const el = screen.getByTestId('form-attrs');
      expect(el.hasAttribute('novalidate')).toBe(true);
      expect(el.className).toContain('ring-2');
      expect(el.getAttribute('aria-label')).toBe('Profile');
    });
  }
});
