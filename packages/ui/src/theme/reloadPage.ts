/**
 * A module of its own so tests can replace it: jsdom does not let
 * `location.reload` be stubbed.
 */
export function reloadPage(): void {
  window.location.reload();
}
