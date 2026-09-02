import type * as React from 'react';
import type { JoyColor, JoyVariant } from '@hintoric/ui';

export interface VariantColorGridProps {
  variants: readonly JoyVariant[];
  colors: readonly JoyColor[];
  renderCell: (variant: JoyVariant, color: JoyColor) => React.ReactNode;
}

export function VariantColorGrid({ variants, colors, renderCell }: VariantColorGridProps) {
  return (
    <table className="docs-grid-table">
      <thead>
        <tr>
          <th />
          {colors.map((color) => (
            <th key={color}>{color}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {variants.map((variant) => (
          <tr key={variant}>
            <th scope="row">{variant}</th>
            {colors.map((color) => (
              <td key={color}>{renderCell(variant, color)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
