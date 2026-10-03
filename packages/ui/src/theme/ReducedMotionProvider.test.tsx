import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ReducedMotionProvider, useReducedMotion } from './ReducedMotionProvider';
import { matchMediaState } from '../test/setup';

function Consumer() {
  return <span data-testid="reduced">{String(useReducedMotion())}</span>;
}

describe('ReducedMotionProvider', () => {
  it('uses the provided app preference when present', () => {
    matchMediaState.matches = false;

    render(
      <ReducedMotionProvider reducedMotion>
        <Consumer />
      </ReducedMotionProvider>,
    );

    expect(screen.getByTestId('reduced')).toHaveTextContent('true');
  });

  it('lets the app-provided false override a reduced system preference', () => {
    matchMediaState.matches = true;

    render(
      <ReducedMotionProvider reducedMotion={false}>
        <Consumer />
      </ReducedMotionProvider>,
    );

    expect(screen.getByTestId('reduced')).toHaveTextContent('false');
  });

  it('falls back to prefers-reduced-motion without a provider', async () => {
    render(<Consumer />);

    expect(screen.getByTestId('reduced')).toHaveTextContent('false');

    await act(async () => {
      matchMediaState.matches = true;
      for (const listener of matchMediaState.listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(screen.getByTestId('reduced')).toHaveTextContent('true');
  });
});
