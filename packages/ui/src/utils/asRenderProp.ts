import * as React from 'react';

export function asRenderProp(
  component: React.ElementType | undefined,
): React.ReactElement | undefined {
  if (!component) {
    return undefined;
  }
  return React.createElement(component);
}
