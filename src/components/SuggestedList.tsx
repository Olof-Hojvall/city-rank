import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useStore } from '@/state/store';
import { RankPicker } from './RankPicker';
import type { City } from '@/data/cities';
import type { Grade } from '@/lib/grades';

type SortKey = 'pop' | 'name';

type Props = {
  onFlyTo: (cityId: number) => void;
};

export function SuggestedList({ onFlyTo }: Props) {
  const { viewportCities, rankings, setRanking, setSelectedCity, selectedCityId } = useStore();
  const [sort, setSort] = useState<SortKey>('pop');

  const sorted = [...viewportCities].sort((a, b) =>
    sort === 'pop' ? b.pop - a.pop : a.name.localeCompare(b.name),
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Suggested ({viewportCities.length})
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={sort}
          onValueChange={(v) => v && setSort(v as SortKey)}
        >
          <ToggleGroupItem value="pop" className="h-6 px-2 text-xs">Pop</ToggleGroupItem>
          <ToggleGroupItem value="name" className="h-6 px-2 text-xs">A–Z</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 space-y-0.5">
          {sorted.map((city) => (
            <div
              key={city.id}
              className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors ${
                selectedCityId === city.id ? 'bg-accent' : ''
              }`}
              onClick={() => {
                setSelectedCity(city.id);
                onFlyTo(city.id);
              }}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{city.name}</span>
                <span className="text-xs text-muted-foreground ml-1">{city.country}</span>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <RankPicker
                  value={rankings[city.id] ?? null}
                  onChange={(g: Grade | null) => setRanking(city.id, g)}
                />
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-8 text-center">
              No cities in this view
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
