import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GRADES, GRADE_COLORS, type Grade } from '@/lib/grades';

type Props = {
  value: Grade | null;
  onChange: (grade: Grade | null) => void;
};

export function RankPicker({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value ?? undefined}
      onValueChange={(v) => onChange(v ? (v as Grade) : null)}
      className="gap-0.5"
    >
      {GRADES.map((g) => (
        <ToggleGroupItem
          key={g}
          value={g}
          className="h-7 w-7 text-xs font-bold data-[state=on]:text-white"
          style={value === g ? { backgroundColor: GRADE_COLORS[g] } : undefined}
        >
          {g}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
