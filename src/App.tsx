import { useEffect, useRef, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { CityMap, type MapHandle } from '@/components/Map';
import { SuggestedList } from '@/components/SuggestedList';
import { ExportDialog } from '@/components/ExportDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { useStore } from '@/state/store';
import { loadCities } from '@/data/cities';
import type { City } from '@/data/cities';

export default function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'rated' | 'unrated'>('all');
  const mapRef = useRef<MapHandle>(null);
  const { hydrateFromHash, resetRankings } = useStore();

  useEffect(() => {
    hydrateFromHash();
    window.addEventListener('hashchange', hydrateFromHash);
    return () => window.removeEventListener('hashchange', hydrateFromHash);
  }, []);

  useEffect(() => {
    loadCities()
      .then(setCities)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  function handleFlyTo(cityId: number) {
    const city = cities.find((c) => c.id === cityId);
    if (city) mapRef.current?.flyTo(city);
  }

  function copyUrl() {
    navigator.clipboard.writeText(location.href).then(() => toast('URL copied to clipboard'));
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading cities…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-2 border-b shrink-0">
        <span className="font-bold text-lg tracking-tight">City Rank</span>
        <span className="text-xs text-muted-foreground">Rate cities A–F</span>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <CityMap ref={mapRef} cities={cities} hideUnrated={filter === 'rated'} />
        </div>

        <aside className="w-80 shrink-0 flex flex-col border-l overflow-hidden">
          <SuggestedList filter={filter} onFilterChange={setFilter} onFlyTo={handleFlyTo} />

          <div className="flex items-center gap-2 px-3 py-2 border-t shrink-0">
            <ExportDialog cities={cities} />
            <ImportDialog cities={cities} />
            <Button variant="outline" size="sm" onClick={copyUrl}>
              Copy URL
            </Button>
            <ResetDialog onReset={resetRankings} />
          </div>
        </aside>
      </div>

      <Toaster />
    </div>
  );
}

function ResetDialog({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          Reset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset all rankings?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will remove all your ranked cities. This cannot be undone unless you have the URL saved.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onReset(); setOpen(false); }}>
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
