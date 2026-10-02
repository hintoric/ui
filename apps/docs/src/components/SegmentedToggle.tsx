import { Button, ToggleButtonGroup } from '@hintoric/ui';

export interface SegmentedToggleProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  'aria-label': string;
}

/**
 * Exactly one of a few options, as a ToggleButtonGroup. The group itself is
 * multi-select (its value is an array), so this keeps the newly pressed value
 * and ignores a click on the one already selected — there is always a choice.
 */
export function SegmentedToggle<T extends string>({ value, options, onChange, ...props }: SegmentedToggleProps<T>) {
  return (
    <ToggleButtonGroup
      aria-label={props['aria-label']}
      value={[value]}
      onChange={(_event, next) => {
        const picked = next.find((v) => v !== value) as T | undefined;
        if (picked) onChange(picked);
      }}
    >
      {options.map((option) => (
        <Button key={option.value} value={option.value} size="sm" variant="outlined" color="neutral">
          {option.label}
        </Button>
      ))}
    </ToggleButtonGroup>
  );
}
