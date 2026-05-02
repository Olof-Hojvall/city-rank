import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/state/store';
import { RankPicker } from './RankPicker';
import type { City } from '@/data/cities';
import type { Grade } from '@/lib/grades';

type Props = {
  onFlyTo: (cityId: number) => void;
};

function formatPop(pop: number): string {
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)}K`;
  return String(pop);
}

export function SuggestedList({ onFlyTo }: Props) {
  const { viewportCities, rankings, setRanking, setSelectedCity, selectedCityId } = useStore();

  function handleRank(city: City, grade: Grade | null) {
    setRanking(city.id, grade);
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Suggested ({viewportCities.length})
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 space-y-0.5">
          {viewportCities.map((city) => (
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
                <span className="text-sm font-medium truncate">{city.name}</span>
                <span className="text-xs text-muted-foreground ml-1">{city.country}</span>
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                {formatPop(city.pop)}
              </span>
              <div
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              >
                <RankPicker
                  value={rankings[city.id] ?? null}
                  onChange={(g) => handleRank(city, g)}
                />
              </div>
            </div>
          ))}
          {viewportCities.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              No cities in this view
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
