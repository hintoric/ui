import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleSwitcher } from './LocaleSwitcher';

const locales = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

describe('LocaleSwitcher', () => {
  it('shows the label of the current locale, not its value', () => {
    render(<LocaleSwitcher locales={locales} value="de" onChange={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveTextContent('Deutsch');
    expect(screen.getByRole('button')).not.toHaveTextContent('de');
  });

  it('lists every locale once opened', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher locales={locales} value="de" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('English')).toBeInTheDocument();
  });

  it('hands the value to onChange, not the label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LocaleSwitcher locales={locales} value="de" onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('English'));

    expect(onChange).toHaveBeenCalledWith('en');
  });

  it('marks the current locale as selected', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher locales={locales} value="en" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button'));

    // MenuItem's `selected` shows up as the active background, the same class
    // the primitive's own tests assert on.
    const item = await screen.findByText('English');
    expect(item.className).toContain('active');
  });

  /**
   * The browser can report a language the application does not offer. Showing
   * the raw value beats rendering an empty button.
   */
  it('falls back to the raw value when it is not among the locales', () => {
    render(<LocaleSwitcher locales={locales} value="fr" onChange={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveTextContent('fr');
  });
});
