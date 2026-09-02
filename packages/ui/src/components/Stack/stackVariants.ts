import { cva } from 'class-variance-authority';

export type StackSpacingKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8';

export const stackVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    spacing: {
      '0': 'gap-0',
      '1': 'gap-2',
      '2': 'gap-4',
      '3': 'gap-6',
      '4': 'gap-8',
      '5': 'gap-10',
      '6': 'gap-12',
      '8': 'gap-16',
    } satisfies Record<StackSpacingKey, string>,
  },
  defaultVariants: { direction: 'column', spacing: '0' },
});
