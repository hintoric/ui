import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders the trigger element', () => {
    render(
      <Tooltip title="Save">
        <button>Save</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows the tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip title="Saves your changes">
        <button>Save</button>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Saves your changes')).toBeInTheDocument());
  });

  it('does not render a popup when title is empty', () => {
    render(
      <Tooltip title="">
        <button>Save</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
