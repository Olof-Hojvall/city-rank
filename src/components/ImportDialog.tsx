import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/state/store';
import { parseCSV, parseMarkdown, parseText } from '@/lib/export';
import type { City } from '@/data/cities';

type Tab = 'markdown' | 'csv' | 'text';

type Props = {
  cities: City[];
};

export function ImportDialog({ cities }: Props) {
  const { importRankings } = useStore();
  const [tab, setTab] = useState<Tab>('markdown');
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImport() {
    const parse = tab === 'csv' ? parseCSV : tab === 'markdown' ? parseMarkdown : parseText;
    const rankings = parse(text, cities);
    const count = Object.keys(rankings).length;
    importRankings(rankings);
    setResult(`Imported ${count} ranking${count !== 1 ? 's' : ''}.`);
    setTimeout(() => {
      setOpen(false);
      setText('');
      setResult(null);
    }, 1200);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string ?? '');
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setText(''); setResult(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Rankings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          {(['markdown', 'csv', 'text'] as Tab[]).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t === 'markdown' ? 'Markdown' : t === 'csv' ? 'CSV' : 'Plain text'}
            </Button>
          ))}
        </div>
        <textarea
          className="w-full bg-muted rounded p-3 text-xs font-mono resize-none h-48 outline-none"
          placeholder={`Paste ${tab === 'csv' ? 'CSV' : tab === 'markdown' ? 'Markdown' : 'plain text'} here…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2 justify-end mt-2">
          <input ref={fileRef} type="file" accept=".csv,.md,.txt" className="hidden" onChange={handleFile} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Load file
          </Button>
          <Button size="sm" disabled={!text.trim() || !!result} onClick={handleImport}>
            {result ?? 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
