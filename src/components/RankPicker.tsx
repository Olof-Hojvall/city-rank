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
      variant="outline"
      spacing={0}
      value={value ?? undefined}
      onValueChange={(v) => onChange(v ? (v as Grade) : null)}
      className="shrink-0"
    >
      {GRADES.map((g) => (
        <ToggleGroupItem
          key={g}
          value={g}
          className="h-6 w-6 !min-w-0 text-xs font-bold !px-0 data-[state=on]:text-white data-[state=on]:border-transparent"
          style={value === g ? { backgroundColor: GRADE_COLORS[g] } : undefined}
        >
          {g}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
