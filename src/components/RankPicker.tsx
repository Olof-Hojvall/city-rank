import { useRef, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { GRADES, GRADE_COLORS, type Grade } from '@/lib/grades';

type Props = {
  value: Grade | null;
  onChange: (grade: Grade | null) => void;
};

export function RankPicker({ value, onChange }: Props) {
  const [confirming, setConfirming] = useState(false);
  // onClick fires before onValueChange on the same click; use a ref to
  // swallow the Radix deselection event while confirmation is pending.
  const interceptNext = useRef(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">Remove?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-6 px-2 text-xs"
          onClick={() => { setConfirming(false); onChange(null); }}
        >
          Yes
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
          onClick={() => setConfirming(false)}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={0}
      value={value ?? undefined}
      onValueChange={(v) => {
        if (!v && interceptNext.current) {
          interceptNext.current = false;
          return;
        }
        onChange(v ? (v as Grade) : null);
      }}
      className="shrink-0"
    >
      {GRADES.map((g) => (
        <ToggleGroupItem
          key={g}
          value={g}
          className="h-6 w-6 !min-w-0 text-xs font-bold !px-0 data-[state=on]:text-white data-[state=on]:border-transparent"
          style={value === g ? { backgroundColor: GRADE_COLORS[g] } : undefined}
          onClick={() => {
            if (value === g) {
              interceptNext.current = true;
              setConfirming(true);
            }
          }}
        >
          {g}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
