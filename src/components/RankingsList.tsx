import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/state/store';
import { GRADES, GRADE_COLORS, type Grade } from '@/lib/grades';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { City } from '@/data/cities';

type Props = {
  cities: City[];
  onFlyTo: (cityId: number) => void;
};

export function RankingsList({ cities, onFlyTo }: Props) {
  const { rankings, setRanking, setSelectedCity, selectedCityId } = useStore();
  const cityMap = new Map(cities.map((c) => [c.id, c]));

  const grouped: Record<Grade, number[]> = {} as Record<Grade, number[]>;
  for (const g of GRADES) grouped[g] = [];
  for (const [idStr, grade] of Object.entries(rankings)) {
    grouped[grade].push(Number(idStr));
  }

  const total = Object.keys(rankings).length;

  return (
    <div className="flex flex-col min-h-0" style={{ maxHeight: '45%' }}>
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Your rankings ({total})
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 space-y-2">
          {GRADES.filter((g) => grouped[g].length > 0).map((grade) => (
            <div key={grade}>
              <div
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded"
                style={{ color: GRADE_COLORS[grade] }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: GRADE_COLORS[grade] }}
                >
                  {grade}
                </span>
                <span>{grouped[grade].length} cities</span>
              </div>
              {grouped[grade].map((id) => {
                const city = cityMap.get(id);
                if (!city) return null;
                return (
                  <div
                    key={id}
                    className={`flex items-center gap-2 rounded px-2 py-1 cursor-pointer hover:bg-accent transition-colors ${
                      selectedCityId === id ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedCity(id);
                      onFlyTo(id);
                    }}
                  >
                    <span className="flex-1 text-sm truncate">
                      {city.name}
                      <span className="text-xs text-muted-foreground ml-1">{city.country}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRanking(id, null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ))}
          {total === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              No cities ranked yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
