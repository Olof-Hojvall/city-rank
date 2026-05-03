import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/state/store';
import { GRADES, GRADE_COLORS, type Grade } from '@/lib/grades';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { City } from '@/data/cities';

type SortKey = 'grade' | 'name' | 'pop';

type Props = {
  cities: City[];
  onFlyTo: (cityId: number) => void;
};

function formatPop(pop: number): string {
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)}K`;
  return String(pop);
}

export function RankingsList({ cities, onFlyTo }: Props) {
  const { rankings, setRanking, setSelectedCity, selectedCityId } = useStore();
  const [sort, setSort] = useState<SortKey>('grade');
  const cityMap = new Map(cities.map((c) => [c.id, c]));

  const total = Object.keys(rankings).length;

  type RankedEntry = { id: number; grade: Grade; city: City };
  const entries: RankedEntry[] = Object.entries(rankings)
    .map(([idStr, grade]) => {
      const city = cityMap.get(Number(idStr));
      return city ? { id: Number(idStr), grade, city } : null;
    })
    .filter((e): e is RankedEntry => e !== null);

  const gradeOrder = Object.fromEntries(GRADES.map((g, i) => [g, i]));

  const sorted = [...entries].sort((a, b) => {
    if (sort === 'grade') return gradeOrder[a.grade] - gradeOrder[b.grade] || a.city.name.localeCompare(b.city.name);
    if (sort === 'name') return a.city.name.localeCompare(b.city.name);
    return b.city.pop - a.city.pop;
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Rankings ({total})
        </span>
        <div className="flex gap-1">
          {(['grade', 'pop', 'name'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                sort === key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {key === 'grade' ? 'Grade' : key === 'pop' ? 'Pop' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 space-y-0.5">
          {sort === 'grade'
            ? GRADES.filter((g) => sorted.some((e) => e.grade === g)).map((grade) => (
                <div key={grade}>
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold"
                    style={{ color: GRADE_COLORS[grade] }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: GRADE_COLORS[grade] }}
                    >
                      {grade}
                    </span>
                    {sorted.filter((e) => e.grade === grade).length} cities
                  </div>
                  {sorted
                    .filter((e) => e.grade === grade)
                    .map(({ id, city }) => (
                      <CityRow
                        key={id}
                        id={id}
                        city={city}
                        grade={grade}
                        selected={selectedCityId === id}
                        onSelect={() => { setSelectedCity(id); onFlyTo(id); }}
                        onRemove={() => setRanking(id, null)}
                        showGrade={false}
                      />
                    ))}
                </div>
              ))
            : sorted.map(({ id, city, grade }) => (
                <CityRow
                  key={id}
                  id={id}
                  city={city}
                  grade={grade}
                  selected={selectedCityId === id}
                  onSelect={() => { setSelectedCity(id); onFlyTo(id); }}
                  onRemove={() => setRanking(id, null)}
                  showGrade
                />
              ))}
          {total === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-8 text-center">
              No cities ranked yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function CityRow({
  id, city, grade, selected, onSelect, onRemove, showGrade,
}: {
  id: number;
  city: City;
  grade: Grade;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  showGrade: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors ${selected ? 'bg-accent' : ''}`}
      onClick={onSelect}
    >
      {showGrade && (
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ backgroundColor: GRADE_COLORS[grade] }}
        >
          {grade}
        </span>
      )}
      <span className="flex-1 min-w-0 text-sm truncate">
        {city.name}
        <span className="text-xs text-muted-foreground ml-1">{city.country}</span>
      </span>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatPop(city.pop)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 opacity-40 hover:opacity-100"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
